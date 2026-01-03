from rest_framework.generics import ListAPIView
from .models import Account
from .serializers import AccountSerializer
from users.permissions import IsCustomer

class AccountListView(ListAPIView):
    serializer_class = AccountSerializer
    permission_classes = [IsCustomer]

    def get_queryset(self):
        return Account.objects.filter(owner=self.request.user)
