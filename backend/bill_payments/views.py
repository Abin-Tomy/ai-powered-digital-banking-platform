from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.utils import timezone
from decimal import Decimal
from datetime import date, timedelta
from .models import BillerCategory, Biller, SavedBiller, Bill, BillPayment, RecurringBillPayment
from .serializers import (
    BillerCategorySerializer, BillerSerializer, SavedBillerCreateSerializer,
    SavedBillerSerializer, SavedBillerUpdateSerializer, BillSerializer,
    BillPaymentCreateSerializer, BillPaymentSerializer,
    RecurringBillPaymentCreateSerializer, RecurringBillPaymentSerializer,
    BillFetchSerializer, PaymentSummarySerializer
)
from users.permissions import IsCustomer, IsAdmin


class BillerCategoryListView(generics.ListAPIView):
    """List all active biller categories"""
    serializer_class = BillerCategorySerializer
    permission_classes = []  # Allow public access
    
    def get_queryset(self):
        return BillerCategory.objects.filter(is_active=True).prefetch_related('billers')


class BillerListView(generics.ListAPIView):
    """List all active billers, optionally filtered by category"""
    serializer_class = BillerSerializer
    permission_classes = []  # Allow public access
    
    def get_queryset(self):
        queryset = Biller.objects.filter(is_active=True).select_related('category')
        category_id = self.request.query_params.get('category', None)
        if category_id:
            queryset = queryset.filter(category_id=category_id)
        return queryset.order_by('category__sort_order', 'sort_order', 'name')


class BillerDetailView(generics.RetrieveAPIView):
    """Get detailed information about a specific biller"""
    serializer_class = BillerSerializer
    permission_classes = []  # Allow public access
    queryset = Biller.objects.filter(is_active=True).select_related('category')


class SavedBillerListView(generics.ListCreateAPIView):
    """List user's saved billers and create new ones"""
    permission_classes = [IsAuthenticated, IsCustomer]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return SavedBillerCreateSerializer
        return SavedBillerSerializer
    
    def get_queryset(self):
        return SavedBiller.objects.filter(user=self.request.user).select_related(
            'biller', 'biller__category'
        ).prefetch_related('bills')
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class SavedBillerDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete a saved biller"""
    permission_classes = [IsAuthenticated, IsCustomer]
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return SavedBillerUpdateSerializer
        return SavedBillerSerializer
    
    def get_queryset(self):
        return SavedBiller.objects.filter(user=self.request.user).select_related(
            'biller', 'biller__category'
        )


class BillListView(generics.ListAPIView):
    """List bills for user's saved billers"""
    serializer_class = BillSerializer
    permission_classes = [IsAuthenticated, IsCustomer]
    
    def get_queryset(self):
        queryset = Bill.objects.filter(
            saved_biller__user=self.request.user
        ).select_related('saved_biller', 'saved_biller__biller', 'saved_biller__biller__category')
        
        # Filter by saved biller
        saved_biller_id = self.request.query_params.get('saved_biller', None)
        if saved_biller_id:
            queryset = queryset.filter(saved_biller_id=saved_biller_id)
        
        # Filter by status
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filter by due date range
        due_from = self.request.query_params.get('due_from', None)
        due_to = self.request.query_params.get('due_to', None)
        if due_from:
            queryset = queryset.filter(due_date__gte=due_from)
        if due_to:
            queryset = queryset.filter(due_date__lte=due_to)
            
        return queryset.order_by('due_date')


