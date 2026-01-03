from rest_framework.generics import ListAPIView
from .models import Transaction
from .serializers import TransactionSerializer

class TransactionListView(ListAPIView):
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer
from rest_framework.generics import ListAPIView
from .models import Transaction
from .serializers import TransactionSerializer
from users.permissions import IsCustomer

class TransactionListView(ListAPIView):
    serializer_class = TransactionSerializer
    permission_classes = [IsCustomer]

    def get_queryset(self):
        return Transaction.objects.filter(
            source_account__owner=self.request.user
        )
