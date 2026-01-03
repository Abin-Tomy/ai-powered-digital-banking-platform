from rest_framework.generics import ListAPIView
from .models import Account
from .serializers import AccountSerializer

class AccountListView(ListAPIView):
    queryset = Account.objects.all()
    serializer_class = AccountSerializer
