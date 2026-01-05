from django.urls import path
from .views import TransactionListView
from .views import FundTransferView


urlpatterns = [
    path('', TransactionListView.as_view(), name='transaction-list'),
    path("transfer/", FundTransferView.as_view(), name="fund-transfer"),
]
