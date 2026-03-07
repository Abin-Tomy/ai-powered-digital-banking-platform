from rest_framework import serializers
from .models import CreditCardType, CreditCardApplication, CreditCard, CreditCardTransaction, CreditCardStatement
from django.contrib.auth import get_user_model

User = get_user_model()


class CreditCardTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = CreditCardType
        fields = [
            'id', 'name', 'description', 'minimum_credit_limit', 'maximum_credit_limit',
            'annual_fee', 'interest_rate', 'cash_advance_limit_percentage',
            'minimum_income_requirement', 'reward_points_per_100', 'is_active'
        ]


class CreditCardApplicationCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CreditCardApplication
        fields = [
            'card_type', 'requested_credit_limit', 'annual_income', 'employment_type',
            'company_name', 'work_experience_months', 'monthly_salary',
            'existing_credit_cards', 'existing_loans_emi'
        ]

    def validate(self, data):
        # Basic validation for credit card application
        card_type = data.get('card_type')
        requested_limit = data.get('requested_credit_limit')
        annual_income = data.get('annual_income')

        # Check if requested limit is within card type limits
        if requested_limit < card_type.minimum_credit_limit:
            raise serializers.ValidationError(
                f"Requested credit limit must be at least ₹{card_type.minimum_credit_limit:,.2f}"
            )

        if requested_limit > card_type.maximum_credit_limit:
            raise serializers.ValidationError(
                f"Requested credit limit cannot exceed ₹{card_type.maximum_credit_limit:,.2f}"
            )

        # Check income requirement
        if annual_income < card_type.minimum_income_requirement:
            raise serializers.ValidationError(
                f"Annual income must be at least ₹{card_type.minimum_income_requirement:,.2f} for this card type"
            )

        # Check income to credit limit ratio (shouldn't exceed 40x monthly income)
        monthly_income = annual_income / 12
        max_allowed_limit = monthly_income * 40
        if requested_limit > max_allowed_limit:
            raise serializers.ValidationError(
                "Requested credit limit is too high compared to your income"
            )

        return data


class CreditCardApplicationSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    user_email = serializers.EmailField(source='user.email', read_only=True)
    card_type_name = serializers.CharField(source='card_type.name', read_only=True)
    reviewed_by_name = serializers.CharField(source='reviewed_by.get_full_name', read_only=True)

    class Meta:
        model = CreditCardApplication
        fields = [
            'id', 'application_number', 'user', 'user_name', 'user_email',
            'card_type', 'card_type_name', 'requested_credit_limit', 'annual_income',
            'employment_type', 'company_name', 'work_experience_months',
            'monthly_salary', 'existing_credit_cards', 'existing_loans_emi',
            'status', 'remarks', 'approved_credit_limit',
            'reviewed_by', 'reviewed_by_name', 'reviewed_at', 'created_at'
        ]
        read_only_fields = [
            'id', 'application_number', 'user', 'status', 'remarks',
            'approved_credit_limit', 'reviewed_by', 'reviewed_at', 'created_at'
        ]


class CreditCardApplicationUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CreditCardApplication
        fields = ['status', 'remarks', 'approved_credit_limit']

    def validate(self, data):
        status = data.get('status')
        approved_limit = data.get('approved_credit_limit')

        if status == 'APPROVED' and not approved_limit:
            raise serializers.ValidationError(
                "Approved credit limit is required when approving an application"
            )

        if status == 'APPROVED' and approved_limit:
            # Check if approved limit is within card type limits
            card_type = self.instance.card_type
            if approved_limit < card_type.minimum_credit_limit:
                raise serializers.ValidationError(
                    f"Approved credit limit must be at least ₹{card_type.minimum_credit_limit:,.2f}"
                )
            if approved_limit > card_type.maximum_credit_limit:
                raise serializers.ValidationError(
                    f"Approved credit limit cannot exceed ₹{card_type.maximum_credit_limit:,.2f}"
                )

        return data


class CreditCardSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    card_type_name = serializers.CharField(source='card_type.name', read_only=True)
    outstanding_balance = serializers.DecimalField(max_digits=15, decimal_places=2, read_only=True)
    masked_card_number = serializers.CharField(read_only=True)
    last_four = serializers.CharField(read_only=True)
    
    class Meta:
        model = CreditCard
        fields = [
            'id', 'last_four', 'masked_card_number', 'cardholder_name', 'user', 'user_name',
            'card_type', 'card_type_name', 'credit_limit', 'available_credit',
            'outstanding_balance', 'cash_advance_limit', 'available_cash_advance',
            'expiry_date', 'issue_date', 'pin_set', 'status', 'reward_points',
            'minimum_due', 'due_date', 'last_statement_date', 'next_statement_date'
        ]
        read_only_fields = [
            'id', 'user', 'masked_card_number', 'last_four', 'outstanding_balance',
            'issue_date', 'reward_points'
        ]


class CreditCardCreationSerializer(serializers.ModelSerializer):
    """Used ONLY in the card creation response. Never elsewhere."""
    card_number_full = serializers.SerializerMethodField()

    def get_card_number_full(self, obj):
        return obj.card_number  # Returns decrypted value once

    class Meta:
        model = CreditCard
        fields = ['id', 'card_number_full', 'expiry_date',
                  'last_four', 'card_type', 'credit_limit']


class CreditCardTransactionSerializer(serializers.ModelSerializer):
    credit_card_number = serializers.CharField(source='credit_card.masked_card_number', read_only=True)
    
    class Meta:
        model = CreditCardTransaction
        fields = [
            'id', 'credit_card', 'credit_card_number', 'transaction_type', 'amount',
            'merchant_name', 'merchant_category', 'description', 'transaction_date',
            'authorization_code', 'status', 'reward_points_earned',
            'foreign_currency', 'foreign_amount', 'exchange_rate'
        ]
        read_only_fields = [
            'id', 'authorization_code', 'reward_points_earned', 'transaction_date'
        ]


class CreditCardTransactionCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CreditCardTransaction
        fields = [
            'credit_card', 'transaction_type', 'amount', 'merchant_name',
            'merchant_category', 'description', 'foreign_currency',
            'foreign_amount', 'exchange_rate'
        ]

    def validate(self, data):
        credit_card = data.get('credit_card')
        transaction_type = data.get('transaction_type')
        amount = data.get('amount')

        if credit_card.status != 'ACTIVE':
            raise serializers.ValidationError("Credit card is not active")

        if transaction_type in ['PURCHASE', 'CASH_ADVANCE']:
            if transaction_type == 'PURCHASE':
                if amount > credit_card.available_credit:
                    raise serializers.ValidationError(
                        f"Insufficient credit limit. Available: ₹{credit_card.available_credit:,.2f}"
                    )
            elif transaction_type == 'CASH_ADVANCE':
                if amount > credit_card.available_cash_advance:
                    raise serializers.ValidationError(
                        f"Insufficient cash advance limit. Available: ₹{credit_card.available_cash_advance:,.2f}"
                    )

        return data


class CreditCardStatementSerializer(serializers.ModelSerializer):
    credit_card_number = serializers.CharField(source='credit_card.masked_card_number', read_only=True)
    
    class Meta:
        model = CreditCardStatement
        fields = [
            'id', 'credit_card', 'credit_card_number', 'statement_date', 'due_date',
            'opening_balance', 'closing_balance', 'minimum_due',
            'total_purchases', 'total_payments', 'total_fees', 'total_interest',
            'reward_points_earned', 'reward_points_redeemed',
            'is_payment_received', 'payment_amount', 'payment_date'
        ]
        read_only_fields = [
            'id', 'opening_balance', 'closing_balance', 'total_purchases',
            'total_payments', 'total_fees', 'total_interest',
            'reward_points_earned', 'reward_points_redeemed'
        ]


class CreditCardPaymentSerializer(serializers.Serializer):
    """Serializer for credit card payments"""
    amount = serializers.DecimalField(max_digits=15, decimal_places=2)
    payment_method = serializers.ChoiceField(choices=[
        ('BANK_ACCOUNT', 'Bank Account'),
        ('UPI', 'UPI'),
        ('NET_BANKING', 'Net Banking'),
        ('DEBIT_CARD', 'Debit Card')
    ])
    remarks = serializers.CharField(max_length=200, required=False)

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Payment amount must be greater than zero")
        return value