from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from drf_spectacular.utils import extend_schema

from .models import AuditLog
from .serializers import UserSerializer


@extend_schema(tags=['auth'])
class ProfileUpdateView(APIView):
    """PUT /api/users/profile/update/ — update full_name"""
    permission_classes = [IsAuthenticated]

    def put(self, request):
        full_name = request.data.get('full_name', '').strip()
        if not full_name:
            return Response({'full_name': 'This field is required.'}, status=status.HTTP_400_BAD_REQUEST)
        user = request.user
        user.full_name = full_name
        user.save(update_fields=['full_name'])
        AuditLog.log(request, 'PROFILE_UPDATED', 'User', user.id, f'Profile updated for {user.email}')
        return Response(UserSerializer(user).data)


@extend_schema(tags=['auth'])
class ChangePasswordView(APIView):
    """POST /api/users/change-password/ — change password"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        current_password = request.data.get('current_password', '')
        new_password = request.data.get('new_password', '')

        if not request.user.check_password(current_password):
            return Response(
                {'detail': 'Current password is incorrect.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if len(new_password) < 8:
            return Response(
                {'detail': 'New password must be at least 8 characters.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        request.user.set_password(new_password)
        request.user.save()
        AuditLog.log(request, 'PASSWORD_CHANGED', 'User', request.user.id, f'Password changed for {request.user.email}')
        return Response({'detail': 'Password changed successfully.'})
