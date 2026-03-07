from rest_framework import serializers
from .models import BillerCategory, Biller, SavedBiller, Bill, BillPayment, RecurringBillPayment
from django.contrib.auth import get_user_model

User = get_user_model()


class BillerCategorySerializer(serializers.ModelSerializer):
    biller_count = serializers.IntegerField(source='billers.count', read_only=True)
    
    class Meta:
        model = BillerCategory
        fields = ['id', 'name', 'description', 'icon', 'is_active', 'sort_order', 'biller_count']


class BillerSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_icon = serializers.CharField(source='category.icon', read_only=True)
    
    class Meta:
        model = Biller
        fields = [
            'id', 'name', 'category', 'category_name', 'category_icon', 'biller_code',
            'description', 'logo_url', 'min_amount', 'max_amount', 
            'convenience_fee_percentage', 'convenience_fee_flat',
            'is_active', 'is_instant_payment', 'processing_time_hours',
            'supports_bill_fetch', 'customer_id_label', 'customer_id_format'
        ]


class SavedBillerCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = SavedBiller
        fields = [
            'biller', 'customer_id', 'nickname', 'customer_name', 
            'billing_address', 'mobile_number', 'is_favorite'
        ]

    def validate(self, data):
        # Check if user already has this biller + customer_id combination
        user = self.context['request'].user
        biller = data.get('biller')
        customer_id = data.get('customer_id')

        if SavedBiller.objects.filter(user=user, biller=biller, customer_id=customer_id).exists():
            raise serializers.ValidationError(
                f"You have already saved this {biller.name} account ({customer_id})"
            )

        return data


