import uuid
from decimal import Decimal
from collections import defaultdict

from django.db import transaction as db_transaction
from django.db.models import Q
from django.utils import timezone
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination

from accounts.models import Account
from .models import Transaction, IdempotencyKey
from .serializers import TransactionSerializer
from .services import get_account_balance

from fraud.ai_service import predict_fraud
from fraud.models import FraudFlag
from users.notification_views import push_notification
from users.models import AuditLog
from users.permissions import IsAdmin

from django.utils.dateparse import parse_date



class TransferView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):

        if request.user.is_locked or not request.user.is_active:
            return Response(
                {"detail": "User account is not allowed to perform transactions"},
                status=status.HTTP_403_FORBIDDEN
            )
        from_account_id = request.data.get('from_account')
        to_account_number = request.data.get('to_account_number')
        try:
            amount = Decimal(request.data.get("amount"))
        except:
            return Response({"detail": "Invalid amount format"}, status=400)
        
        idempotency_key = request.headers.get('Idempotency-Key')

        if amount <= 0:
            return Response({"detail": "Invalid amount"}, status=400)

        if not idempotency_key:
            return Response({"detail": "Idempotency-Key required"}, status=400)

        if IdempotencyKey.objects.filter(
            key=idempotency_key,
            user=request.user
        ).exists():
            return Response(
                {"detail": "Duplicate request"},
                status=status.HTTP_409_CONFLICT
            )

        try:
            from_account = Account.objects.get(id=from_account_id, owner=request.user)
        except Account.DoesNotExist:
            return Response({"detail": "Source account not found"}, status=404)

        try:
            to_account = Account.objects.get(account_number=to_account_number)
        except Account.DoesNotExist:
            return Response({"detail": "Destination account not found"}, status=404)
        
        # FIX 3: Prevent self-transfer to same account
        if from_account.id == to_account.id:
            return Response(
                {"detail": "Cannot transfer to the same account"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # FIX 4: Only ACTIVE accounts can transact
        if from_account.status != "ACTIVE":
            return Response(
                {"detail": "Source account is not active"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if to_account.status != "ACTIVE":
            return Response(
                {"detail": "Destination account is not active"},
                status=status.HTTP_400_BAD_REQUEST
        )

        balance = get_account_balance(from_account)
        if balance < amount:
            return Response({"detail": "Insufficient balance"}, status=400)

        reference = str(uuid.uuid4())

        with db_transaction.atomic():
            IdempotencyKey.objects.create(
                key=idempotency_key,
                user=request.user
            )

            debit = Transaction.objects.create(
                account=from_account,
                amount=amount,
                type='DEBIT',
                reference=reference,
                description=f"Transfer to {to_account.owner.full_name} ({to_account.account_number[-4:]})"
            )

            credit = Transaction.objects.create(
                account=to_account,
                amount=amount,
                type='CREDIT',
                reference=reference,
                description=f"Transfer from {from_account.owner.full_name} ({from_account.account_number[-4:]})"
            )

            # ===== AI FRAUD DETECTION =====
            try:
                fraud_result = predict_fraud(debit, from_account, request.user)
                if fraud_result["is_fraud"]:
                    FraudFlag.objects.create(
                        transaction=debit,
                        risk_score=fraud_result["risk_score"],
                        reasons=[fraud_result["reason"]]
                    )
                    push_notification(
                        from_account.owner, 'FRAUD',
                        'Suspicious Transaction Detected',
                        f'A transfer of ₹{amount} has been flagged for review.'
                    )
            except Exception:
                pass

        # Notify recipient (outside atomic block so it doesn't rollback on WS failure)
        push_notification(
            to_account.owner, 'TRANSACTION',
            'Payment Received',
            f'You received ₹{amount} from {from_account.owner.full_name}.'
        )
        AuditLog.log(request, 'TRANSFER', 'Transaction', reference,
                     f'₹{amount} from {from_account.account_number} to {to_account.account_number}')

        return Response({
            "reference": reference,
            "debit": TransactionSerializer(debit).data,
            "credit": TransactionSerializer(credit).data,
        }, status=201)

class TransactionPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


class AccountTransactionsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, account_id):
        try:
            account = Account.objects.get(id=account_id, owner=request.user)
        except Account.DoesNotExist:
            return Response(status=404)

        queryset = Transaction.objects.filter(account=account)

        if search := request.query_params.get('search'):
            queryset = queryset.filter(
                Q(reference__icontains=search) |
                Q(description__icontains=search)
            )
        if txn_type := request.query_params.get('type'):
            queryset = queryset.filter(type=txn_type)
        if min_amount := request.query_params.get('min_amount'):
            queryset = queryset.filter(amount__gte=min_amount)
        if max_amount := request.query_params.get('max_amount'):
            queryset = queryset.filter(amount__lte=max_amount)
        if date_from := request.query_params.get('date_from'):
            queryset = queryset.filter(created_at__date__gte=date_from)
        if date_to := request.query_params.get('date_to'):
            queryset = queryset.filter(created_at__date__lte=date_to)

        ordering = request.query_params.get('ordering', '-created_at')
        allowed_ordering = ['created_at', '-created_at', 'amount', '-amount']
        if ordering not in allowed_ordering:
            ordering = '-created_at'
        queryset = queryset.order_by(ordering)

        paginator = TransactionPagination()
        page = paginator.paginate_queryset(queryset, request)
        if page is not None:
            serializer = TransactionSerializer(page, many=True)
            return paginator.get_paginated_response(serializer.data)

        serializer = TransactionSerializer(queryset, many=True)
        return Response(serializer.data)


class AccountBalanceView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, account_id):
        try:
            account = Account.objects.get(id=account_id, owner=request.user)
        except Account.DoesNotExist:
            return Response(status=404)

        balance = get_account_balance(account)
        return Response({"balance": balance})
    
class DepositView(APIView):
    """
    Admin deposits money into an account (funding)
    """
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request):
        account_id = request.data.get("account_id")
        amount = Decimal(request.data.get("amount", 0))

        if amount <= 0:
            return Response(
                {"detail": "Invalid amount"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            account = Account.objects.get(id=account_id)
        except Account.DoesNotExist:
            return Response(
                {"detail": "Account not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        if account.status != "ACTIVE":
            return Response(
                {"detail": "Account not active"},
                status=status.HTTP_400_BAD_REQUEST
            )

        with db_transaction.atomic():
            # Generate more descriptive deposit message
            deposit_description = f"Admin funding - Account credited by {request.user.full_name}"
            
            txn = Transaction.objects.create(
                account=account,
                amount=amount,
                type="CREDIT",
                reference=str(uuid.uuid4()),
                description=deposit_description
            )

        return Response(
            {
                "message": "Account funded successfully",
                "transaction": TransactionSerializer(txn).data
            },
            status=status.HTTP_201_CREATED
        )


class AccountStatementView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, account_id):
        try:
            account = Account.objects.get(id=account_id, owner=request.user)
        except Account.DoesNotExist:
            return Response(status=404)

        start_date = request.query_params.get("from")
        end_date = request.query_params.get("to")

        if not start_date or not end_date:
            return Response(
                {"detail": "from and to dates are required (YYYY-MM-DD)"},
                status=400
            )

        start = parse_date(start_date)
        end = parse_date(end_date)

        if not start or not end or start > end:
            return Response(
                {"detail": "Invalid date range"},
                status=400
            )

        # ✅ Transactions BEFORE start date → opening balance
        before_txns = Transaction.objects.filter(
            account=account,
            created_at__date__lt=start,
            status="SUCCESS"
        )

        opening_balance = sum(
            t.amount if t.type == "CREDIT" else -t.amount
            for t in before_txns
        )

        # ✅ Transactions WITHIN period
        period_txns = Transaction.objects.filter(
            account=account,
            created_at__date__range=(start, end),
            status="SUCCESS"
        ).order_by("created_at")

        period_delta = sum(
            t.amount if t.type == "CREDIT" else -t.amount
            for t in period_txns
        )

        closing_balance = opening_balance + period_delta

        serializer = TransactionSerializer(period_txns, many=True)

        return Response({
            "account_number": account.account_number,
            "from": start_date,
            "to": end_date,
            "opening_balance": opening_balance,
            "closing_balance": closing_balance,
            "transactions": serializer.data
        })


def _categorize_amount(amount):
    if amount <= 500:
        return "Food & Dining"
    elif amount <= 2000:
        return "Shopping"
    elif amount <= 5000:
        return "Utilities"
    elif amount <= 15000:
        return "Travel"
    else:
        return "Large Transfers"


class AnalyticsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        accounts = Account.objects.filter(owner=user)

        now = timezone.now()
        six_months_ago = now - timezone.timedelta(days=180)

        debits = Transaction.objects.filter(
            account__in=accounts,
            type='DEBIT',
            status='SUCCESS',
            created_at__gte=six_months_ago,
        ).order_by('created_at')

        # Monthly spending
        monthly = defaultdict(lambda: {"total": Decimal('0'), "count": 0})
        for txn in debits:
            key = txn.created_at.strftime("%b %Y")
            monthly[key]["total"] += txn.amount
            monthly[key]["count"] += 1

        monthly_spending = [
            {"month": m, "total": float(d["total"]), "count": d["count"]}
            for m, d in monthly.items()
        ]

        # Category breakdown
        categories = defaultdict(lambda: Decimal('0'))
        for txn in debits:
            cat = _categorize_amount(float(txn.amount))
            categories[cat] += txn.amount

        total_all = sum(categories.values()) or Decimal('1')
        category_breakdown = [
            {
                "category": cat,
                "total": float(total),
                "percentage": round(float(total / total_all * 100), 1),
            }
            for cat, total in sorted(categories.items(), key=lambda x: x[1], reverse=True)
        ]

        # Summary
        this_month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        last_month_end = this_month_start - timezone.timedelta(seconds=1)
        last_month_start = last_month_end.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

        this_month_debits = debits.filter(created_at__gte=this_month_start)
        last_month_debits = debits.filter(created_at__gte=last_month_start, created_at__lt=this_month_start)

        total_this = sum(t.amount for t in this_month_debits) or Decimal('0')
        total_last = sum(t.amount for t in last_month_debits) or Decimal('0')
        count_this = this_month_debits.count()

        change_pct = 0.0
        if total_last > 0:
            change_pct = round(float((total_this - total_last) / total_last * 100), 1)

        highest_cat = category_breakdown[0]["category"] if category_breakdown else "N/A"
        avg_txn = float(total_this / count_this) if count_this > 0 else 0.0

        return Response({
            "monthly_spending": monthly_spending,
            "category_breakdown": category_breakdown,
            "summary": {
                "total_spent_this_month": float(total_this),
                "total_spent_last_month": float(total_last),
                "change_percentage": change_pct,
                "highest_spending_category": highest_cat,
                "average_transaction": round(avg_txn, 2),
                "total_transactions_this_month": count_this,
            },
        })


class StatementPDFView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, account_id):
        import io
        from datetime import date
        from django.http import HttpResponse
        from reportlab.lib.pagesizes import A4
        from reportlab.lib import colors
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, HRFlowable
        from reportlab.lib.units import inch

        account = get_object_or_404(Account, id=account_id, owner=request.user)

        date_from = request.query_params.get('date_from', str(date.today().replace(day=1)))
        date_to = request.query_params.get('date_to', str(date.today()))

        transactions = Transaction.objects.filter(
            account=account,
            created_at__date__gte=date_from,
            created_at__date__lte=date_to,
        ).order_by('created_at')

        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer, pagesize=A4,
            rightMargin=inch * 0.75, leftMargin=inch * 0.75,
            topMargin=inch * 0.75, bottomMargin=inch * 0.75,
        )

        getSampleStyleSheet()
        story = []

        story.append(Paragraph(
            "<b>Digital Bank</b>",
            ParagraphStyle('BankName', fontSize=20, textColor=colors.HexColor('#2563eb'))
        ))
        story.append(Paragraph(
            "Account Statement",
            ParagraphStyle('SubTitle', fontSize=14, textColor=colors.gray)
        ))
        story.append(Spacer(1, 0.2 * inch))
        story.append(HRFlowable(width="100%", color=colors.HexColor('#2563eb')))
        story.append(Spacer(1, 0.2 * inch))

        info_data = [
            ["Account Holder:", request.user.full_name or request.user.email],
            ["Account Number:", account.account_number],
            ["Account Type:", account.account_type],
            ["Statement Period:", f"{date_from} to {date_to}"],
            ["Generated On:", str(date.today())],
        ]
        info_table = Table(info_data, colWidths=[2 * inch, 4 * inch])
        info_table.setStyle(TableStyle([
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ]))
        story.append(info_table)
        story.append(Spacer(1, 0.3 * inch))

        table_data = [["Date", "Reference", "Type", "Amount", "Status"]]
        total_debit = Decimal('0')
        total_credit = Decimal('0')

        for txn in transactions:
            if txn.type == 'DEBIT':
                amount_str = f"-₹{txn.amount:,.2f}"
                total_debit += txn.amount
            else:
                amount_str = f"+₹{txn.amount:,.2f}"
                total_credit += txn.amount

            table_data.append([
                txn.created_at.strftime('%d %b %Y'),
                (txn.reference[:25] if txn.reference else '-'),
                txn.type,
                amount_str,
                txn.status,
            ])

        table_data.append(['', '', 'Total Debits:', f"₹{total_debit:,.2f}", ''])
        table_data.append(['', '', 'Total Credits:', f"₹{total_credit:,.2f}", ''])

        col_widths = [1.2 * inch, 2.3 * inch, 1 * inch, 1.3 * inch, 0.9 * inch]
        txn_table = Table(table_data, colWidths=col_widths)
        txn_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#2563eb')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('ROWBACKGROUNDS', (0, 1), (-1, -3), [colors.white, colors.HexColor('#f8fafc')]),
            ('GRID', (0, 0), (-1, -3), 0.5, colors.lightgrey),
            ('FONTNAME', (0, -2), (-1, -1), 'Helvetica-Bold'),
            ('LINEABOVE', (0, -2), (-1, -2), 1, colors.HexColor('#2563eb')),
        ]))
        story.append(txn_table)

        doc.build(story)
        buffer.seek(0)

        filename = f"statement_{account.account_number}_{date_from}_{date_to}.pdf"
        response = HttpResponse(buffer.read(), content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        return response