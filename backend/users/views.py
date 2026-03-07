from rest_framework.generics import ListAPIView

from .models import User
from .serializers import UserSerializer
from .permissions import IsAdmin


class UserListView(ListAPIView):
    """
    Admin-only: list all users
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdmin]


# class CurrentUserView(APIView):
#     """
#     Logged-in user info
#     """
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         serializer = UserSerializer(request.user)
#         return Response(serializer.data)


# class RegisterView(APIView):
#     """
#     Public: customer registration
#     """
#     permission_classes = [permissions.AllowAny]

#     def post(self, request):
#         serializer = RegisterSerializer(data=request.data)
#         serializer.is_valid(raise_exception=True)
#         serializer.save()
#         return Response(
#             {"message": "Customer registered successfully"},
#             status=status.HTTP_201_CREATED
#         )
