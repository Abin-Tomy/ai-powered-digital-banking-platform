from rest_framework.generics import ListAPIView
from .models import User
from .serializers import UserSerializer

class UserListView(ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
