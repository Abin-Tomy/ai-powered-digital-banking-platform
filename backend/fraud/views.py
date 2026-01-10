from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.utils import timezone

from .models import FraudFlag
from .serializers import FraudFlagSerializer


class FlaggedTransactionsView(APIView):
    """
    Admin / Support: view all suspicious transactions
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role not in ["ADMIN", "SUPPORT"]:
            return Response(status=403)

        flags = FraudFlag.objects.all().order_by("-created_at")
        serializer = FraudFlagSerializer(flags, many=True)
        return Response(serializer.data)


class ReviewFraudView(APIView):
    """
    Admin confirms or clears fraud
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, fraud_id):
        if request.user.role != "ADMIN":
            return Response(status=403)

        try:
            flag = FraudFlag.objects.get(id=fraud_id)
        except FraudFlag.DoesNotExist:
            return Response(status=404)

        decision = request.data.get("status")
        if decision not in ["CONFIRMED_FRAUD", "FALSE_POSITIVE"]:
            return Response({"detail": "Invalid decision"}, status=400)

        flag.status = decision
        flag.reviewed_by = request.user
        flag.reviewed_at = timezone.now()
        flag.save()

        return Response(FraudFlagSerializer(flag).data)
