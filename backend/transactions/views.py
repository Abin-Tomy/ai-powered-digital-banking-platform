from rest_framework.generics import ListAPIView
from .models import Transaction
from .serializers import TransactionSerializer
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.db import transaction
from django.db import transaction as db_transaction
from django.db.models import Q
from accounts.models import Account
from .serializers import FundTransferSerializer


class TransactionListView(ListAPIView):
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer
from rest_framework.generics import ListAPIView
from .models import Transaction
from .serializers import TransactionSerializer
from users.permissions import IsCustomer

class TransactionListView(ListAPIView):
    serializer_class = TransactionSerializer
    permission_classes = [IsCustomer]

    def get_queryset(self):
        user = self.request.user

        return Transaction.objects.filter(
            Q(source_account__owner=user) |
            Q(destination_account__owner=user)
        ).order_by('-created_at')
    
class FundTransferView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user

        # Only customers can transfer funds
        if user.role != "CUSTOMER":
            return Response(
                {"detail": "Only customers can perform fund transfers."},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = FundTransferSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        from_acc_no = serializer.validated_data["from_account"]
        to_acc_no = serializer.validated_data["to_account"]
        amount = serializer.validated_data["amount"]

        try:
            from_account = Account.objects.get(
                account_number=from_acc_no,
                owner=user,
                status="ACTIVE"
            )
        except Account.DoesNotExist:
            return Response(
                {"detail": "Invalid or inactive source account."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            to_account = Account.objects.get(
                account_number=to_acc_no,
                status="ACTIVE"
            )
        except Account.DoesNotExist:
            return Response(
                {"detail": "Invalid or inactive destination account."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if from_account.balance < amount:
            return Response(
                {"detail": "Insufficient balance."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Atomic transfer
        with db_transaction.atomic():
            # Deduct & credit
            from_account.balance -= amount
            to_account.balance += amount

            from_account.save()
            to_account.save()

            Transaction.objects.create(
                source_account=from_account,
                destination_account=to_account,
                transaction_type="TRANSFER",
                amount=amount,
                status="COMPLETED"
            )

        return Response(
            {"message": "Fund transfer completed successfully."},
            status=status.HTTP_200_OK
        )
