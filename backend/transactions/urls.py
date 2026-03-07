from django.urls import path
from .views import (
    AccountStatementView,
    DepositView,
    TransferView,
    AccountTransactionsView,
    AccountBalanceView,
    AnalyticsView,
    StatementPDFView,
)

urlpatterns = [
    path('transactions/transfer/', TransferView.as_view()),
    path('transactions/analytics/', AnalyticsView.as_view(), name='analytics'),
    path('transactions/<uuid:account_id>/', AccountTransactionsView.as_view()),
    path('transactions/<uuid:account_id>/balance/', AccountBalanceView.as_view()),
    path("transactions/deposit/", DepositView.as_view()),
    path("transactions/<uuid:account_id>/statement/", AccountStatementView.as_view()),
    path("transactions/<uuid:account_id>/statement/pdf/", StatementPDFView.as_view()),
]
