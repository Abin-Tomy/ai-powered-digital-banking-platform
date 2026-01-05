from rest_framework import serializers
from .models import Transaction

class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = [
            'id',
            'source_account',
            'destination_account',
            'transaction_type',
            'amount',
            'status',
            'is_fraud_suspected',
            'created_at',
        ]


class FundTransferSerializer(serializers.Serializer):
    from_account = serializers.CharField()
    to_account = serializers.CharField()
    amount = serializers.DecimalField(max_digits=12, decimal_places=2)

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError(
                "Transfer amount must be greater than zero."
            )
        return value

    def validate(self, data):
        if data["from_account"] == data["to_account"]:
            raise serializers.ValidationError(
                "Source and destination accounts must be different."
            )
        return data

