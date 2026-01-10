from rest_framework import serializers
from .models import FraudFlag


class FraudFlagSerializer(serializers.ModelSerializer):
    class Meta:
        model = FraudFlag
        fields = "__all__"
        read_only_fields = [
            "id",
            "transaction",
            "status",
            "risk_score",
            "reasons",
            "reviewed_by",
            "reviewed_at",
            "created_at",
        ]
