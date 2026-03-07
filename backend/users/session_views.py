from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404

from drf_spectacular.utils import extend_schema

from .models import UserSession


@extend_schema(tags=['auth'])
class SessionListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        sessions = UserSession.objects.filter(user=request.user, is_active=True)
        data = []
        for s in sessions:
            data.append({
                "session_id": str(s.session_id),
                "device_info": s.device_info,
                "browser": s.browser,
                "ip_address": s.ip_address,
                "created_at": s.created_at.isoformat(),
                "last_active": s.last_active.isoformat(),
            })
        return Response(data)

    def delete(self, request):
        """Revoke all sessions except the current one (identified by header)."""
        current_session = request.headers.get('X-Session-Id', '')
        revoked = UserSession.objects.filter(
            user=request.user, is_active=True
        ).exclude(session_id=current_session).update(is_active=False)
        return Response({"revoked": revoked})


@extend_schema(tags=['auth'])
class SessionRevokeView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, session_id):
        session = get_object_or_404(
            UserSession, session_id=session_id, user=request.user, is_active=True
        )
        session.is_active = False
        session.save(update_fields=['is_active'])
        return Response(status=status.HTTP_204_NO_CONTENT)
