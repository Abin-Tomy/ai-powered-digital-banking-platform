from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db import transaction
from django.db import models
from decimal import Decimal
from .models import CreditCardType, CreditCardApplication, CreditCard, CreditCardTransaction, CreditCardStatement
from .serializers import (
    CreditCardTypeSerializer, CreditCardApplicationCreateSerializer, CreditCardApplicationSerializer,
    CreditCardApplicationUpdateSerializer, CreditCardSerializer, CreditCardCreationSerializer,
    CreditCardTransactionSerializer, CreditCardTransactionCreateSerializer,
    CreditCardStatementSerializer, CreditCardPaymentSerializer
)
from users.permissions import IsCustomer, IsAdmin
from rest_framework import serializers


class CreditCardTypeListView(generics.ListAPIView):
    """Get all active credit card types"""
    serializer_class = CreditCardTypeSerializer
    permission_classes = []  # Allow public access

    def get_queryset(self):
        return CreditCardType.objects.filter(is_active=True)


class CreditCardApplicationCreateView(generics.CreateAPIView):
    """Create a new credit card application"""
    serializer_class = CreditCardApplicationCreateSerializer
    permission_classes = [IsAuthenticated, IsCustomer]

    def perform_create(self, serializer):
        # Check if user already has a pending application for the same card type
        card_type = serializer.validated_data['card_type']
        existing_application = CreditCardApplication.objects.filter(
            user=self.request.user,
            card_type=card_type,
            status__in=['PENDING', 'UNDER_REVIEW']
        ).exists()

        if existing_application:
            raise serializers.ValidationError(
                f"You already have a pending application for {card_type.name}"
            )

        serializer.save(user=self.request.user)


class CreditCardApplicationListView(generics.ListAPIView):
    """List credit card applications"""
    serializer_class = CreditCardApplicationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if hasattr(self.request.user, 'role') and self.request.user.role == 'ADMIN':
            return CreditCardApplication.objects.all()
        return CreditCardApplication.objects.filter(user=self.request.user)


class CreditCardApplicationDetailView(generics.RetrieveUpdateAPIView):
    """Get or update credit card application"""
    serializer_class = CreditCardApplicationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if hasattr(self.request.user, 'role') and self.request.user.role == 'ADMIN':
            return CreditCardApplication.objects.all()
        return CreditCardApplication.objects.filter(user=self.request.user)

    def get_serializer_class(self):
        if self.request.method == 'PATCH':
            if hasattr(self.request.user, 'role') and self.request.user.role == 'ADMIN':
                return CreditCardApplicationUpdateSerializer
        return CreditCardApplicationSerializer

    def perform_update(self, serializer):
        # Only admins can update applications
        if not (hasattr(self.request.user, 'role') and self.request.user.role == 'ADMIN'):
            raise PermissionDenied("Only administrators can update applications")

        instance = serializer.save(
            reviewed_by=self.request.user,
            reviewed_at=timezone.now()
        )

        # If approved, create the credit card
        if instance.status == 'APPROVED' and not hasattr(instance, 'creditcard'):
            self.create_credit_card(instance)

    def create_credit_card(self, application):
        """Create credit card after approval"""
        with transaction.atomic():
            credit_card = CreditCard.objects.create(
                user=application.user,
                card_type=application.card_type,
                application=application,
                cardholder_name=application.user.get_full_name(),
                credit_limit=application.approved_credit_limit,
                available_credit=application.approved_credit_limit
            )
            # Store the card for one-time response
            self._created_card = credit_card
            return credit_card

    def update(self, request, *args, **kwargs):
        response = super().update(request, *args, **kwargs)
        # If a card was just created, return the full card number once
        if hasattr(self, '_created_card'):
            creation_data = CreditCardCreationSerializer(self._created_card).data
            response.data['created_card'] = creation_data
        return response


class CreditCardListView(generics.ListAPIView):
    """List user's credit cards"""
    serializer_class = CreditCardSerializer
    permission_classes = [IsAuthenticated, IsCustomer]

    def get_queryset(self):
        return CreditCard.objects.filter(user=self.request.user)


