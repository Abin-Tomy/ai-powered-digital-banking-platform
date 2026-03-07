from django.db import models
from django.contrib.auth import get_user_model
import uuid
from datetime import datetime, timedelta
import random

User = get_user_model()


class BillerCategory(models.Model):
    """Categories for bill payment providers (Electricity, Gas, Water, etc.)"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=100, blank=True)  # Icon class or URL
    is_active = models.BooleanField(default=True)
    sort_order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'biller_categories'
        ordering = ['sort_order', 'name']
        verbose_name_plural = 'Biller Categories'

    def __str__(self):
        return self.name


class Biller(models.Model):
    """Bill payment service providers (BESCOM, Airtel, Vodafone, etc.)"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    category = models.ForeignKey(BillerCategory, on_delete=models.CASCADE, related_name='billers')
    biller_code = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True)
    logo_url = models.URLField(blank=True)
    
    # Payment configuration
    min_amount = models.DecimalField(max_digits=10, decimal_places=2, default=1)
    max_amount = models.DecimalField(max_digits=10, decimal_places=2, default=50000)
    convenience_fee_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    convenience_fee_flat = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    
    # Service availability
    is_active = models.BooleanField(default=True)
    is_instant_payment = models.BooleanField(default=True)
    processing_time_hours = models.IntegerField(default=0)  # 0 means instant
    
    # Bill fetch configuration
    supports_bill_fetch = models.BooleanField(default=True)
    customer_id_label = models.CharField(max_length=100, default='Customer ID')
    customer_id_format = models.CharField(max_length=200, blank=True)  # Regex or format description
    
    sort_order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'billers'
        ordering = ['category', 'sort_order', 'name']

    def calculate_convenience_fee(self, amount):
        """Calculate convenience fee for a bill payment amount"""
        percentage_fee = amount * (self.convenience_fee_percentage / 100)
        total_fee = percentage_fee + self.convenience_fee_flat
        return total_fee

    def __str__(self):
        return f"{self.name} ({self.category.name})"


