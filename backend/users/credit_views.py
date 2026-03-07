from datetime import timedelta
from decimal import Decimal

from django.db.models import Sum, F
from django.utils import timezone
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import Account
from transactions.models import Transaction
from loans.models import Loan, LoanPayment


def _get_rating(score):
    if score >= 800:
        return "Excellent", "#8b5cf6"
    if score >= 740:
        return "Very Good", "#3b82f6"
    if score >= 670:
        return "Good", "#22c55e"
    if score >= 580:
        return "Fair", "#f97316"
    return "Poor", "#ef4444"


class CreditScoreView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        now = timezone.now()
        last_90 = now - timedelta(days=90)
        factors = []
        tips = []

        # FACTOR 1 — Account Age (max 150)
        age_days = (now.date() - user.date_joined.date()).days
        if age_days >= 365:
            f1 = 150
            desc1 = "Account is over 1 year old"
            impact1 = "positive"
        elif age_days >= 180:
            f1 = 100
            desc1 = "Account is over 6 months old"
            impact1 = "positive"
            tips.append("Keep your account active to improve this factor over time")
        elif age_days >= 90:
            f1 = 60
            desc1 = "Account is over 3 months old"
            impact1 = "neutral"
            tips.append("Account age improves naturally over time")
        else:
            f1 = 20
            desc1 = f"Account is {age_days} days old"
            impact1 = "negative"
            tips.append("Maintain your account to build credit history")

        factors.append({
            "name": "Account Age",
            "points": f1,
            "max_points": 150,
            "description": desc1,
            "impact": impact1,
        })

        # FACTOR 2 — Transaction Activity (max 200)
        txn_count = Transaction.objects.filter(
            account__owner=user,
            created_at__gte=last_90,
        ).count()
        f2 = min(txn_count * 10, 200)
        if f2 >= 150:
            impact2 = "positive"
        elif f2 >= 80:
            impact2 = "neutral"
        else:
            impact2 = "negative"
            tips.append("Make more transactions to improve activity score")

        factors.append({
            "name": "Transaction Activity",
            "points": f2,
            "max_points": 200,
            "description": f"{txn_count} transactions in last 90 days",
            "impact": impact2,
        })

        # FACTOR 3 — Loan Repayment (max 250)
        has_loans = Loan.objects.filter(borrower=user).exists()
        if not has_loans:
            f3 = 125
            desc3 = "No loan history — neutral score"
            impact3 = "neutral"
        else:
            on_time = LoanPayment.objects.filter(
                loan__borrower=user,
                status='PAID',
                payment_date__lte=F('due_date'),
            ).count()
            total = LoanPayment.objects.filter(loan__borrower=user).count()
            ratio = on_time / total if total > 0 else 0.5
            f3 = int(ratio * 250)
            desc3 = f"{on_time}/{total} payments on time"
            if ratio >= 0.9:
                impact3 = "positive"
            elif ratio >= 0.6:
                impact3 = "neutral"
            else:
                impact3 = "negative"
                tips.append("Pay loan EMIs on time to improve this score")

        factors.append({
            "name": "Loan Repayment",
            "points": f3,
            "max_points": 250,
            "description": desc3,
            "impact": impact3,
        })

        # FACTOR 4 — Account Balance Health (max 150)
        accounts = Account.objects.filter(owner=user)
        total_balance = Decimal('0')
        for acc in accounts:
            credits = Transaction.objects.filter(
                account=acc, type='CREDIT', status='SUCCESS'
            ).aggregate(t=Sum('amount'))['t'] or Decimal('0')
            debits = Transaction.objects.filter(
                account=acc, type='DEBIT', status='SUCCESS'
            ).aggregate(t=Sum('amount'))['t'] or Decimal('0')
            total_balance += credits - debits

        bal = float(total_balance)
        if bal >= 50000:
            f4, impact4 = 150, "positive"
        elif bal >= 10000:
            f4, impact4 = 100, "positive"
            tips.append("Maintain a balance above ₹50,000 for maximum score")
        elif bal >= 1000:
            f4, impact4 = 60, "neutral"
            tips.append("Maintain a balance above ₹10,000")
        else:
            f4, impact4 = 20, "negative"
            tips.append("Increase your account balance to improve this score")

        factors.append({
            "name": "Account Balance Health",
            "points": f4,
            "max_points": 150,
            "description": f"Current balance: ₹{bal:,.0f}",
            "impact": impact4,
        })

        # FACTOR 5 — Credit Card Usage (max 100)
        try:
            from credit_cards.models import CreditCard
            cards = CreditCard.objects.filter(user=user, status='ACTIVE')
            if not cards.exists():
                f5 = 50
                desc5 = "No credit cards — neutral"
                impact5 = "neutral"
            else:
                total_limit = sum(float(c.credit_limit) for c in cards)
                total_avail = sum(float(c.available_credit) for c in cards)
                ratio = total_avail / total_limit if total_limit > 0 else 0.5
                if ratio >= 0.7:
                    f5, impact5 = 100, "positive"
                elif ratio >= 0.4:
                    f5, impact5 = 70, "neutral"
                elif ratio >= 0.2:
                    f5, impact5 = 40, "negative"
                    tips.append("Reduce credit card utilization below 60%")
                else:
                    f5, impact5 = 10, "negative"
                    tips.append("Your credit utilization is very high — pay down balances")
                desc5 = f"{ratio*100:.0f}% credit available"
        except Exception:
            f5, impact5, desc5 = 50, "neutral", "Credit card data unavailable"

        factors.append({
            "name": "Credit Card Usage",
            "points": f5,
            "max_points": 100,
            "description": desc5,
            "impact": impact5,
        })

        # Calculate total
        total_raw = f1 + f2 + f3 + f4 + f5
        score = 300 + int((total_raw / 850) * 550)
        score = max(300, min(850, score))

        rating, color = _get_rating(score)

        return Response({
            "score": score,
            "rating": rating,
            "color": color,
            "factors": factors,
            "rating_breakdown": {
                "Poor": "300-579",
                "Fair": "580-669",
                "Good": "670-739",
                "Very Good": "740-799",
                "Excellent": "800-850",
            },
            "tips": tips,
        })
