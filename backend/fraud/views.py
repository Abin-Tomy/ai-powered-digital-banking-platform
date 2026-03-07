from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination
from django.utils import timezone

from .models import FraudFlag
from .serializers import FraudFlagSerializer
from users.models import AuditLog
from users.permissions import IsAdmin


class FraudFlagPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


class FlaggedTransactionsView(APIView):
    """
    Admin / Support: view all suspicious transactions
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role not in ["ADMIN", "SUPPORT"]:
            return Response(status=403)

        flags = FraudFlag.objects.select_related(
            'transaction', 'reviewed_by'
        ).all().order_by("-created_at")

        paginator = FraudFlagPagination()
        page = paginator.paginate_queryset(flags, request)
        if page is not None:
            serializer = FraudFlagSerializer(page, many=True)
            return paginator.get_paginated_response(serializer.data)

        serializer = FraudFlagSerializer(flags, many=True)
        return Response(serializer.data)


class ReviewFraudView(APIView):
    """
    Admin confirms or clears fraud
    """
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request, fraud_id):
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

        AuditLog.log(request, 'FRAUD_REVIEW', 'FraudFlag', flag.id,
                     f'Decision: {decision}')

        return Response(FraudFlagSerializer(flag).data)
