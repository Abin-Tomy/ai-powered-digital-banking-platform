from rest_framework import serializers
from .models import Transaction


class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = [
            'id',
            'account',
            'amount',
            'type',
            'reference',
            'description',
            'status',
            'created_at',
        ]
        read_only_fields = fields
