from django.urls import path
from .views import AccountStatusUpdateView, AllAccountsView, CreateAccountView, MyAccountsView, AccountDetailView

urlpatterns = [
    path('accounts/create/', CreateAccountView.as_view()),
    path('accounts/my/', MyAccountsView.as_view()),
    path('accounts/<uuid:account_id>/', AccountDetailView.as_view()),
    path('accounts/admin/all/', AllAccountsView.as_view()),
    path('accounts/admin/<uuid:account_id>/status/', AccountStatusUpdateView.as_view()),
]
