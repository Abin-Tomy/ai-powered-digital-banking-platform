from django.db.models import Sum
from .models import Transaction


def get_account_balance(account):
    credits = Transaction.objects.filter(
        account=account,
        type='CREDIT',
        status='SUCCESS'
    ).aggregate(total=Sum('amount'))['total'] or 0

    debits = Transaction.objects.filter(
        account=account,
        type='DEBIT',
        status='SUCCESS'
    ).aggregate(total=Sum('amount'))['total'] or 0

    return credits - debits