class SavedBiller(models.Model):
    """User's saved billers with their account details"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='saved_billers')
    biller = models.ForeignKey(Biller, on_delete=models.CASCADE)
    customer_id = models.CharField(max_length=100)
    nickname = models.CharField(max_length=100)  # User-friendly name
    
    # Customer details (for bill fetch)
    customer_name = models.CharField(max_length=200, blank=True)
    billing_address = models.TextField(blank=True)
    mobile_number = models.CharField(max_length=15, blank=True)
    
    # Preferences
    is_autopay_enabled = models.BooleanField(default=False)
    autopay_amount_type = models.CharField(
        max_length=20,
        choices=[
            ('FULL', 'Full Amount'),
            ('FIXED', 'Fixed Amount'),
            ('MINIMUM', 'Minimum Due')
        ],
        default='FULL'
    )
    autopay_fixed_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    autopay_due_days_before = models.IntegerField(default=3)  # Days before due date
    
    is_favorite = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'saved_billers'
        unique_together = ['user', 'biller', 'customer_id']
        ordering = ['-is_favorite', 'nickname']

    def __str__(self):
        return f"{self.nickname} - {self.biller.name}"


class Bill(models.Model):
    """Fetched bill details"""
    BILL_STATUS_CHOICES = [
        ('UNPAID', 'Unpaid'),
        ('PARTIALLY_PAID', 'Partially Paid'),
        ('PAID', 'Paid'),
        ('OVERDUE', 'Overdue'),
        ('EXPIRED', 'Expired')
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    saved_biller = models.ForeignKey(SavedBiller, on_delete=models.CASCADE, related_name='bills')
    
    # Bill details
    bill_number = models.CharField(max_length=100, blank=True)
    bill_date = models.DateField()
    due_date = models.DateField()
    bill_period_from = models.DateField(null=True, blank=True)
    bill_period_to = models.DateField(null=True, blank=True)
    
    # Amount details
    bill_amount = models.DecimalField(max_digits=12, decimal_places=2)
    late_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    other_charges = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    paid_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    outstanding_amount = models.DecimalField(max_digits=12, decimal_places=2)
    
    # Status
    status = models.CharField(max_length=20, choices=BILL_STATUS_CHOICES, default='UNPAID')
    
    # Metadata
    biller_reference = models.CharField(max_length=200, blank=True)  # Biller's internal reference
    fetched_at = models.DateTimeField(auto_now_add=True)
    last_updated = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'bills'
        ordering = ['-due_date']
        unique_together = ['saved_biller', 'bill_number', 'bill_date']

    @property
    def is_overdue(self):
        return datetime.now().date() > self.due_date and self.status in ['UNPAID', 'PARTIALLY_PAID']

    def save(self, *args, **kwargs):
        # Calculate outstanding amount
        self.outstanding_amount = self.total_amount - self.paid_amount
        
        # Update status based on payments
        if self.paid_amount >= self.total_amount:
            self.status = 'PAID'
        elif self.paid_amount > 0:
            self.status = 'PARTIALLY_PAID'
        elif self.is_overdue:
            self.status = 'OVERDUE'
        else:
            self.status = 'UNPAID'
            
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.saved_biller.nickname} - {self.bill_date} - ₹{self.total_amount}"


class BillPayment(models.Model):
    """Bill payment transactions"""
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('PROCESSING', 'Processing'),
        ('COMPLETED', 'Completed'),
        ('FAILED', 'Failed'),
        ('CANCELLED', 'Cancelled'),
        ('REFUNDED', 'Refunded')
    ]

    PAYMENT_MODE_CHOICES = [
        ('ACCOUNT', 'Bank Account'),
        ('UPI', 'UPI'),
        ('DEBIT_CARD', 'Debit Card'),
        ('CREDIT_CARD', 'Credit Card'),
        ('WALLET', 'Digital Wallet')
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bill_payments')
    saved_biller = models.ForeignKey(SavedBiller, on_delete=models.CASCADE, related_name='payments')
    bill = models.ForeignKey(Bill, on_delete=models.CASCADE, null=True, blank=True, related_name='payments')
    
    # Payment details
    payment_reference = models.CharField(max_length=50, unique=True)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    convenience_fee = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)  # amount + convenience_fee
    
    # Payment method
    payment_mode = models.CharField(max_length=20, choices=PAYMENT_MODE_CHOICES)
    from_account_number = models.CharField(max_length=20, blank=True)  # If paid from account
    
    # Transaction details
    transaction_id = models.CharField(max_length=100, blank=True)  # Bank transaction ID
    biller_transaction_id = models.CharField(max_length=100, blank=True)  # Biller's transaction ID
    
    # Status and timing
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    scheduled_date = models.DateField(null=True, blank=True)  # For scheduled payments
    initiated_at = models.DateTimeField(auto_now_add=True)
    processed_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    # Additional details
    remarks = models.TextField(blank=True)
    failure_reason = models.CharField(max_length=200, blank=True)
    is_autopay = models.BooleanField(default=False)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'bill_payments'
        ordering = ['-initiated_at']

    def save(self, *args, **kwargs):
        if not self.payment_reference:
            self.payment_reference = f"BP{random.randint(1000000, 9999999)}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.payment_reference} - {self.saved_biller.nickname} - ₹{self.amount}"


class RecurringBillPayment(models.Model):
    """Recurring/Standing instruction for bill payments"""
    FREQUENCY_CHOICES = [
        ('MONTHLY', 'Monthly'),
        ('QUARTERLY', 'Quarterly'),
        ('HALF_YEARLY', 'Half Yearly'),
        ('YEARLY', 'Yearly'),
        ('WEEKLY', 'Weekly'),
        ('BI_MONTHLY', 'Bi-Monthly')
    ]

    STATUS_CHOICES = [
        ('ACTIVE', 'Active'),
        ('INACTIVE', 'Inactive'),
        ('SUSPENDED', 'Suspended'),
        ('EXPIRED', 'Expired')
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='recurring_bill_payments')
    saved_biller = models.ForeignKey(SavedBiller, on_delete=models.CASCADE, related_name='recurring_payments')
    
    # Recurring payment configuration
    reference_number = models.CharField(max_length=50, unique=True)
    frequency = models.CharField(max_length=20, choices=FREQUENCY_CHOICES)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    
    # Amount configuration
    amount_type = models.CharField(
        max_length=20,
        choices=[
            ('FIXED', 'Fixed Amount'),
            ('BILL_AMOUNT', 'Full Bill Amount'),
            ('MINIMUM', 'Minimum Due')
        ]
    )
    fixed_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    max_amount_limit = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
    # Payment method
    payment_mode = models.CharField(max_length=20, choices=BillPayment.PAYMENT_MODE_CHOICES)
    from_account_number = models.CharField(max_length=20, blank=True)
    
    # Status and execution
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ACTIVE')
    next_execution_date = models.DateField()
    last_executed_date = models.DateField(null=True, blank=True)
    execution_count = models.IntegerField(default=0)
    failed_attempts = models.IntegerField(default=0)
    max_failed_attempts = models.IntegerField(default=3)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'recurring_bill_payments'
        ordering = ['next_execution_date']

    def save(self, *args, **kwargs):
        if not self.reference_number:
            self.reference_number = f"RBP{random.randint(100000, 999999)}"
        super().save(*args, **kwargs)

    def calculate_next_execution_date(self):
        """Calculate next execution date based on frequency"""
        from dateutil.relativedelta import relativedelta
        
        current_date = self.next_execution_date
        
        if self.frequency == 'MONTHLY':
            return current_date + relativedelta(months=1)
        elif self.frequency == 'QUARTERLY':
            return current_date + relativedelta(months=3)
        elif self.frequency == 'HALF_YEARLY':
            return current_date + relativedelta(months=6)
        elif self.frequency == 'YEARLY':
            return current_date + relativedelta(years=1)
        elif self.frequency == 'WEEKLY':
            return current_date + timedelta(weeks=1)
        elif self.frequency == 'BI_MONTHLY':
            return current_date + relativedelta(months=2)
        
        return current_date

    def __str__(self):
        return f"{self.reference_number} - {self.saved_biller.nickname} - {self.frequency}"
