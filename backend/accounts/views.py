from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from .models import Account
from .serializers import AccountSerializer
from .utils import generate_account_number


class CreateAccountView(APIView):
    """
    Admin/System creates accounts
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.user.role != "ADMIN":
            return Response(
                {"detail": "Not allowed"},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = AccountSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        owner_id = request.data.get("owner_id")
        account_type = serializer.validated_data["account_type"]

        # ✅ Enforce one SAVINGS account per customer (ONLY ONCE)
        if account_type == "SAVINGS":
            if Account.objects.filter(
                owner_id=owner_id,
                account_type="SAVINGS",
                status__in=["ACTIVE", "FROZEN"]
            ).exists():
                return Response(
                    {"detail": "Customer already has a savings account"},
                    status=status.HTTP_400_BAD_REQUEST
                )

        # ✅ Create account ONCE
        account = Account.objects.create(
            owner_id=owner_id,
            account_type=account_type,
            account_number=generate_account_number()
        )

        return Response(
            AccountSerializer(account).data,
            status=status.HTTP_201_CREATED
        )

class MyAccountsView(APIView):
    """
    Customer views own accounts
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        accounts = Account.objects.filter(owner=request.user)
        serializer = AccountSerializer(accounts, many=True)
        return Response(serializer.data)


class AccountDetailView(APIView):
    """
    Owner-only account view
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, account_id):
        try:
            account = Account.objects.get(id=account_id)
        except Account.DoesNotExist:
            return Response(status=404)

        if account.owner != request.user:
            return Response(status=403)

        serializer = AccountSerializer(account)
        return Response(serializer.data)

class AccountStatusUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, account_id):
        if request.user.role != "ADMIN":
            return Response(status=403)

        new_status = request.data.get("status")
        if new_status not in ["ACTIVE", "FROZEN", "CLOSED"]:
            return Response(
                {"detail": "Invalid status"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            account = Account.objects.get(id=account_id)
        except Account.DoesNotExist:
            return Response(status=404)

        account.status = new_status
        account.save()

        return Response(AccountSerializer(account).data)

class AllAccountsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != "ADMIN":
            return Response(status=403)

        accounts = Account.objects.all()
        return Response(AccountSerializer(accounts, many=True).data)
