from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import User

@receiver(post_save, sender=User)
def send_welcome_email(sender, instance, created, **kwargs):
    if created:
        # Placeholder for email service integration
        print(f"Welcome email queued for {instance.email}")
