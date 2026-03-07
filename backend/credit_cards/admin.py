from django.contrib import admin
from .models import CreditCardType, CreditCardApplication, CreditCard, CreditCardTransaction, CreditCardStatement


@admin.register(CreditCardType)
class CreditCardTypeAdmin(admin.ModelAdmin):
    list_display = ['name', 'minimum_credit_limit', 'maximum_credit_limit', 'annual_fee', 'interest_rate', 'is_active']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'description']
    ordering = ['name']
    readonly_fields = ['id', 'created_at', 'updated_at']


@admin.register(CreditCardApplication)
class CreditCardApplicationAdmin(admin.ModelAdmin):
    list_display = ['application_number', 'user', 'card_type', 'requested_credit_limit', 'status', 'created_at']
    list_filter = ['status', 'card_type', 'created_at', 'employment_type']
    search_fields = ['application_number', 'user__email', 'user__first_name', 'user__last_name', 'company_name']
    ordering = ['-created_at']
    readonly_fields = ['id', 'application_number', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Application Info', {
            'fields': ('id', 'application_number', 'user', 'card_type', 'status')
        }),
        ('Financial Details', {
            'fields': ('requested_credit_limit', 'annual_income', 'monthly_salary', 'existing_credit_cards', 'existing_loans_emi')
        }),
        ('Employment Details', {
            'fields': ('employment_type', 'company_name', 'work_experience_months')
        }),
        ('Review Details', {
            'fields': ('approved_credit_limit', 'remarks', 'reviewed_by', 'reviewed_at')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        })
    )


@admin.register(CreditCard)
class CreditCardAdmin(admin.ModelAdmin):
    list_display = ['masked_card_number', 'cardholder_name', 'user', 'card_type', 'credit_limit', 'available_credit', 'status']
    list_filter = ['status', 'card_type', 'issue_date', 'pin_set']
    search_fields = ['last_four', 'cardholder_name', 'user__email', 'user__first_name', 'user__last_name']
    ordering = ['-created_at']
    readonly_fields = ['id', 'card_number', 'last_four', 'outstanding_balance', 'masked_card_number', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Card Info', {
            'fields': ('id', 'card_number', 'masked_card_number', 'cardholder_name', 'user', 'card_type')
        }),
        ('Security', {
            'fields': ('last_four', 'expiry_date', 'pin_set', 'status')
        }),
        ('Credit Limits', {
            'fields': ('credit_limit', 'available_credit', 'outstanding_balance', 'cash_advance_limit', 'available_cash_advance')
        }),
        ('Statement & Payments', {
            'fields': ('last_statement_date', 'next_statement_date', 'minimum_due', 'due_date')
        }),
        ('Rewards', {
            'fields': ('reward_points',)
        }),
        ('Timestamps', {
            'fields': ('issue_date', 'created_at', 'updated_at')
        })
    )

    def outstanding_balance(self, obj):
        return f"₹{obj.outstanding_balance:,.2f}"
    outstanding_balance.short_description = "Outstanding Balance"


@admin.register(CreditCardTransaction)
class CreditCardTransactionAdmin(admin.ModelAdmin):
    list_display = ['credit_card', 'transaction_type', 'amount', 'merchant_name', 'status', 'transaction_date']
    list_filter = ['transaction_type', 'status', 'transaction_date', 'merchant_category']
    search_fields = ['credit_card__card_number', 'merchant_name', 'description', 'authorization_code']
    ordering = ['-transaction_date']
    readonly_fields = ['id', 'authorization_code', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Transaction Info', {
            'fields': ('id', 'credit_card', 'transaction_type', 'amount', 'status', 'transaction_date')
        }),
        ('Merchant Details', {
            'fields': ('merchant_name', 'merchant_category', 'description', 'authorization_code')
        }),
        ('Foreign Transaction', {
            'fields': ('foreign_currency', 'foreign_amount', 'exchange_rate')
        }),
        ('Rewards', {
            'fields': ('reward_points_earned',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        })
    )

    def get_queryset(self, request):
        return super().get_queryset(request).select_related('credit_card', 'credit_card__user')


@admin.register(CreditCardStatement)
class CreditCardStatementAdmin(admin.ModelAdmin):
    list_display = ['credit_card', 'statement_date', 'closing_balance', 'minimum_due', 'due_date', 'is_payment_received']
    list_filter = ['statement_date', 'due_date', 'is_payment_received']
    search_fields = ['credit_card__card_number', 'credit_card__cardholder_name']
    ordering = ['-statement_date']
    readonly_fields = ['id', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Statement Info', {
            'fields': ('id', 'credit_card', 'statement_date', 'due_date')
        }),
        ('Balances', {
            'fields': ('opening_balance', 'closing_balance', 'minimum_due')
        }),
        ('Transaction Totals', {
            'fields': ('total_purchases', 'total_payments', 'total_fees', 'total_interest')
        }),
        ('Rewards', {
            'fields': ('reward_points_earned', 'reward_points_redeemed')
        }),
        ('Payment Status', {
            'fields': ('is_payment_received', 'payment_amount', 'payment_date')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        })
    )

    def get_queryset(self, request):
        return super().get_queryset(request).select_related('credit_card', 'credit_card__user')
