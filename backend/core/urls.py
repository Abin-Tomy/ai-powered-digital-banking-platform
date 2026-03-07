from django.contrib import admin
from django.urls import path, include
from .admin_analytics_views import AdminAnalyticsView

handler429 = 'users.auth_views.ratelimit_handler'

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('users.urls')),
    path('api/', include('accounts.urls')),
    path('api/', include('transactions.urls')),
    path("api/", include("fraud.urls")),
    path("api/", include("loans.urls")),  # New loans URLs
    path("api/credit-cards/", include("credit_cards.urls")),  # New credit cards URLs
    path("api/bill-payments/", include("bill_payments.urls")),  # New bill payments URLs
    path("api/admin/analytics/", AdminAnalyticsView.as_view()),
]
