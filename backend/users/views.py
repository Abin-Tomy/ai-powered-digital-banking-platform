from rest_framework.generics import ListAPIView
from rest_framework.pagination import PageNumberPagination

from drf_spectacular.utils import extend_schema

from .models import User
from .serializers import UserSerializer
from .permissions import IsAdmin


class UserPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


@extend_schema(tags=['admin'])
class UserListView(ListAPIView):
    """
    Admin-only: list all users
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdmin]
    pagination_class = UserPagination
