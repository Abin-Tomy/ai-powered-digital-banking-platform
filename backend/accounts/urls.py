from django.urls import path
from .views import AccountListView
from .views import AdminAccountFundingView

urlpatterns = [
    path('', AccountListView.as_view(), name='account-list'),
    path("admin/fund/", AdminAccountFundingView.as_view(), name="admin-account-fund"),
]
