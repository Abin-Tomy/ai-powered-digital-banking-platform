from rest_framework.generics import ListAPIView
from .models import Account
from .serializers import AccountSerializer
from users.permissions import IsCustomer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db import transaction as db_transaction

from .models import Account
from .serializers import AccountFundingSerializer
from transactions.models import Transaction
from users.permissions import IsAdmin

class AccountListView(ListAPIView):
    serializer_class = AccountSerializer
    permission_classes = [IsCustomer]

    def get_queryset(self):
        return Account.objects.filter(owner=self.request.user)
    

class AdminAccountFundingView(APIView):
    """
    Admin-only system funding of customer accounts.
    """
    permission_classes = [IsAdmin]

    def post(self, request):
        serializer = AccountFundingSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        account_number = serializer.validated_data["account_number"]
        amount = serializer.validated_data["amount"]

        try:
            account = Account.objects.get(
                account_number=account_number,
                status="ACTIVE"
            )
        except Account.DoesNotExist:
            return Response(
                {"detail": "Invalid or inactive account."},
                status=status.HTTP_400_BAD_REQUEST
            )

        with db_transaction.atomic():
            account.balance += amount
            account.save()

            Transaction.objects.create(
                source_account=None,
                destination_account=account,
                transaction_type="CREDIT",
                amount=amount,
                status="COMPLETED"
            )

        return Response(
            {"message": "Account funded successfully."},
            status=status.HTTP_200_OK
        )