class BillDetailView(generics.RetrieveAPIView):
    """Get detailed information about a specific bill"""
    serializer_class = BillSerializer
    permission_classes = [IsAuthenticated, IsCustomer]
    
    def get_queryset(self):
        return Bill.objects.filter(
            saved_biller__user=self.request.user
        ).select_related('saved_biller', 'saved_biller__biller')


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsCustomer])
def fetch_bills(request):
    """Fetch latest bills for a saved biller"""
    serializer = BillFetchSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        saved_biller_id = serializer.validated_data['saved_biller_id']
        serializer.validated_data['fetch_period_months']
        
        saved_biller = get_object_or_404(SavedBiller, id=saved_biller_id, user=request.user)
        
        # Simulate bill fetching (in real implementation, this would call biller API)
        bills_created = 0
        for i in range(2):  # Create 2 sample bills
            bill_date = date.today() - timedelta(days=30 * (i + 1))
            due_date = bill_date + timedelta(days=15)
            
            bill, created = Bill.objects.get_or_create(
                saved_biller=saved_biller,
                bill_date=bill_date,
                defaults={
                    'bill_number': f"BILL{saved_biller.customer_id}{bill_date.strftime('%Y%m')}",
                    'due_date': due_date,
                    'bill_amount': Decimal('1500.00') + (i * Decimal('200.00')),
                    'total_amount': Decimal('1500.00') + (i * Decimal('200.00')),
                    'outstanding_amount': Decimal('1500.00') + (i * Decimal('200.00')),
                    'status': 'OVERDUE' if due_date < date.today() else 'UNPAID'
                }
            )
            if created:
                bills_created += 1
        
        return Response({
            'message': f'Successfully fetched bills for {saved_biller.nickname}',
            'bills_created': bills_created
        }, status=status.HTTP_200_OK)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsCustomer])
