from django.contrib import admin
from django.urls import path, include
from .admin_analytics_views import AdminAnalyticsView
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
    SpectacularRedocView,
)

handler429 = 'users.auth_views.ratelimit_handler'

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('users.urls')),
    path('api/', include('accounts.urls')),
    path('api/', include('transactions.urls')),
    path("api/", include("fraud.urls")),
    path("api/", include("loans.urls")),
    path("api/credit-cards/", include("credit_cards.urls")),
    path("api/bill-payments/", include("bill_payments.urls")),
    path("api/admin/analytics/", AdminAnalyticsView.as_view()),
    # API Documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
]
