from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from drf_spectacular.utils import extend_schema

from .models import User, Notification
from accounts.models import Account
from transactions.models import Transaction
from transactions.services import get_account_balance
from loans.models import LoanApplication, Loan
from fraud.models import FraudFlag
from credit_cards.models import CreditCard


@extend_schema(tags=['admin'])
class Customer360View(APIView):
    """Support/Admin: comprehensive view of a customer's profile and activity."""
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id):
        if request.user.role not in ('ADMIN', 'SUPPORT'):
            return Response({'detail': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)

        try:
            customer = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({'detail': 'Customer not found'}, status=status.HTTP_404_NOT_FOUND)

        # Accounts with balances
        accounts = Account.objects.filter(owner=customer)
        accounts_data = []
        for acc in accounts:
            balance = get_account_balance(acc)
            accounts_data.append({
                'id': str(acc.id),
                'account_number': acc.account_number,
                'account_type': acc.account_type,
                'status': acc.status,
                'balance': float(balance),
                'created_at': acc.created_at.isoformat() if hasattr(acc, 'created_at') else None,
            })

        # Recent transactions (last 20)
        account_ids = accounts.values_list('id', flat=True)
        recent_transactions = Transaction.objects.filter(account_id__in=account_ids).order_by('-created_at')[:20]
        transactions_data = [
            {
                'id': str(t.id),
                'amount': float(t.amount),
                'type': t.type,
                'description': t.description,
                'status': t.status,
                'created_at': t.created_at.isoformat(),
            }
            for t in recent_transactions
        ]

        # Loan applications
        loan_apps = LoanApplication.objects.filter(applicant=customer).select_related('loan_type')
        loans_data = [
            {
                'id': str(la.id),
                'loan_type': la.loan_type.name,
                'requested_amount': float(la.requested_amount),
                'status': la.status,
                'applied_at': la.applied_at.isoformat(),
            }
            for la in loan_apps
        ]

        # Active loans
        active_loans = Loan.objects.filter(borrower=customer)
        active_loans_data = [
            {
                'id': str(ln.id),
                'principal_amount': float(ln.principal_amount),
                'outstanding_balance': float(ln.outstanding_balance),
                'monthly_emi': float(ln.monthly_emi),
                'status': ln.status,
            }
            for ln in active_loans
        ]

        # Fraud flags
        fraud_flags = FraudFlag.objects.filter(transaction__account_id__in=account_ids)
        fraud_data = [
            {
                'id': str(f.id),
                'risk_score': float(f.risk_score),
                'status': f.status,
                'reasons': f.reasons,
                'created_at': f.created_at.isoformat(),
            }
            for f in fraud_flags
        ]

        # Credit cards
        credit_cards = CreditCard.objects.filter(user=customer)
        cards_data = [
            {
                'id': str(c.id),
                'last_four': c.last_four,
                'credit_limit': float(c.credit_limit),
                'available_credit': float(c.available_credit),
                'status': c.status,
            }
            for c in credit_cards
        ]

        # Recent notifications
        notifications = Notification.objects.filter(user=customer)[:10]
        notif_data = [
            {
                'id': n.id,
                'type': n.notification_type,
                'title': n.title,
                'message': n.message,
                'is_read': n.is_read,
                'created_at': n.created_at.isoformat(),
            }
            for n in notifications
        ]

        return Response({
            'customer': {
                'id': customer.id,
                'email': customer.email,
                'full_name': customer.full_name,
                'role': customer.role,
                'is_active': customer.is_active,
                'is_verified': customer.is_verified,
                'is_locked': customer.is_locked,
                'date_joined': customer.date_joined.isoformat(),
            },
            'accounts': accounts_data,
            'recent_transactions': transactions_data,
            'loan_applications': loans_data,
            'active_loans': active_loans_data,
            'fraud_flags': fraud_data,
            'credit_cards': cards_data,
            'recent_notifications': notif_data,
        })
