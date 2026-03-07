from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination

from drf_spectacular.utils import extend_schema

from .models import AuditLog
from .serializers import AuditLogSerializer
from .permissions import IsAdmin


class AuditLogPagination(PageNumberPagination):
    page_size = 50
    page_size_query_param = 'page_size'
    max_page_size = 200


@extend_schema(tags=['admin'])
class AuditLogView(APIView):
    """Admin-only: view audit logs with optional filters."""
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        queryset = AuditLog.objects.select_related('user').all()

        if action := request.query_params.get('action'):
            queryset = queryset.filter(action=action)
        if resource_type := request.query_params.get('resource_type'):
            queryset = queryset.filter(resource_type=resource_type)
        if user_id := request.query_params.get('user_id'):
            queryset = queryset.filter(user_id=user_id)

        paginator = AuditLogPagination()
        page = paginator.paginate_queryset(queryset, request)
        if page is not None:
            serializer = AuditLogSerializer(page, many=True)
            return paginator.get_paginated_response(serializer.data)

        serializer = AuditLogSerializer(queryset[:100], many=True)
        return Response(serializer.data)