class SavedBillerSerializer(serializers.ModelSerializer):
    biller_name = serializers.CharField(source='biller.name', read_only=True)
    biller_logo = serializers.URLField(source='biller.logo_url', read_only=True)
    category_name = serializers.CharField(source='biller.category.name', read_only=True)
    category_icon = serializers.CharField(source='biller.category.icon', read_only=True)
    pending_bills_count = serializers.IntegerField(source='bills.filter(status__in=["UNPAID", "OVERDUE"]).count', read_only=True)
    
    class Meta:
        model = SavedBiller
        fields = [
            'id', 'biller', 'biller_name', 'biller_logo', 'category_name', 'category_icon',
            'customer_id', 'nickname', 'customer_name', 'billing_address', 'mobile_number',
            'is_autopay_enabled', 'autopay_amount_type', 'autopay_fixed_amount', 
            'autopay_due_days_before', 'is_favorite', 'pending_bills_count', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class SavedBillerUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = SavedBiller
        fields = [
            'nickname', 'customer_name', 'billing_address', 'mobile_number',
            'is_autopay_enabled', 'autopay_amount_type', 'autopay_fixed_amount',
            'autopay_due_days_before', 'is_favorite'
        ]

    def validate(self, data):
        autopay_enabled = data.get('is_autopay_enabled', self.instance.is_autopay_enabled)
        amount_type = data.get('autopay_amount_type', self.instance.autopay_amount_type)
        fixed_amount = data.get('autopay_fixed_amount', self.instance.autopay_fixed_amount)

        if autopay_enabled and amount_type == 'FIXED' and not fixed_amount:
            raise serializers.ValidationError(
                "Fixed amount is required when autopay amount type is 'FIXED'"
            )

        return data


class BillSerializer(serializers.ModelSerializer):
    saved_biller_nickname = serializers.CharField(source='saved_biller.nickname', read_only=True)
    biller_name = serializers.CharField(source='saved_biller.biller.name', read_only=True)
    category_name = serializers.CharField(source='saved_biller.biller.category.name', read_only=True)
    is_overdue = serializers.BooleanField(read_only=True)
    days_until_due = serializers.SerializerMethodField()
    
    class Meta:
        model = Bill
        fields = [
            'id', 'saved_biller', 'saved_biller_nickname', 'biller_name', 'category_name',
            'bill_number', 'bill_date', 'due_date', 'bill_period_from', 'bill_period_to',
            'bill_amount', 'late_fee', 'other_charges', 'total_amount', 'paid_amount',
            'outstanding_amount', 'status', 'is_overdue', 'days_until_due', 'fetched_at'
        ]

    def get_days_until_due(self, obj):
        from datetime import date
        today = date.today()
        if obj.due_date >= today:
            return (obj.due_date - today).days
        else:
            return -(today - obj.due_date).days  # Negative for overdue


class BillPaymentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = BillPayment
        fields = [
            'saved_biller', 'bill', 'amount', 'payment_mode', 
            'from_account_number', 'scheduled_date', 'remarks'
        ]

    def validate(self, data):
        saved_biller = data.get('saved_biller')
        amount = data.get('amount')
        bill = data.get('bill')

        # Check if saved biller belongs to the user
        request_user = self.context['request'].user
        if saved_biller.user != request_user:
            raise serializers.ValidationError("You can only pay bills for your saved billers")

        # Check amount limits
        biller = saved_biller.biller
        if amount < biller.min_amount:
            raise serializers.ValidationError(
                f"Minimum payment amount is ₹{biller.min_amount}"
            )

        if amount > biller.max_amount:
            raise serializers.ValidationError(
                f"Maximum payment amount is ₹{biller.max_amount}"
            )

        # If bill is specified, validate against bill
        if bill:
            if bill.saved_biller != saved_biller:
                raise serializers.ValidationError("Bill does not belong to the selected biller")
            
            if bill.status == 'PAID':
                raise serializers.ValidationError("This bill has already been paid")

            if amount > bill.outstanding_amount:
                raise serializers.ValidationError(
                    f"Payment amount cannot exceed outstanding amount of ₹{bill.outstanding_amount}"
                )

        return data


class BillPaymentSerializer(serializers.ModelSerializer):
    saved_biller_nickname = serializers.CharField(source='saved_biller.nickname', read_only=True)
    biller_name = serializers.CharField(source='saved_biller.biller.name', read_only=True)
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    bill_number = serializers.CharField(source='bill.bill_number', read_only=True)
    
    class Meta:
        model = BillPayment
        fields = [
            'id', 'payment_reference', 'user', 'user_name', 'saved_biller', 
            'saved_biller_nickname', 'biller_name', 'bill', 'bill_number',
            'amount', 'convenience_fee', 'total_amount', 'payment_mode',
            'from_account_number', 'transaction_id', 'biller_transaction_id',
            'status', 'scheduled_date', 'initiated_at', 'processed_at',
            'completed_at', 'remarks', 'failure_reason', 'is_autopay'
        ]
        read_only_fields = [
            'id', 'payment_reference', 'user', 'convenience_fee', 'total_amount',
            'transaction_id', 'biller_transaction_id', 'status', 'initiated_at',
            'processed_at', 'completed_at', 'failure_reason'
        ]


class RecurringBillPaymentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = RecurringBillPayment
        fields = [
            'saved_biller', 'frequency', 'start_date', 'end_date', 'amount_type',
            'fixed_amount', 'max_amount_limit', 'payment_mode', 'from_account_number'
        ]

    def validate(self, data):
        amount_type = data.get('amount_type')
        fixed_amount = data.get('fixed_amount')
        saved_biller = data.get('saved_biller')

        # Check if saved biller belongs to the user
        request_user = self.context['request'].user
        if saved_biller.user != request_user:
            raise serializers.ValidationError("You can only create recurring payments for your saved billers")

        # Validate fixed amount
        if amount_type == 'FIXED' and not fixed_amount:
            raise serializers.ValidationError("Fixed amount is required when amount type is 'FIXED'")

        if fixed_amount:
            biller = saved_biller.biller
            if fixed_amount < biller.min_amount:
                raise serializers.ValidationError(
                    f"Fixed amount must be at least ₹{biller.min_amount}"
                )
            if fixed_amount > biller.max_amount:
                raise serializers.ValidationError(
                    f"Fixed amount cannot exceed ₹{biller.max_amount}"
                )

        return data


class RecurringBillPaymentSerializer(serializers.ModelSerializer):
    saved_biller_nickname = serializers.CharField(source='saved_biller.nickname', read_only=True)
    biller_name = serializers.CharField(source='saved_biller.biller.name', read_only=True)
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    
    class Meta:
        model = RecurringBillPayment
        fields = [
            'id', 'reference_number', 'user', 'user_name', 'saved_biller',
            'saved_biller_nickname', 'biller_name', 'frequency', 'start_date',
            'end_date', 'amount_type', 'fixed_amount', 'max_amount_limit',
            'payment_mode', 'from_account_number', 'status', 'next_execution_date',
            'last_executed_date', 'execution_count', 'failed_attempts', 'created_at'
        ]
        read_only_fields = [
            'id', 'reference_number', 'user', 'next_execution_date',
            'last_executed_date', 'execution_count', 'failed_attempts', 'created_at'
        ]


class BillFetchSerializer(serializers.Serializer):
    """Serializer for bill fetch requests"""
    saved_biller_id = serializers.UUIDField()
    fetch_period_months = serializers.IntegerField(default=3, min_value=1, max_value=12)

    def validate_saved_biller_id(self, value):
        request_user = self.context['request'].user
        try:
            saved_biller = SavedBiller.objects.get(id=value, user=request_user)
            if not saved_biller.biller.supports_bill_fetch:
                raise serializers.ValidationError("This biller does not support automatic bill fetch")
            return value
        except SavedBiller.DoesNotExist:
            raise serializers.ValidationError("Saved biller not found")


class PaymentSummarySerializer(serializers.Serializer):
    """Serializer for payment summary before confirmation"""
    amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    convenience_fee = serializers.DecimalField(max_digits=8, decimal_places=2)
    total_amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    processing_time = serializers.CharField()
    payment_mode = serializers.CharField()