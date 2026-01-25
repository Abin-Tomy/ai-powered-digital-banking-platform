from django.contrib import admin
from .models import LoanType, LoanApplication, Loan, LoanPayment


@admin.register(LoanType)
class LoanTypeAdmin(admin.ModelAdmin):
    list_display = ('name', 'interest_rate', 'min_amount', 'max_amount', 'is_active')
    list_filter = ('is_active',)
    search_fields = ('name',)


@admin.register(LoanApplication)
class LoanApplicationAdmin(admin.ModelAdmin):
    list_display = ('applicant', 'loan_type', 'requested_amount', 'status', 'applied_at')
    list_filter = ('status', 'loan_type', 'employment_type')
    search_fields = ('applicant__email', 'applicant__full_name')
    readonly_fields = ('applied_at',)


@admin.register(Loan)
class LoanAdmin(admin.ModelAdmin):
    list_display = ('borrower', 'loan_type', 'principal_amount', 'outstanding_balance', 'status')
    list_filter = ('status', 'loan_type')
    search_fields = ('borrower__email', 'borrower__full_name')
    readonly_fields = ('disbursed_at',)


@admin.register(LoanPayment)
class LoanPaymentAdmin(admin.ModelAdmin):
    list_display = ('loan', 'emi_number', 'due_date', 'total_amount', 'status')
    list_filter = ('status', 'due_date')
    search_fields = ('loan__borrower__email',)