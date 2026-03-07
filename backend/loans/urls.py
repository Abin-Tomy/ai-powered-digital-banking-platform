from django.urls import path
from .views import (
    LoanTypesView,
    LoanApplicationView,
    AdminLoanApplicationsView,
    LoanApplicationApprovalView,
    CustomerLoansView,
    LoanDetailsView,
    AdminLoansView,
    EMICalculatorView,
)

urlpatterns = [
    # Public endpoints
    path('loans/types/', LoanTypesView.as_view(), name='loan-types'),
    path('loans/calculate-emi/', EMICalculatorView.as_view(), name='calculate-emi'),
    
    # Customer endpoints
    path('loans/applications/', LoanApplicationView.as_view(), name='loan-applications'),  # GET and POST
    path('loans/', CustomerLoansView.as_view(), name='customer-loans'),  # GET user loans
    path('loans/<uuid:loan_id>/', LoanDetailsView.as_view(), name='loan-details'),
    
    # Admin endpoints
    path('loans/admin/applications/', AdminLoanApplicationsView.as_view(), name='admin-loan-applications'),
    path('loans/admin/applications/<uuid:application_id>/approve/', LoanApplicationApprovalView.as_view(), name='loan-application-approval'),
    path('loans/admin/all/', AdminLoansView.as_view(), name='admin-loans'),
]