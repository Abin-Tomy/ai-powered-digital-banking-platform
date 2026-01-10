import uuid
from decimal import Decimal

from django.db import transaction as db_transaction
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from accounts.models import Account
from .models import Transaction, IdempotencyKey
from .serializers import TransactionSerializer
from .services import get_account_balance

from fraud.ai_service import predict_fraud
from fraud.models import FraudFlag

from django.utils.dateparse import parse_date



class TransferView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):

        if request.user.is_locked or not request.user.is_active:
            return Response(
                {"detail": "User account is not allowed to perform transactions"},
                status=status.HTTP_403_FORBIDDEN
            )
        from_account_id = request.data.get('from_account')
        to_account_number = request.data.get('to_account_number')
        try:
            amount = Decimal(request.data.get("amount"))
        except:
            return Response({"detail": "Invalid amount format"}, status=400)
        
        idempotency_key = request.headers.get('Idempotency-Key')

        if amount <= 0:
            return Response({"detail": "Invalid amount"}, status=400)

        if not idempotency_key:
            return Response({"detail": "Idempotency-Key required"}, status=400)

        if IdempotencyKey.objects.filter(
            key=idempotency_key,
            user=request.user
        ).exists():
            return Response(
                {"detail": "Duplicate request"},
                status=status.HTTP_409_CONFLICT
            )

        try:
            from_account = Account.objects.get(id=from_account_id)
            to_account = Account.objects.get(account_number=to_account_number)
        except Account.DoesNotExist:
            return Response({"detail": "Account not found"}, status=404)
        
        # FIX 3: Prevent self-transfer to same account
        if from_account.id == to_account.id:
            return Response(
                {"detail": "Cannot transfer to the same account"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # FIX 4: Only ACTIVE accounts can transact
        if from_account.status != "ACTIVE":
            return Response(
                {"detail": "Source account is not active"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if to_account.status != "ACTIVE":
            return Response(
                {"detail": "Destination account is not active"},
                status=status.HTTP_400_BAD_REQUEST
        )

        if from_account.owner != request.user:
            return Response(status=403)

        balance = get_account_balance(from_account)
        if balance < amount:
            return Response({"detail": "Insufficient balance"}, status=400)

        reference = str(uuid.uuid4())

        with db_transaction.atomic():
            IdempotencyKey.objects.create(
                key=idempotency_key,
                user=request.user
            )

            debit = Transaction.objects.create(
                account=from_account,
                amount=amount,
                type='DEBIT',
                reference=reference,
                description=f"Transfer to {to_account.account_number}"
            )

            credit = Transaction.objects.create(
                account=to_account,
                amount=amount,
                type='CREDIT',
                reference=reference,
                description=f"Transfer from {from_account.account_number}"
            )

            # ===== AI FRAUD DETECTION =====
            try:
                fraud_result = predict_fraud(debit)
                if fraud_result["is_fraud"]:
                    FraudFlag.objects.create(
                        transaction=debit,
                        risk_score=fraud_result["risk_score"],
                        reasons=[fraud_result["reason"]]
                    )
            except Exception:
                pass

        return Response({
            "reference": reference,
            "debit": TransactionSerializer(debit).data,
            "credit": TransactionSerializer(credit).data,
        }, status=201)

class AccountTransactionsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, account_id):
        try:
            account = Account.objects.get(id=account_id)
        except Account.DoesNotExist:
            return Response(status=404)

        if account.owner != request.user:
            return Response(status=403)

        txns = Transaction.objects.filter(account=account)
        serializer = TransactionSerializer(txns, many=True)
        return Response(serializer.data)


class AccountBalanceView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, account_id):
        try:
            account = Account.objects.get(id=account_id)
        except Account.DoesNotExist:
            return Response(status=404)

        if account.owner != request.user:
            return Response(status=403)

        balance = get_account_balance(account)
        return Response({"balance": balance})
    
class DepositView(APIView):
    """
    Admin deposits money into an account (funding)
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.user.role != "ADMIN":
            return Response(
                {"detail": "Only admin can fund accounts"},
                status=status.HTTP_403_FORBIDDEN
            )

        account_id = request.data.get("account_id")
        amount = Decimal(request.data.get("amount", 0))

        if amount <= 0:
            return Response(
                {"detail": "Invalid amount"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            account = Account.objects.get(id=account_id)
        except Account.DoesNotExist:
            return Response(
                {"detail": "Account not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        if account.status != "ACTIVE":
            return Response(
                {"detail": "Account not active"},
                status=status.HTTP_400_BAD_REQUEST
            )

        with db_transaction.atomic():
            txn = Transaction.objects.create(
                account=account,
                amount=amount,
                type="CREDIT",
                reference=str(uuid.uuid4()),
                description="Admin deposit"
            )

        return Response(
            {
                "message": "Account funded successfully",
                "transaction": TransactionSerializer(txn).data
            },
            status=status.HTTP_201_CREATED
        )


class AccountStatementView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, account_id):
        try:
            account = Account.objects.get(id=account_id)
        except Account.DoesNotExist:
            return Response(status=404)

        if account.owner != request.user:
            return Response(status=403)

        start_date = request.query_params.get("from")
        end_date = request.query_params.get("to")

        if not start_date or not end_date:
            return Response(
                {"detail": "from and to dates are required (YYYY-MM-DD)"},
                status=400
            )

        start = parse_date(start_date)
        end = parse_date(end_date)

        if not start or not end or start > end:
            return Response(
                {"detail": "Invalid date range"},
                status=400
            )

        # ✅ Transactions BEFORE start date → opening balance
        before_txns = Transaction.objects.filter(
            account=account,
            created_at__date__lt=start,
            status="SUCCESS"
        )

        opening_balance = sum(
            t.amount if t.type == "CREDIT" else -t.amount
            for t in before_txns
        )

        # ✅ Transactions WITHIN period
        period_txns = Transaction.objects.filter(
            account=account,
            created_at__date__range=(start, end),
            status="SUCCESS"
        ).order_by("created_at")

        period_delta = sum(
            t.amount if t.type == "CREDIT" else -t.amount
            for t in period_txns
        )

        closing_balance = opening_balance + period_delta

        serializer = TransactionSerializer(period_txns, many=True)

        return Response({
            "account_number": account.account_number,
            "from": start_date,
            "to": end_date,
            "opening_balance": opening_balance,
            "closing_balance": closing_balance,
            "transactions": serializer.data
        })