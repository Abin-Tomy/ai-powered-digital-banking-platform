from datetime import timedelta

from django.db.models import Sum, Count
from django.db.models.functions import TruncDate
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from users.models import User
from users.permissions import IsAdmin
from accounts.models import Account
from transactions.models import Transaction
from transactions.services import get_account_balance
from loans.models import LoanApplication
from fraud.models import FraudFlag


class AdminAnalyticsView(APIView):
    """Comprehensive analytics endpoint for the admin dashboard."""
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        now = timezone.now()
        thirty_days_ago = now - timedelta(days=30)

        # ── KPI cards ──
        total_users = User.objects.count()
        total_accounts = Account.objects.count()
        total_transactions = Transaction.objects.count()
        total_fraud_alerts = FraudFlag.objects.count()
        pending_loans = LoanApplication.objects.filter(status='PENDING').count()
        active_accounts = Account.objects.filter(status='ACTIVE').count()

        # Total deposits
        total_deposits = Transaction.objects.filter(
            type='CREDIT',
        ).aggregate(total=Sum('amount'))['total'] or 0

        # ── Daily transaction volumes (last 30 days) ──
        daily_transactions = (
            Transaction.objects
            .filter(created_at__gte=thirty_days_ago)
            .annotate(date=TruncDate('created_at'))
            .values('date')
            .annotate(count=Count('id'), volume=Sum('amount'))
            .order_by('date')
        )
        daily_transactions_list = [
            {'date': str(d['date']), 'count': d['count'], 'volume': float(d['volume'] or 0)}
            for d in daily_transactions
        ]

        # ── User registrations (last 30 days) ──
        daily_registrations = (
            User.objects
            .filter(date_joined__gte=thirty_days_ago)
            .annotate(date=TruncDate('date_joined'))
            .values('date')
            .annotate(count=Count('id'))
            .order_by('date')
        )
        daily_registrations_list = [
            {'date': str(d['date']), 'count': d['count']}
            for d in daily_registrations
        ]

        # ── Loan status breakdown ──
        loan_status_breakdown = (
            LoanApplication.objects
            .values('status')
            .annotate(count=Count('id'))
        )
        loan_status_list = [
            {'status': d['status'], 'count': d['count']}
            for d in loan_status_breakdown
        ]

        # ── Fraud trend (last 30 days) ──
        fraud_trend = (
            FraudFlag.objects
            .filter(created_at__gte=thirty_days_ago)
            .annotate(date=TruncDate('created_at'))
            .values('date')
            .annotate(count=Count('id'))
            .order_by('date')
        )
        fraud_trend_list = [
            {'date': str(d['date']), 'count': d['count']}
            for d in fraud_trend
        ]

        # ── Top 5 accounts by balance ──
        top_accounts = []
        for account in Account.objects.filter(status='ACTIVE').select_related('owner')[:10]:
            balance = get_account_balance(account)
            top_accounts.append({
                'account_number': account.account_number[-4:],
                'owner': account.owner.full_name,
                'balance': float(balance),
                'type': account.account_type,
            })
        top_accounts.sort(key=lambda x: x['balance'], reverse=True)
        top_accounts = top_accounts[:5]

        return Response({
            'kpis': {
                'total_users': total_users,
                'total_accounts': total_accounts,
                'total_transactions': total_transactions,
                'total_fraud_alerts': total_fraud_alerts,
                'pending_loans': pending_loans,
                'active_accounts': active_accounts,
                'total_deposits': float(total_deposits),
            },
            'daily_transactions': daily_transactions_list,
            'daily_registrations': daily_registrations_list,
            'loan_status_breakdown': loan_status_list,
            'fraud_trend': fraud_trend_list,
            'top_accounts': top_accounts,
        })
