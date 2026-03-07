from django.db import models
from django.conf import settings
from decimal import Decimal
import uuid


class LoanType(models.Model):
    """Different types of loans available"""
    name = models.CharField(max_length=100)  # Personal, Home, Car, etc.
    description = models.TextField()
    interest_rate = models.DecimalField(max_digits=5, decimal_places=2)  # Annual interest rate
    min_amount = models.DecimalField(max_digits=12, decimal_places=2)
    max_amount = models.DecimalField(max_digits=12, decimal_places=2)
    min_tenure_months = models.PositiveIntegerField()  # Minimum loan term
    max_tenure_months = models.PositiveIntegerField()  # Maximum loan term
    processing_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.interest_rate}%"


class LoanApplication(models.Model):
    """Loan application submitted by customers"""
    STATUS_CHOICES = [
        ('PENDING', 'Pending Review'),
        ('UNDER_REVIEW', 'Under Review'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
        ('DISBURSED', 'Disbursed'),
        ('CANCELLED', 'Cancelled'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    applicant = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='loan_applications')
    loan_type = models.ForeignKey(LoanType, on_delete=models.CASCADE)
    requested_amount = models.DecimalField(max_digits=12, decimal_places=2)
    tenure_months = models.PositiveIntegerField()
    purpose = models.TextField()  # Loan purpose
    
    # Applicant Details
    annual_income = models.DecimalField(max_digits=12, decimal_places=2)
    employment_type = models.CharField(max_length=50)  # Salaried, Self-employed, etc.
    employer_name = models.CharField(max_length=200, blank=True)
    
    # Application Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    applied_at = models.DateTimeField(auto_now_add=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    reviewed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='reviewed_loan_applications')
    
    # Approval Details
    approved_amount = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    approved_rate = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    rejection_reason = models.TextField(blank=True)
    
    def __str__(self):
        return f"Loan Application - {self.applicant.email} - {self.requested_amount}"


class Loan(models.Model):
    """Active loans"""
    STATUS_CHOICES = [
        ('ACTIVE', 'Active'),
        ('PAID_OFF', 'Paid Off'),
        ('DEFAULTED', 'Defaulted'),
        ('RESTRUCTURED', 'Restructured'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    loan_application = models.OneToOneField(LoanApplication, on_delete=models.CASCADE, related_name='loan')
    borrower = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='loans')
    loan_type = models.ForeignKey(LoanType, on_delete=models.CASCADE)
    
    # Loan Terms
    principal_amount = models.DecimalField(max_digits=12, decimal_places=2)
    interest_rate = models.DecimalField(max_digits=5, decimal_places=2)
    tenure_months = models.PositiveIntegerField()
    monthly_emi = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Current Status
    outstanding_balance = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ACTIVE')
    
    # Important Dates
    disbursed_at = models.DateTimeField(auto_now_add=True)
    first_emi_date = models.DateField()
    last_payment_date = models.DateField(null=True, blank=True)
    maturity_date = models.DateField()
    
    def __str__(self):
        return f"Loan {self.id} - {self.borrower.email}"

    def calculate_emi(self):
        """Calculate EMI using reducing balance method"""
        principal = float(self.principal_amount)
        rate = float(self.interest_rate) / 100 / 12  # Monthly rate
        tenure = self.tenure_months
        
        if rate == 0:
            return Decimal(principal / tenure)
        
        emi = principal * rate * ((1 + rate) ** tenure) / (((1 + rate) ** tenure) - 1)
        return Decimal(str(round(emi, 2)))


class LoanPayment(models.Model):
    """Loan payment transactions"""
    PAYMENT_STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('PAID', 'Paid'),
        ('OVERDUE', 'Overdue'),
        ('PARTIAL', 'Partial Payment'),
        ('FAILED', 'Failed'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    loan = models.ForeignKey(Loan, on_delete=models.CASCADE, related_name='payments')
    emi_number = models.PositiveIntegerField()  # Which EMI (1st, 2nd, etc.)
    
    # Payment Details
    due_date = models.DateField()
    principal_amount = models.DecimalField(max_digits=10, decimal_places=2)
    interest_amount = models.DecimalField(max_digits=10, decimal_places=2)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Payment Status
    paid_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    payment_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='PENDING')
    
    # Late Payment
    late_fee = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    days_overdue = models.PositiveIntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['due_date']
        unique_together = ['loan', 'emi_number']

    def __str__(self):
        return f"EMI {self.emi_number} - Loan {self.loan.id}"