def payment_summary(request):
    """Get payment summary before processing"""
    saved_biller_id = request.data.get('saved_biller_id')
    amount = request.data.get('amount')
    
    if not saved_biller_id or not amount:
        return Response(
            {'error': 'saved_biller_id and amount are required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        saved_biller = SavedBiller.objects.get(id=saved_biller_id, user=request.user)
        amount = Decimal(str(amount))
        
        convenience_fee = saved_biller.biller.calculate_convenience_fee(amount)
        total_amount = amount + convenience_fee
        
        processing_time = "Instant" if saved_biller.biller.is_instant_payment else f"{saved_biller.biller.processing_time_hours} hours"
        
        summary_data = {
            'amount': amount,
            'convenience_fee': convenience_fee,
            'total_amount': total_amount,
            'processing_time': processing_time,
            'payment_mode': request.data.get('payment_mode', 'ACCOUNT')
        }
        
        serializer = PaymentSummarySerializer(summary_data)
        return Response(serializer.data, status=status.HTTP_200_OK)
        
    except SavedBiller.DoesNotExist:
        return Response(
            {'error': 'Saved biller not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception:
        return Response(
            {'error': 'An unexpected error occurred.'},
            status=status.HTTP_400_BAD_REQUEST
        )


class BillPaymentListView(generics.ListCreateAPIView):
    """List user's bill payments and create new ones"""
    permission_classes = [IsAuthenticated, IsCustomer]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return BillPaymentCreateSerializer
        return BillPaymentSerializer
    
    def get_queryset(self):
        queryset = BillPayment.objects.filter(user=self.request.user).select_related(
            'saved_biller', 'saved_biller__biller', 'bill'
        )
        
        # Filter by status
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filter by payment mode
        mode_filter = self.request.query_params.get('payment_mode', None)
        if mode_filter:
            queryset = queryset.filter(payment_mode=mode_filter)
        
        # Filter by date range
        date_from = self.request.query_params.get('date_from', None)
        date_to = self.request.query_params.get('date_to', None)
        if date_from:
            queryset = queryset.filter(initiated_at__date__gte=date_from)
        if date_to:
            queryset = queryset.filter(initiated_at__date__lte=date_to)
            
        return queryset.order_by('-initiated_at')
    
    def perform_create(self, serializer):
        saved_biller = serializer.validated_data['saved_biller']
        amount = serializer.validated_data['amount']
        
        # Calculate convenience fee
        convenience_fee = saved_biller.biller.calculate_convenience_fee(amount)
        total_amount = amount + convenience_fee
        
        # Create payment
        payment = serializer.save(
            user=self.request.user,
            convenience_fee=convenience_fee,
            total_amount=total_amount,
            status='COMPLETED'  # Simulate instant processing
        )
        
        # Update bill if specified
        if payment.bill:
            payment.bill.paid_amount += amount
            payment.bill.save()


class BillPaymentDetailView(generics.RetrieveAPIView):
    """Get detailed information about a specific bill payment"""
    serializer_class = BillPaymentSerializer
    permission_classes = [IsAuthenticated, IsCustomer]
    
    def get_queryset(self):
        return BillPayment.objects.filter(user=self.request.user).select_related(
            'saved_biller', 'saved_biller__biller', 'bill'
        )


class RecurringBillPaymentListView(generics.ListCreateAPIView):
    """List user's recurring bill payments and create new ones"""
    permission_classes = [IsAuthenticated, IsCustomer]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return RecurringBillPaymentCreateSerializer
        return RecurringBillPaymentSerializer
    
    def get_queryset(self):
        return RecurringBillPayment.objects.filter(user=self.request.user).select_related(
            'saved_biller', 'saved_biller__biller'
        ).order_by('next_execution_date')
    
    def perform_create(self, serializer):
        serializer.save(
            user=self.request.user,
            next_execution_date=serializer.validated_data['start_date']
        )


class RecurringBillPaymentDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete a recurring bill payment"""
    serializer_class = RecurringBillPaymentSerializer
    permission_classes = [IsAuthenticated, IsCustomer]
    
    def get_queryset(self):
        return RecurringBillPayment.objects.filter(user=self.request.user).select_related(
            'saved_biller', 'saved_biller__biller'
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsCustomer])
def pause_recurring_payment(request, pk):
    """Pause a recurring bill payment"""
    recurring_payment = get_object_or_404(
        RecurringBillPayment, id=pk, user=request.user
    )
    
    if recurring_payment.status == 'ACTIVE':
        recurring_payment.status = 'SUSPENDED'
        recurring_payment.save()
        return Response({
            'message': 'Recurring payment paused successfully'
        }, status=status.HTTP_200_OK)
    
    return Response({
        'error': 'Can only pause active recurring payments'
    }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsCustomer])
def resume_recurring_payment(request, pk):
    """Resume a paused recurring bill payment"""
    recurring_payment = get_object_or_404(
        RecurringBillPayment, id=pk, user=request.user
    )
    
    if recurring_payment.status == 'SUSPENDED':
        recurring_payment.status = 'ACTIVE'
        recurring_payment.save()
        return Response({
            'message': 'Recurring payment resumed successfully'
        }, status=status.HTTP_200_OK)
    
    return Response({
        'error': 'Can only resume suspended recurring payments'
    }, status=status.HTTP_400_BAD_REQUEST)


# Admin Views
class AdminBillPaymentListView(generics.ListAPIView):
    """Admin view to list all bill payments"""
    serializer_class = BillPaymentSerializer
    permission_classes = [IsAuthenticated, IsAdmin]
    
    def get_queryset(self):
        return BillPayment.objects.all().select_related(
            'user', 'saved_biller', 'saved_biller__biller', 'bill'
        ).order_by('-initiated_at')


class AdminRecurringPaymentListView(generics.ListAPIView):
    """Admin view to list all recurring payments"""
    serializer_class = RecurringBillPaymentSerializer
    permission_classes = [IsAuthenticated, IsAdmin]
    
    def get_queryset(self):
        return RecurringBillPayment.objects.all().select_related(
            'user', 'saved_biller', 'saved_biller__biller'
        ).order_by('-created_at')


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsCustomer])
def bill_payment_dashboard(request):
    """Dashboard data for bill payments"""
    user = request.user
    
    # Get counts
    saved_billers_count = SavedBiller.objects.filter(user=user).count()
    pending_bills_count = Bill.objects.filter(
        saved_biller__user=user, 
        status__in=['UNPAID', 'OVERDUE']
    ).count()
    recent_payments_count = BillPayment.objects.filter(
        user=user,
        initiated_at__gte=timezone.now() - timedelta(days=30)
    ).count()
    active_recurring_count = RecurringBillPayment.objects.filter(
        user=user,
        status='ACTIVE'
    ).count()
    
    # Get recent bills
    recent_bills = Bill.objects.filter(
        saved_biller__user=user,
        status__in=['UNPAID', 'OVERDUE']
    ).select_related('saved_biller', 'saved_biller__biller')[:5]
    
    # Get recent payments
    recent_payments = BillPayment.objects.filter(
        user=user
    ).select_related('saved_biller', 'saved_biller__biller')[:5]
    
    return Response({
        'summary': {
            'saved_billers_count': saved_billers_count,
            'pending_bills_count': pending_bills_count,
            'recent_payments_count': recent_payments_count,
            'active_recurring_count': active_recurring_count
        },
        'recent_bills': BillSerializer(recent_bills, many=True).data,
        'recent_payments': BillPaymentSerializer(recent_payments, many=True).data
    }, status=status.HTTP_200_OK)
