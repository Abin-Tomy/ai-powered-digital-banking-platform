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
