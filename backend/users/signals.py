from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import User
from accounts.models import Account


@receiver(post_save, sender=User)
def create_default_account_for_customer(sender, instance, created, **kwargs):
    """
    Automatically create a default SAVINGS account
    when a CUSTOMER user is registered.
    """
    if created and instance.role == "CUSTOMER":
        Account.objects.create(
            owner=instance,
            account_type="SAVINGS"
        )