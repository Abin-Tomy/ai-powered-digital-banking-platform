from rest_framework import serializers
from .models import LoanType, LoanApplication, Loan, LoanPayment


class LoanTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = LoanType
        fields = [
            'id', 'name', 'description', 'interest_rate',
            'min_amount', 'max_amount', 'min_tenure_months',
            'max_tenure_months', 'processing_fee', 'is_active',
        ]


class LoanApplicationSerializer(serializers.ModelSerializer):
    loan_type_name = serializers.CharField(source='loan_type.name', read_only=True)
    applicant_name = serializers.CharField(source='applicant.full_name', read_only=True)
    
    class Meta:
        model = LoanApplication
        fields = [
            'id', 'applicant', 'applicant_name', 'loan_type', 'loan_type_name',
            'requested_amount', 'tenure_months', 'purpose', 'annual_income',
            'employment_type', 'employer_name', 'status', 'applied_at',
            'reviewed_at', 'approved_amount', 'approved_rate', 'rejection_reason'
        ]
        read_only_fields = ['id', 'applicant', 'applied_at']


class LoanSerializer(serializers.ModelSerializer):
    loan_type_name = serializers.CharField(source='loan_type.name', read_only=True)
    borrower_name = serializers.CharField(source='borrower.full_name', read_only=True)
    
    class Meta:
        model = Loan
        fields = [
            'id', 'borrower', 'borrower_name', 'loan_type', 'loan_type_name',
            'principal_amount', 'interest_rate', 'tenure_months', 'monthly_emi',
            'outstanding_balance', 'status', 'disbursed_at', 'first_emi_date',
            'last_payment_date', 'maturity_date'
        ]
        read_only_fields = ['id', 'disbursed_at']


class LoanPaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = LoanPayment
        fields = [
            'id', 'loan', 'emi_number', 'due_date',
            'principal_amount', 'interest_amount', 'total_amount',
            'paid_amount', 'payment_date', 'status',
        ]
        read_only_fields = ['id']