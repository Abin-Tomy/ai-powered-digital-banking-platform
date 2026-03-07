from django.db import models
from django.contrib.auth import get_user_model
from .encryption import EncryptedCharField
import uuid
from decimal import Decimal
from datetime import datetime, timedelta
import random

User = get_user_model()


class CreditCardType(models.Model):
    """Credit card types (Platinum, Gold, Silver, etc.)"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    minimum_credit_limit = models.DecimalField(max_digits=15, decimal_places=2, default=10000)
    maximum_credit_limit = models.DecimalField(max_digits=15, decimal_places=2, default=1000000)
    annual_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    interest_rate = models.DecimalField(max_digits=5, decimal_places=2, default=18.0)  # Annual percentage
    cash_advance_limit_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=50)
    minimum_income_requirement = models.DecimalField(max_digits=15, decimal_places=2, default=300000)
    reward_points_per_100 = models.DecimalField(max_digits=5, decimal_places=2, default=1)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'credit_card_types'
        ordering = ['name']

    def __str__(self):
        return self.name


class CreditCardApplication(models.Model):
    """Credit card applications"""
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('UNDER_REVIEW', 'Under Review'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
        ('CANCELLED', 'Cancelled')
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    application_number = models.CharField(max_length=20, unique=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='credit_card_applications')
    card_type = models.ForeignKey(CreditCardType, on_delete=models.CASCADE)
    requested_credit_limit = models.DecimalField(max_digits=15, decimal_places=2)
    annual_income = models.DecimalField(max_digits=15, decimal_places=2)
    employment_type = models.CharField(max_length=50)
    company_name = models.CharField(max_length=200)
    work_experience_months = models.IntegerField()
    monthly_salary = models.DecimalField(max_digits=15, decimal_places=2)
    existing_credit_cards = models.IntegerField(default=0)
    existing_loans_emi = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    remarks = models.TextField(blank=True)
    approved_credit_limit = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    reviewed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, 
                                    related_name='reviewed_credit_applications')
    reviewed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'credit_card_applications'
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.application_number:
            self.application_number = f"CCA{random.randint(100000, 999999)}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.application_number} - {self.user.get_full_name()}"


class CreditCard(models.Model):
    """Credit cards issued to customers"""
    STATUS_CHOICES = [
        ('ACTIVE', 'Active'),
        ('BLOCKED', 'Blocked'),
        ('EXPIRED', 'Expired'),
        ('CLOSED', 'Closed')
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    card_number = EncryptedCharField(max_length=16)
    last_four = models.CharField(max_length=4, blank=True)
    cardholder_name = models.CharField(max_length=100)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='credit_cards')
    card_type = models.ForeignKey(CreditCardType, on_delete=models.CASCADE)
    application = models.OneToOneField(CreditCardApplication, on_delete=models.CASCADE, null=True, blank=True)
    credit_limit = models.DecimalField(max_digits=15, decimal_places=2)
    available_credit = models.DecimalField(max_digits=15, decimal_places=2)
    cash_advance_limit = models.DecimalField(max_digits=15, decimal_places=2)
    available_cash_advance = models.DecimalField(max_digits=15, decimal_places=2)
    expiry_date = models.DateField()
    issue_date = models.DateField(auto_now_add=True)
    pin_set = models.BooleanField(default=False)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ACTIVE')
    reward_points = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    last_statement_date = models.DateField(null=True, blank=True)
    next_statement_date = models.DateField(null=True, blank=True)
    minimum_due = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    due_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'credit_cards'
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.card_number:
            # Generate a 16-digit card number starting with 4 (Visa format)
            self.card_number = '4' + ''.join([str(random.randint(0, 9)) for _ in range(15)])

        # Auto-populate last_four from card_number
        if self.card_number:
            self.last_four = self.card_number[-4:]

        if not self.expiry_date:
            # Set expiry date to 4 years from now
            self.expiry_date = (datetime.now().date() + timedelta(days=4*365))

        # Set available credit if not set
        if self.available_credit is None:
            self.available_credit = self.credit_limit

        # Set cash advance limits
        if not self.cash_advance_limit:
            self.cash_advance_limit = self.credit_limit * (self.card_type.cash_advance_limit_percentage / 100)

        if self.available_cash_advance is None:
            self.available_cash_advance = self.cash_advance_limit

        super().save(*args, **kwargs)

    @property
    def outstanding_balance(self):
        return self.credit_limit - self.available_credit

    @property
    def masked_card_number(self):
        return f"****-****-****-{self.card_number[-4:]}"

    def calculate_minimum_due(self):
        """Calculate minimum due amount (5% of outstanding balance or minimum 200)"""
        outstanding = self.outstanding_balance
        if outstanding <= 0:
            return Decimal('0.00')
        
        min_due = max(outstanding * Decimal('0.05'), Decimal('200'))
        return min_due

    def add_reward_points(self, transaction_amount):
        """Add reward points based on transaction amount"""
        points = (transaction_amount / 100) * self.card_type.reward_points_per_100
        self.reward_points += points
        self.save()
        return points

    def __str__(self):
        return f"{self.cardholder_name} - {self.masked_card_number}"


class CreditCardTransaction(models.Model):
    """Credit card transactions"""
    TRANSACTION_TYPES = [
        ('PURCHASE', 'Purchase'),
        ('CASH_ADVANCE', 'Cash Advance'),
        ('PAYMENT', 'Payment'),
        ('INTEREST', 'Interest Charge'),
        ('FEE', 'Fee'),
        ('REFUND', 'Refund'),
        ('REWARD_REDEMPTION', 'Reward Redemption')
    ]

    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('COMPLETED', 'Completed'),
        ('FAILED', 'Failed'),
        ('REVERSED', 'Reversed')
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    credit_card = models.ForeignKey(CreditCard, on_delete=models.CASCADE, related_name='transactions')
    transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPES)
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    merchant_name = models.CharField(max_length=200, blank=True)
    merchant_category = models.CharField(max_length=100, blank=True)
    description = models.TextField(blank=True)
    transaction_date = models.DateTimeField(auto_now_add=True)
    authorization_code = models.CharField(max_length=20, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='COMPLETED')
    reward_points_earned = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    foreign_currency = models.CharField(max_length=3, blank=True)  # USD, EUR, etc.
    foreign_amount = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    exchange_rate = models.DecimalField(max_digits=10, decimal_places=6, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'credit_card_transactions'
        ordering = ['-transaction_date']

    def save(self, *args, **kwargs):
        if not self.authorization_code and self.transaction_type == 'PURCHASE':
            self.authorization_code = ''.join([str(random.randint(0, 9)) for _ in range(6)])
        
        super().save(*args, **kwargs)

        # Update credit card balances after transaction
        if self.status == 'COMPLETED':
            self.update_card_balance()

    def update_card_balance(self):
        """Update credit card available balance based on transaction"""
        if self.transaction_type in ['PURCHASE', 'CASH_ADVANCE', 'INTEREST', 'FEE']:
            # Deduct from available credit
            self.credit_card.available_credit -= self.amount
            if self.transaction_type == 'CASH_ADVANCE':
                self.credit_card.available_cash_advance -= self.amount
        elif self.transaction_type in ['PAYMENT', 'REFUND']:
            # Add to available credit
            self.credit_card.available_credit += self.amount
            if self.transaction_type == 'REFUND' and self.credit_card.available_cash_advance < self.credit_card.cash_advance_limit:
                self.credit_card.available_cash_advance += min(self.amount, 
                    self.credit_card.cash_advance_limit - self.credit_card.available_cash_advance)
        
        # Add reward points for purchases
        if self.transaction_type == 'PURCHASE':
            points = self.credit_card.add_reward_points(self.amount)
            self.reward_points_earned = points

        self.credit_card.save()

    def __str__(self):
        return f"{self.credit_card.masked_card_number} - {self.transaction_type} - ₹{self.amount}"


class CreditCardStatement(models.Model):
    """Monthly credit card statements"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    credit_card = models.ForeignKey(CreditCard, on_delete=models.CASCADE, related_name='statements')
    statement_date = models.DateField()
    due_date = models.DateField()
    opening_balance = models.DecimalField(max_digits=15, decimal_places=2)
    closing_balance = models.DecimalField(max_digits=15, decimal_places=2)
    minimum_due = models.DecimalField(max_digits=15, decimal_places=2)
    total_purchases = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    total_payments = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    total_fees = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    total_interest = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    reward_points_earned = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    reward_points_redeemed = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    is_payment_received = models.BooleanField(default=False)
    payment_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    payment_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'credit_card_statements'
        ordering = ['-statement_date']
        unique_together = ['credit_card', 'statement_date']

    def __str__(self):
        return f"{self.credit_card.masked_card_number} - {self.statement_date}"
