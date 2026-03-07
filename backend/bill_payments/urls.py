from django.urls import path
from .views import (
    BillerCategoryListView, BillerListView, BillerDetailView,
    SavedBillerListView, SavedBillerDetailView,
    BillListView, BillDetailView, fetch_bills, payment_summary,
    BillPaymentListView, BillPaymentDetailView,
    RecurringBillPaymentListView, RecurringBillPaymentDetailView,
    pause_recurring_payment, resume_recurring_payment,
    AdminBillPaymentListView, AdminRecurringPaymentListView,
    bill_payment_dashboard
)

urlpatterns = [
    # Dashboard
    path('dashboard/', bill_payment_dashboard, name='bill_payment_dashboard'),
    
    # Biller Categories
    path('categories/', BillerCategoryListView.as_view(), name='biller_categories'),
    
    # Billers
    path('billers/', BillerListView.as_view(), name='billers'),
    path('billers/<uuid:pk>/', BillerDetailView.as_view(), name='biller_detail'),
    
    # Saved Billers
    path('saved-billers/', SavedBillerListView.as_view(), name='saved_billers'),
    path('saved-billers/<uuid:pk>/', SavedBillerDetailView.as_view(), name='saved_biller_detail'),
    
    # Bills
    path('bills/', BillListView.as_view(), name='bills'),
    path('bills/<uuid:pk>/', BillDetailView.as_view(), name='bill_detail'),
    path('bills/fetch/', fetch_bills, name='fetch_bills'),
    
    # Payments
    path('payments/', BillPaymentListView.as_view(), name='bill_payments'),
    path('payments/<uuid:pk>/', BillPaymentDetailView.as_view(), name='bill_payment_detail'),
    path('payments/summary/', payment_summary, name='payment_summary'),
    
    # Recurring Payments
    path('recurring-payments/', RecurringBillPaymentListView.as_view(), name='recurring_bill_payments'),
    path('recurring-payments/<uuid:pk>/', RecurringBillPaymentDetailView.as_view(), name='recurring_bill_payment_detail'),
    path('recurring-payments/<uuid:pk>/pause/', pause_recurring_payment, name='pause_recurring_payment'),
    path('recurring-payments/<uuid:pk>/resume/', resume_recurring_payment, name='resume_recurring_payment'),
    
    # Admin URLs
    path('admin/payments/', AdminBillPaymentListView.as_view(), name='admin_bill_payments'),
    path('admin/recurring-payments/', AdminRecurringPaymentListView.as_view(), name='admin_recurring_payments'),
]