class CreditCardDetailView(generics.RetrieveUpdateAPIView):
    """Get or update credit card details"""
    permission_classes = [IsAuthenticated, IsCustomer]

    def get_queryset(self):
        return CreditCard.objects.filter(user=self.request.user)

    def get_serializer_class(self):
        # Use standard serializer — never exposes full card number
        return CreditCardSerializer


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsCustomer])
def credit_card_payment(request, card_id):
    """Make a payment towards credit card"""
    credit_card = get_object_or_404(CreditCard, id=card_id, user=request.user)
    
    serializer = CreditCardPaymentSerializer(data=request.data)
    if serializer.is_valid():
        amount = serializer.validated_data['amount']
        payment_method = serializer.validated_data['payment_method']
        remarks = serializer.validated_data.get('remarks', '')

        # Validate payment amount
        outstanding_balance = credit_card.outstanding_balance
        if amount > outstanding_balance:
            return Response(
                {"error": f"Payment amount cannot exceed outstanding balance of ₹{outstanding_balance:,.2f}"},
                status=status.HTTP_400_BAD_REQUEST
            )

        with transaction.atomic():
            # Create payment transaction
            payment_transaction = CreditCardTransaction.objects.create(
                credit_card=credit_card,
                transaction_type='PAYMENT',
                amount=amount,
                description=f"Payment via {payment_method} - {remarks}".strip(' - '),
                merchant_name='Credit Card Payment',
                merchant_category='Payment'
            )

            # Update minimum due if payment covers it
            if credit_card.minimum_due > 0:
                if amount >= credit_card.minimum_due:
                    credit_card.minimum_due = max(0, credit_card.minimum_due - amount)
                else:
                    credit_card.minimum_due -= amount
                credit_card.save()

        return Response({
            "message": "Payment successful",
            "transaction_id": payment_transaction.id,
            "new_outstanding_balance": credit_card.outstanding_balance,
            "new_available_credit": credit_card.available_credit
        }, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CreditCardTransactionListView(generics.ListCreateAPIView):
    """List credit card transactions or create new transaction"""
    serializer_class = CreditCardTransactionSerializer
    permission_classes = [IsAuthenticated, IsCustomer]

    def get_queryset(self):
        card_id = self.kwargs.get('card_id')
        if card_id:
            # Get transactions for specific card
            return CreditCardTransaction.objects.filter(
                credit_card__id=card_id,
                credit_card__user=self.request.user
            )
        # Get all user's credit card transactions
        return CreditCardTransaction.objects.filter(credit_card__user=self.request.user)

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CreditCardTransactionCreateSerializer
        return CreditCardTransactionSerializer


class CreditCardStatementListView(generics.ListAPIView):
    """List credit card statements"""
    serializer_class = CreditCardStatementSerializer
    permission_classes = [IsAuthenticated, IsCustomer]

    def get_queryset(self):
        card_id = self.kwargs.get('card_id')
        if card_id:
            return CreditCardStatement.objects.filter(
                credit_card__id=card_id,
                credit_card__user=self.request.user
            )
        return CreditCardStatement.objects.filter(credit_card__user=self.request.user)


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsCustomer])
def block_credit_card(request, card_id):
    """Block a credit card"""
    credit_card = get_object_or_404(CreditCard, id=card_id, user=request.user)
    
    if credit_card.status == 'BLOCKED':
        return Response({"error": "Card is already blocked"}, status=status.HTTP_400_BAD_REQUEST)
    
    if credit_card.status != 'ACTIVE':
        return Response({"error": "Only active cards can be blocked"}, status=status.HTTP_400_BAD_REQUEST)
    
    credit_card.status = 'BLOCKED'
    credit_card.save()
    
    return Response({
        "message": "Credit card has been blocked successfully",
        "card_number": credit_card.masked_card_number
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsCustomer])
def unblock_credit_card(request, card_id):
    """Unblock a credit card"""
    credit_card = get_object_or_404(CreditCard, id=card_id, user=request.user)
    
    if credit_card.status != 'BLOCKED':
        return Response({"error": "Card is not blocked"}, status=status.HTTP_400_BAD_REQUEST)
    
    credit_card.status = 'ACTIVE'
    credit_card.save()
    
    return Response({
        "message": "Credit card has been unblocked successfully",
        "card_number": credit_card.masked_card_number
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsCustomer])
def set_credit_card_pin(request, card_id):
    """Set or change credit card PIN"""
    credit_card = get_object_or_404(CreditCard, id=card_id, user=request.user)
    
    pin = request.data.get('pin')
    if not pin or len(pin) != 4 or not pin.isdigit():
        return Response({"error": "PIN must be 4 digits"}, status=status.HTTP_400_BAD_REQUEST)
    
    if credit_card.status != 'ACTIVE':
        return Response({"error": "Card must be active to set PIN"}, status=status.HTTP_400_BAD_REQUEST)
    
    # In a real system, PIN would be encrypted/hashed
    credit_card.pin_set = True
    credit_card.save()
    
    return Response({
        "message": "PIN has been set successfully",
        "card_number": credit_card.masked_card_number
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsCustomer])
def credit_card_rewards(request, card_id):
    """Get credit card reward points details"""
    credit_card = get_object_or_404(CreditCard, id=card_id, user=request.user)
    
    # Calculate total points earned from transactions
    total_earned = CreditCardTransaction.objects.filter(
        credit_card=credit_card,
        transaction_type='PURCHASE',
        status='COMPLETED'
    ).aggregate(total=models.Sum('reward_points_earned'))['total'] or 0
    
    return Response({
        "card_number": credit_card.masked_card_number,
        "current_points": credit_card.reward_points,
        "points_per_100": credit_card.card_type.reward_points_per_100,
        "total_earned": total_earned,
        "redemption_options": {
            "cash_back": {
                "minimum_points": 1000,
                "conversion_rate": "100 points = ₹25"
            },
            "vouchers": {
                "minimum_points": 500,
                "conversion_rate": "Various merchants"
            }
        }
    }, status=status.HTTP_200_OK)


# Admin Views
class AdminCreditCardListView(generics.ListAPIView):
    """Admin view to list all credit cards"""
    queryset = CreditCard.objects.all()
    serializer_class = CreditCardSerializer
    permission_classes = [IsAuthenticated, IsAdmin]


class AdminCreditCardApplicationListView(generics.ListAPIView):
    """Admin view to list all credit card applications"""
    queryset = CreditCardApplication.objects.all()
    serializer_class = CreditCardApplicationSerializer
    permission_classes = [IsAuthenticated, IsAdmin]
