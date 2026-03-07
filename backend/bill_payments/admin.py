from django.contrib import admin
from .models import BillerCategory, Biller, SavedBiller, Bill, BillPayment, RecurringBillPayment


@admin.register(BillerCategory)
class BillerCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'sort_order', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'description']
    ordering = ['sort_order', 'name']
    readonly_fields = ['id', 'created_at', 'updated_at']


@admin.register(Biller)
class BillerAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'biller_code', 'is_active', 'is_instant_payment', 'min_amount', 'max_amount']
    list_filter = ['category', 'is_active', 'is_instant_payment', 'supports_bill_fetch']
    search_fields = ['name', 'biller_code', 'description']
    ordering = ['category', 'sort_order', 'name']
    readonly_fields = ['id', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Basic Info', {
            'fields': ('id', 'name', 'category', 'biller_code', 'description', 'logo_url')
        }),
        ('Payment Configuration', {
            'fields': ('min_amount', 'max_amount', 'convenience_fee_percentage', 'convenience_fee_flat')
        }),
        ('Service Settings', {
            'fields': ('is_active', 'is_instant_payment', 'processing_time_hours', 'sort_order')
        }),
        ('Bill Fetch Configuration', {
            'fields': ('supports_bill_fetch', 'customer_id_label', 'customer_id_format')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        })
    )


@admin.register(SavedBiller)
class SavedBillerAdmin(admin.ModelAdmin):
    list_display = ['nickname', 'user', 'biller', 'customer_id', 'is_autopay_enabled', 'is_favorite']
    list_filter = ['biller__category', 'is_autopay_enabled', 'is_favorite', 'autopay_amount_type']
    search_fields = ['nickname', 'user__email', 'user__first_name', 'customer_id', 'customer_name']
    ordering = ['user', 'nickname']
    readonly_fields = ['id', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Basic Info', {
            'fields': ('id', 'user', 'biller', 'customer_id', 'nickname')
        }),
        ('Customer Details', {
            'fields': ('customer_name', 'billing_address', 'mobile_number')
        }),
        ('AutoPay Settings', {
            'fields': ('is_autopay_enabled', 'autopay_amount_type', 'autopay_fixed_amount', 'autopay_due_days_before')
        }),
        ('Preferences', {
            'fields': ('is_favorite',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        })
    )


@admin.register(Bill)
class BillAdmin(admin.ModelAdmin):
    list_display = ['saved_biller', 'bill_date', 'due_date', 'total_amount', 'outstanding_amount', 'status']
    list_filter = ['status', 'bill_date', 'due_date', 'saved_biller__biller__category']
    search_fields = ['saved_biller__nickname', 'bill_number', 'biller_reference']
    ordering = ['-due_date']
    readonly_fields = ['id', 'outstanding_amount', 'fetched_at', 'last_updated']
    
    fieldsets = (
        ('Bill Info', {
            'fields': ('id', 'saved_biller', 'bill_number', 'status')
        }),
        ('Dates', {
            'fields': ('bill_date', 'due_date', 'bill_period_from', 'bill_period_to')
        }),
        ('Amounts', {
            'fields': ('bill_amount', 'late_fee', 'other_charges', 'total_amount', 'paid_amount', 'outstanding_amount')
        }),
        ('Metadata', {
            'fields': ('biller_reference', 'fetched_at', 'last_updated')
        })
    )

    def get_queryset(self, request):
        return super().get_queryset(request).select_related('saved_biller', 'saved_biller__user', 'saved_biller__biller')


@admin.register(BillPayment)
class BillPaymentAdmin(admin.ModelAdmin):
    list_display = ['payment_reference', 'user', 'saved_biller', 'amount', 'status', 'payment_mode', 'initiated_at']
    list_filter = ['status', 'payment_mode', 'is_autopay', 'initiated_at']
    search_fields = ['payment_reference', 'user__email', 'transaction_id', 'biller_transaction_id']
    ordering = ['-initiated_at']
    readonly_fields = ['id', 'payment_reference', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Payment Info', {
            'fields': ('id', 'payment_reference', 'user', 'saved_biller', 'bill')
        }),
        ('Amount Details', {
            'fields': ('amount', 'convenience_fee', 'total_amount')
        }),
        ('Payment Method', {
            'fields': ('payment_mode', 'from_account_number')
        }),
        ('Transaction Details', {
            'fields': ('transaction_id', 'biller_transaction_id', 'status')
        }),
        ('Timing', {
            'fields': ('scheduled_date', 'initiated_at', 'processed_at', 'completed_at')
        }),
        ('Additional Info', {
            'fields': ('remarks', 'failure_reason', 'is_autopay')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        })
    )

    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user', 'saved_biller', 'saved_biller__biller')


@admin.register(RecurringBillPayment)
class RecurringBillPaymentAdmin(admin.ModelAdmin):
    list_display = ['reference_number', 'user', 'saved_biller', 'frequency', 'status', 'next_execution_date']
    list_filter = ['frequency', 'status', 'amount_type', 'payment_mode']
    search_fields = ['reference_number', 'user__email', 'saved_biller__nickname']
    ordering = ['next_execution_date']
    readonly_fields = ['id', 'reference_number', 'execution_count', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Basic Info', {
            'fields': ('id', 'reference_number', 'user', 'saved_biller', 'status')
        }),
        ('Schedule', {
            'fields': ('frequency', 'start_date', 'end_date', 'next_execution_date', 'last_executed_date')
        }),
        ('Amount Configuration', {
            'fields': ('amount_type', 'fixed_amount', 'max_amount_limit')
        }),
        ('Payment Method', {
            'fields': ('payment_mode', 'from_account_number')
        }),
        ('Execution Details', {
            'fields': ('execution_count', 'failed_attempts', 'max_failed_attempts')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        })
    )

    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user', 'saved_biller', 'saved_biller__biller')
