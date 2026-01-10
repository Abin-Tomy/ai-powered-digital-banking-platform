from django.urls import path
from .views import FlaggedTransactionsView, ReviewFraudView

urlpatterns = [
    path("fraud/flags/", FlaggedTransactionsView.as_view()),
    path("fraud/review/<uuid:fraud_id>/", ReviewFraudView.as_view()),
]
