from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta
from decimal import Decimal

from .models import LoanType, LoanApplication, Loan, LoanPayment
from .serializers import (
    LoanTypeSerializer, LoanApplicationSerializer,
    LoanSerializer, LoanPaymentSerializer
)


class LoanTypesView(APIView):
    """Public view for available loan types"""
    permission_classes = []
    
    def get(self, request):
        loan_types = LoanType.objects.filter(is_active=True)
        serializer = LoanTypeSerializer(loan_types, many=True)
        return Response(serializer.data)


class LoanApplicationView(APIView):
    """Customer can apply for loans"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        data = request.data.copy()
        data['applicant'] = request.user.id
        
        serializer = LoanApplicationSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def get(self, request):
        """Get user's loan applications"""
        applications = LoanApplication.objects.filter(applicant=request.user)
        serializer = LoanApplicationSerializer(applications, many=True)
        return Response(serializer.data)


class AdminLoanApplicationsView(APIView):
    """Admin can view and process loan applications"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        if request.user.role not in ['ADMIN']:
            return Response({'detail': 'Permission denied'}, status=403)
        
        applications = LoanApplication.objects.all().order_by('-applied_at')
        serializer = LoanApplicationSerializer(applications, many=True)
        return Response(serializer.data)


class LoanApplicationApprovalView(APIView):
    """Admin approves/rejects loan applications"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request, application_id):
        if request.user.role not in ['ADMIN']:
            return Response({'detail': 'Permission denied'}, status=403)
        
        try:
            application = LoanApplication.objects.get(id=application_id)
        except LoanApplication.DoesNotExist:
            return Response({'detail': 'Application not found'}, status=404)
        
        action = request.data.get('action')  # 'approve' or 'reject'
        
        if action == 'approve':
            # Create loan record
            approved_amount = Decimal(request.data.get('approved_amount', application.requested_amount))
            approved_rate = Decimal(request.data.get('approved_rate', application.loan_type.interest_rate))
            
            # Calculate EMI
            principal = float(approved_amount)
            rate = float(approved_rate) / 100 / 12  # Monthly rate
            tenure = application.tenure_months
            
            if rate == 0:
                monthly_emi = Decimal(principal / tenure)
            else:
                emi = principal * rate * ((1 + rate) ** tenure) / (((1 + rate) ** tenure) - 1)
                monthly_emi = Decimal(str(round(emi, 2)))
            
            # Create loan
            first_emi_date = (timezone.now() + timedelta(days=30)).date()
            maturity_date = first_emi_date + relativedelta(months=tenure-1)
            
            loan = Loan.objects.create(
                loan_application=application,
                borrower=application.applicant,
                loan_type=application.loan_type,
                principal_amount=approved_amount,
                interest_rate=approved_rate,
                tenure_months=tenure,
                monthly_emi=monthly_emi,
                outstanding_balance=approved_amount,
                first_emi_date=first_emi_date,
                maturity_date=maturity_date
            )
            
            # Generate payment schedule
            self.generate_payment_schedule(loan)
            
            # Update application
            application.status = 'APPROVED'
            application.approved_amount = approved_amount
            application.approved_rate = approved_rate
            application.reviewed_at = timezone.now()
            application.reviewed_by = request.user
            application.save()
            
            return Response({'detail': 'Loan approved successfully'})
        
        elif action == 'reject':
            application.status = 'REJECTED'
            application.rejection_reason = request.data.get('reason', 'Application does not meet criteria')
            application.reviewed_at = timezone.now()
            application.reviewed_by = request.user
            application.save()
            
            return Response({'detail': 'Loan application rejected'})
        
        return Response({'detail': 'Invalid action'}, status=400)
    
    def generate_payment_schedule(self, loan):
        """Generate EMI payment schedule"""
        principal_remaining = float(loan.principal_amount)
        monthly_rate = float(loan.interest_rate) / 100 / 12
        monthly_emi = float(loan.monthly_emi)
        
        current_date = loan.first_emi_date
        
        for emi_number in range(1, loan.tenure_months + 1):
            # Calculate interest and principal for this EMI
            interest_amount = principal_remaining * monthly_rate
            principal_amount = monthly_emi - interest_amount
            
            if emi_number == loan.tenure_months:
                # Last EMI - adjust for any rounding differences
                principal_amount = principal_remaining
                total_amount = principal_amount + interest_amount
            else:
                total_amount = monthly_emi
            
            LoanPayment.objects.create(
                loan=loan,
                emi_number=emi_number,
                due_date=current_date,
                principal_amount=Decimal(str(round(principal_amount, 2))),
                interest_amount=Decimal(str(round(interest_amount, 2))),
                total_amount=Decimal(str(round(total_amount, 2)))
            )
            
            principal_remaining -= principal_amount
            current_date += relativedelta(months=1)


class CustomerLoansView(APIView):
    """Customer views their loans"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        loans = Loan.objects.filter(borrower=request.user)
        serializer = LoanSerializer(loans, many=True)
        return Response(serializer.data)


class LoanDetailsView(APIView):
    """Loan details with payment schedule"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request, loan_id):
        try:
            if request.user.role == 'ADMIN':
                loan = Loan.objects.get(id=loan_id)
            else:
                loan = Loan.objects.get(id=loan_id, borrower=request.user)
        except Loan.DoesNotExist:
            return Response({'detail': 'Loan not found'}, status=404)
        
        loan_data = LoanSerializer(loan).data
        payments = LoanPayment.objects.filter(loan=loan)
        payments_data = LoanPaymentSerializer(payments, many=True).data
        
        return Response({
            'loan': loan_data,
            'payments': payments_data
        })


class AdminLoansView(APIView):
    """Admin views all loans"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        if request.user.role not in ['ADMIN']:
            return Response({'detail': 'Permission denied'}, status=403)
        
        loans = Loan.objects.all().order_by('-disbursed_at')
        serializer = LoanSerializer(loans, many=True)
        return Response(serializer.data)