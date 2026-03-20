"""
Full database seed script.
Run via: python manage.py shell < seed_data.py
Or: exec(open('seed_data.py').read())
"""

import uuid, random
from decimal import Decimal
from datetime import date, timedelta
from django.utils import timezone

# ─────────────────────────────────────────────
# 1. WIPE EVERYTHING
# ─────────────────────────────────────────────
print("🧹 Wiping existing data...")

from fraud.models import FraudFlag
from transactions.models import Transaction, IdempotencyKey
from accounts.models import Account
from loans.models import LoanPayment, Loan, LoanApplication, LoanType
from credit_cards.models import (
    CreditCardTransaction, CreditCardStatement,
    CreditCard, CreditCardApplication, CreditCardType
)
from bill_payments.models import (
    RecurringBillPayment, BillPayment, Bill,
    SavedBiller, Biller, BillerCategory
)
from users.models import User, Notification

FraudFlag.objects.all().delete()
Transaction.objects.all().delete()
IdempotencyKey.objects.all().delete()
Account.objects.all().delete()
LoanPayment.objects.all().delete()
Loan.objects.all().delete()
LoanApplication.objects.all().delete()
LoanType.objects.all().delete()
CreditCardTransaction.objects.all().delete()
CreditCardStatement.objects.all().delete()
CreditCard.objects.all().delete()
CreditCardApplication.objects.all().delete()
CreditCardType.objects.all().delete()
RecurringBillPayment.objects.all().delete()
BillPayment.objects.all().delete()
Bill.objects.all().delete()
SavedBiller.objects.all().delete()
Biller.objects.all().delete()
BillerCategory.objects.all().delete()
Notification.objects.all().delete()
User.objects.all().delete()
print("   ✅ All tables cleared.")

# ─────────────────────────────────────────────
# 2. USERS
# ─────────────────────────────────────────────
print("\n👤 Creating users...")

def make_user(email, full_name, role, password="Test@1234", verified=True):
    u = User.objects.create_user(
        email=email,
        password=password,
        full_name=full_name,
        role=role,
        is_verified=verified,
        is_active=True,
    )
    return u

# Admins
admin1 = make_user("admin@bankapp.com",   "Rajan Mehta",     "ADMIN")
admin2 = make_user("admin2@bankapp.com",  "Priya Nair",      "ADMIN")

# Support agents
sup1 = make_user("support@bankapp.com",   "Kavitha Reddy",   "SUPPORT")
sup2 = make_user("support2@bankapp.com",  "Arjun Pillai",    "SUPPORT")

# Customers
c1 = make_user("alice@example.com",   "Alice Johnson",    "CUSTOMER")
c2 = make_user("bob@example.com",     "Bob Williams",     "CUSTOMER")
c3 = make_user("carol@example.com",   "Carol Davis",      "CUSTOMER")
c4 = make_user("david@example.com",   "David Brown",      "CUSTOMER")
c5 = make_user("eve@example.com",     "Eve Martinez",     "CUSTOMER")

customers = [c1, c2, c3, c4, c5]
print(f"   ✅ {User.objects.count()} users created.")

# ─────────────────────────────────────────────
# 3. ACCOUNTS
# ─────────────────────────────────────────────
print("\n🏦 Creating accounts...")

def acct_num():
    return f"ACC{random.randint(1000000000, 9999999999)}"

accounts_map = {}  # user -> [Account]

for idx, cust in enumerate(customers, 1):
    savings = Account.objects.create(
        account_number=acct_num(),
        owner=cust,
        account_type="SAVINGS",
        status="ACTIVE",
    )
    current = Account.objects.create(
        account_number=acct_num(),
        owner=cust,
        account_type="CURRENT",
        status="ACTIVE",
    )
    accounts_map[cust.id] = [savings, current]

print(f"   ✅ {Account.objects.count()} accounts created.")

# ─────────────────────────────────────────────
# 4. TRANSACTIONS
# ─────────────────────────────────────────────
print("\n💳 Creating transactions...")

def txn(account, amount, txn_type, desc, days_ago=0):
    return Transaction.objects.create(
        account=account,
        amount=Decimal(str(amount)),
        type=txn_type,
        reference=f"REF{uuid.uuid4().hex[:12].upper()}",
        description=desc,
        status="SUCCESS",
        created_at=timezone.now() - timedelta(days=days_ago),
    )

seed_transactions = []
transaction_data = [
    # (customer_index, account_index, amount, type, description, days_ago)
    # Alice
    (0, 0, 250000, "CREDIT", "Salary Credit - March 2026", 35),
    (0, 0, 250000, "CREDIT", "Salary Credit - February 2026", 65),
    (0, 0, 250000, "CREDIT", "Salary Credit - January 2026", 95),
    (0, 0, 4500,   "DEBIT",  "Amazon Purchase", 2),
    (0, 0, 1200,   "DEBIT",  "Swiggy Order", 5),
    (0, 0, 8999,   "DEBIT",  "Netflix Annual Plan", 10),
    (0, 0, 25000,  "DEBIT",  "Rent Transfer", 20),
    (0, 1, 50000,  "CREDIT", "Business Income", 15),
    (0, 1, 12000,  "DEBIT",  "Office Supplies", 12),
    # Bob
    (1, 0, 180000, "CREDIT", "Salary Credit - March 2026", 33),
    (1, 0, 180000, "CREDIT", "Salary Credit - February 2026", 63),
    (1, 0, 3500,   "DEBIT",  "Zomato Order", 1),
    (1, 0, 2200,   "DEBIT",  "Uber Ride", 3),
    (1, 0, 55000,  "DEBIT",  "Home Appliance Purchase", 7),
    (1, 0, 8000,   "DEBIT",  "BESCOM Electricity Bill", 18),
    (1, 1, 30000,  "CREDIT", "Freelance Payment", 20),
    (1, 1, 15000,  "DEBIT",  "Insurance Premium",  25),
    # Carol
    (2, 0, 320000, "CREDIT", "Salary Credit - March 2026", 30),
    (2, 0, 320000, "CREDIT", "Salary Credit - February 2026", 60),
    (2, 0, 320000, "CREDIT", "Salary Credit - January 2026", 90),
    (2, 0, 75000,  "DEBIT",  "Foreign Transfer - USD", 4),
    (2, 0, 75000,  "DEBIT",  "Suspicious Transfer at 3 AM", 6),
    (2, 0, 5500,   "DEBIT",  "Grocery Shopping", 8),
    (2, 0, 18000,  "DEBIT",  "Flight Booking", 14),
    (2, 1, 100000, "CREDIT", "Investment Return", 10),
    (2, 1, 20000,  "DEBIT",  "Stock Purchase", 11),
    # David
    (3, 0, 95000,  "CREDIT", "Salary Credit - March 2026", 28),
    (3, 0, 95000,  "CREDIT", "Salary Credit - February 2026", 58),
    (3, 0, 3000,   "DEBIT",  "Mobile Recharge", 2),
    (3, 0, 900,    "DEBIT",  "Coffee Shop", 4),
    (3, 0, 11000,  "DEBIT",  "Gym Membership Annual", 9),
    (3, 0, 4200,   "DEBIT",  "Book Store", 15),
    (3, 1, 25000,  "CREDIT", "Rental Income", 20),
    # Eve
    (4, 0, 420000, "CREDIT", "Salary Credit - March 2026", 25),
    (4, 0, 420000, "CREDIT", "Salary Credit - February 2026", 55),
    (4, 0, 420000, "CREDIT", "Salary Credit - January 2026", 85),
    (4, 0, 200000, "DEBIT",  "Multiple Rapid Withdrawals", 3),
    (4, 0, 150000, "DEBIT",  "International Wire Transfer", 3),
    (4, 0, 6700,   "DEBIT",  "Restaurant Bill", 7),
    (4, 0, 35000,  "DEBIT",  "Electronics Purchase", 12),
    (4, 1, 80000,  "CREDIT", "Consulting Fee", 18),
    (4, 1, 50000,  "DEBIT",  "Vendor Payment", 19),
]

for c_idx, a_idx, amount, ttype, desc, days in transaction_data:
    cust = customers[c_idx]
    acct = accounts_map[cust.id][a_idx]
    t = txn(acct, amount, ttype, desc, days)
    seed_transactions.append((c_idx, t))

print(f"   ✅ {Transaction.objects.count()} transactions created.")

# ─────────────────────────────────────────────
# 5. FRAUD FLAGS
# ─────────────────────────────────────────────
print("\n🚨 Creating fraud flags...")

# Carol's suspicious transactions (indices 5, 6 = c_idx==2)
# Eve's suspicious (indices -6, -7 = c_idx==4)
fraud_candidates = [
    (t, 82, ["Large transfer to new beneficiary", "Amount exceeds 10× avg daily spend", "Unusual time of night"])
    for c_idx, t in seed_transactions if c_idx == 2 and "Suspicious" in t.description
] + [
    (t, 91, ["Rapid succession withdrawals", "Geographic anomaly", "Exceeds 24h limit"])
    for c_idx, t in seed_transactions if c_idx == 4 and "Rapid" in t.description
] + [
    (t, 88, ["International wire to high-risk jurisdiction", "First-time beneficiary", "Large amount"])
    for c_idx, t in seed_transactions if c_idx == 4 and "International" in t.description
] + [
    (t, 67, ["Unusually large foreign transfer", "First international transaction"])
    for c_idx, t in seed_transactions if c_idx == 2 and "Foreign" in t.description
]

for (t, score, reasons) in fraud_candidates:
    FraudFlag.objects.create(
        transaction=t,
        status="SUSPICIOUS",
        risk_score=score,
        reasons=reasons,
    )

# One confirmed and one false positive for variety
all_flags = list(FraudFlag.objects.all())
if len(all_flags) >= 2:
    f = all_flags[0]
    f.status = "CONFIRMED_FRAUD"
    f.reviewed_by = admin1
    f.reviewed_at = timezone.now() - timedelta(days=1)
    f.save()

    f2 = all_flags[1]
    f2.status = "FALSE_POSITIVE"
    f2.reviewed_by = sup1
    f2.reviewed_at = timezone.now() - timedelta(hours=6)
    f2.save()

print(f"   ✅ {FraudFlag.objects.count()} fraud flags created.")

# ─────────────────────────────────────────────
# 6. LOAN TYPES
# ─────────────────────────────────────────────
print("\n🏠 Creating loan types & applications...")

lt_personal = LoanType.objects.create(
    name="Personal Loan",
    description="Unsecured personal loan for any purpose including travel, medical, or education.",
    interest_rate=Decimal("12.50"),
    min_amount=Decimal("50000"),
    max_amount=Decimal("2500000"),
    min_tenure_months=12,
    max_tenure_months=60,
    processing_fee=Decimal("1000"),
    is_active=True,
)
lt_home = LoanType.objects.create(
    name="Home Loan",
    description="Long-term loan to purchase or construct residential property.",
    interest_rate=Decimal("8.75"),
    min_amount=Decimal("500000"),
    max_amount=Decimal("50000000"),
    min_tenure_months=60,
    max_tenure_months=240,
    processing_fee=Decimal("5000"),
    is_active=True,
)
lt_car = LoanType.objects.create(
    name="Car Loan",
    description="Auto loan for purchase of new or used vehicles.",
    interest_rate=Decimal("9.75"),
    min_amount=Decimal("100000"),
    max_amount=Decimal("5000000"),
    min_tenure_months=12,
    max_tenure_months=84,
    processing_fee=Decimal("2500"),
    is_active=True,
)
lt_edu = LoanType.objects.create(
    name="Education Loan",
    description="Loan for higher education at recognized institutions.",
    interest_rate=Decimal("10.50"),
    min_amount=Decimal("100000"),
    max_amount=Decimal("7500000"),
    min_tenure_months=12,
    max_tenure_months=84,
    processing_fee=Decimal("0"),
    is_active=True,
)

# ─────────────────────────────────────────────
# Loan Applications
# ─────────────────────────────────────────────
today = date.today()

def mk_loan_app(applicant, ltype, amt, months, purpose, income, emp, employer, status="APPROVED",
                approved_amt=None, reviewed_by=None):
    la = LoanApplication.objects.create(
        applicant=applicant,
        loan_type=ltype,
        requested_amount=Decimal(str(amt)),
        tenure_months=months,
        purpose=purpose,
        annual_income=Decimal(str(income)),
        employment_type=emp,
        employer_name=employer,
        status=status,
        approved_amount=Decimal(str(approved_amt or amt)),
        approved_rate=ltype.interest_rate,
        reviewed_by=reviewed_by,
        reviewed_at=timezone.now() - timedelta(days=5) if status == "APPROVED" else None,
    )
    return la

# Alice — Approved home loan
la_alice = mk_loan_app(c1, lt_home, 3500000, 180, "Purchase 2BHK apartment in Kochi",
                       3000000, "Salaried", "Infosys Ltd", reviewed_by=admin1)
# Bob — Approved personal loan
la_bob = mk_loan_app(c2, lt_personal, 500000, 36, "Medical emergency and home renovation",
                     2160000, "Salaried", "Wipro Ltd", reviewed_by=admin2)
# Carol — Approved car loan
la_carol = mk_loan_app(c3, lt_car, 800000, 60, "Purchase Maruti Dzire 2026",
                       3840000, "Salaried", "TCS Ltd", reviewed_by=admin1)
# David — Pending personal loan
la_david_pend = mk_loan_app(c4, lt_personal, 200000, 24, "Travel and personal expenses",
                            1140000, "Salaried", "HCL Technologies", status="PENDING",
                            approved_amt=None, reviewed_by=None)
# Eve — Approved education loan
la_eve = mk_loan_app(c5, lt_edu, 1500000, 60, "Masters in Data Science at IIT Bombay",
                     5040000, "Salaried", "Amazon India", reviewed_by=admin2)
# Eve — Rejected car loan
mk_loan_app(c5, lt_car, 2000000, 72, "Luxury vehicle purchase",
            5040000, "Salaried", "Amazon India", status="REJECTED",
            approved_amt=None, reviewed_by=admin1)

# ─────────────────────────────────────────────
# Active Loans (for approved applications)
# ─────────────────────────────────────────────
def mk_loan(la, principal, rate, months, borrower):
    monthly_rate = float(rate) / 100 / 12
    emi = float(principal) * monthly_rate * ((1 + monthly_rate) ** months) / (((1 + monthly_rate) ** months) - 1)
    emi = Decimal(str(round(emi, 2)))
    paid_months = random.randint(3, 8)
    outstanding = Decimal(str(round(float(principal) - (float(emi) * paid_months * 0.5), 2)))
    loan = Loan.objects.create(
        loan_application=la,
        borrower=borrower,
        loan_type=la.loan_type,
        principal_amount=Decimal(str(principal)),
        interest_rate=rate,
        tenure_months=months,
        monthly_emi=emi,
        outstanding_balance=outstanding,
        status="ACTIVE",
        first_emi_date=today - timedelta(days=30 * paid_months),
        maturity_date=today + timedelta(days=30 * (months - paid_months)),
    )
    return loan

loan_alice = mk_loan(la_alice, 3500000, Decimal("8.75"), 180, c1)
loan_bob   = mk_loan(la_bob,   500000,  Decimal("12.50"), 36, c2)
loan_carol = mk_loan(la_carol, 800000,  Decimal("9.75"),  60, c3)
loan_eve   = mk_loan(la_eve,   1500000, Decimal("10.50"), 60, c5)

print(f"   ✅ {LoanType.objects.count()} loan types, {LoanApplication.objects.count()} applications, {Loan.objects.count()} active loans.")

# ─────────────────────────────────────────────
# 7. CREDIT CARDS
# ─────────────────────────────────────────────
print("\n💳 Creating credit card types & cards...")

ct_platinum = CreditCardType.objects.create(
    name="Platinum Rewards",
    description="Premium card with travel rewards, lounge access and 3× reward points.",
    minimum_credit_limit=Decimal("100000"),
    maximum_credit_limit=Decimal("1000000"),
    annual_fee=Decimal("4999"),
    interest_rate=Decimal("36.00"),
    cash_advance_limit_percentage=Decimal("30"),
    minimum_income_requirement=Decimal("600000"),
    reward_points_per_100=Decimal("3"),
    is_active=True,
)
ct_gold = CreditCardType.objects.create(
    name="Gold Classic",
    description="Everyday card with 2× fuel and grocery rewards, zero forex markup.",
    minimum_credit_limit=Decimal("50000"),
    maximum_credit_limit=Decimal("500000"),
    annual_fee=Decimal("999"),
    interest_rate=Decimal("36.00"),
    cash_advance_limit_percentage=Decimal("40"),
    minimum_income_requirement=Decimal("300000"),
    reward_points_per_100=Decimal("2"),
    is_active=True,
)
ct_basic = CreditCardType.objects.create(
    name="Basic Silver",
    description="Entry-level card for students and first-time credit users.",
    minimum_credit_limit=Decimal("20000"),
    maximum_credit_limit=Decimal("100000"),
    annual_fee=Decimal("0"),
    interest_rate=Decimal("36.00"),
    cash_advance_limit_percentage=Decimal("50"),
    minimum_income_requirement=Decimal("150000"),
    reward_points_per_100=Decimal("1"),
    is_active=True,
)

from credit_cards.models import CreditCardApplication, CreditCard

def card_number():
    return "".join([str(random.randint(0, 9)) for _ in range(16)])

def mk_card(user, ctype, limit, avail, cardholder):
    cn = card_number()
    app = CreditCardApplication.objects.create(
        user=user,
        card_type=ctype,
        requested_credit_limit=Decimal(str(limit)),
        annual_income=Decimal("600000"),
        employment_type="Salaried",
        company_name="Demo Corp",
        work_experience_months=36,
        monthly_salary=Decimal(str(int(limit) // 12)),
        existing_credit_cards=0,
        existing_loans_emi=Decimal("0"),
        status="APPROVED",
        approved_credit_limit=Decimal(str(limit)),
        reviewed_by=admin1,
        reviewed_at=timezone.now() - timedelta(days=10),
    )
    card = CreditCard.objects.create(
        card_number=cn,
        last_four=cn[-4:],
        cardholder_name=cardholder,
        user=user,
        card_type=ctype,
        application=app,
        credit_limit=Decimal(str(limit)),
        available_credit=Decimal(str(avail)),
        cash_advance_limit=Decimal(str(int(limit) * 0.3)),
        available_cash_advance=Decimal(str(int(limit) * 0.3)),
        expiry_date=date(2029, 12, 31),
        issue_date=date(2024, 1, 1),
        status="ACTIVE",
        reward_points=random.randint(100, 5000),
        minimum_due=Decimal(str(round((limit - avail) * 0.05, 2))),
        due_date=date.today() + timedelta(days=15),
    )
    return card

mk_card(c1, ct_platinum, 500000, 423000, "Alice Johnson")
mk_card(c2, ct_gold,     200000, 154000, "Bob Williams")
mk_card(c3, ct_platinum, 750000, 690000, "Carol Davis")
mk_card(c4, ct_basic,     50000,  42000, "David Brown")
mk_card(c5, ct_gold,     350000, 298000, "Eve Martinez")

print(f"   ✅ {CreditCardType.objects.count()} card types, {CreditCard.objects.count()} cards issued.")

# ─────────────────────────────────────────────
# 8. BILL CATEGORIES & BILLERS
# ─────────────────────────────────────────────
print("\n📄 Creating billers & bill payments...")

def mk_cat(name, icon, order):
    return BillerCategory.objects.create(name=name, icon=icon, sort_order=order, is_active=True)

cat_elec  = mk_cat("Electricity",   "zap",           1)
cat_water = mk_cat("Water",         "droplets",      2)
cat_gas   = mk_cat("Gas",           "flame",         3)
cat_mobile= mk_cat("Mobile",        "smartphone",    4)
cat_broad = mk_cat("Broadband",     "wifi",          5)
cat_dth   = mk_cat("DTH / Cable TV","tv",            6)
cat_ins   = mk_cat("Insurance",     "shield",        7)

def mk_biller(name, cat, code, min_a=100, max_a=50000, fee_pct=0, instant=True):
    return Biller.objects.create(
        name=name, category=cat, biller_code=code,
        min_amount=Decimal(str(min_a)), max_amount=Decimal(str(max_a)),
        convenience_fee_percentage=Decimal(str(fee_pct)),
        is_active=True, is_instant_payment=instant,
    )

biller_bescom  = mk_biller("BESCOM - Bangalore Electricity",   cat_elec,   "BESCOM01")
biller_msedcl  = mk_biller("MSEDCL - Maharashtra Electricity", cat_elec,   "MSEDCL01")
biller_bwssb   = mk_biller("BWSSB - Bangalore Water",          cat_water,  "BWSSB01")
biller_igl     = mk_biller("IGL - Indraprastha Gas",           cat_gas,    "IGL001")
biller_airtel  = mk_biller("Airtel Postpaid",                  cat_mobile, "AIRTEL01")
biller_jio     = mk_biller("Jio Postpaid",                     cat_mobile, "JIO001")
biller_bsnl    = mk_biller("BSNL Broadband",                   cat_broad,  "BSNL01")
biller_act     = mk_biller("ACT Fibernet",                     cat_broad,  "ACT001")
biller_tatasky = mk_biller("Tata Sky DTH",                     cat_dth,    "TATASKY1")
biller_lic     = mk_biller("LIC Premium",                      cat_ins,    "LIC001", min_a=500, max_a=100000)

# ─────────────────────────────────────────────
# Bill Payments  (SavedBiller → Bill → BillPayment)
# ─────────────────────────────────────────────

def mk_bill_payment(user, biller, account, amount, customer_id, nickname, days_ago=0):
    # 1. SavedBiller (user's saved account with this biller)
    sb, _ = SavedBiller.objects.get_or_create(
        user=user, biller=biller, customer_id=customer_id,
        defaults=dict(nickname=nickname, mobile_number="9999999999"),
    )
    # 2. Bill (the outstanding bill fetched from biller)
    due = (timezone.now() - timedelta(days=days_ago - 5)).date()
    bill = Bill.objects.create(
        saved_biller=sb,
        bill_number=f"BILL{uuid.uuid4().hex[:8].upper()}",
        bill_date=(timezone.now() - timedelta(days=days_ago + 5)).date(),
        due_date=due,
        bill_period_from=(timezone.now() - timedelta(days=days_ago + 35)).date(),
        bill_period_to=(timezone.now() - timedelta(days=days_ago + 5)).date(),
        bill_amount=Decimal(str(amount)),
        late_fee=Decimal("0"),
        other_charges=Decimal("0"),
        total_amount=Decimal(str(amount)),
        paid_amount=Decimal(str(amount)),
        outstanding_amount=Decimal("0"),
        status="PAID",
        biller_reference=f"BREF{uuid.uuid4().hex[:8].upper()}",
    )
    # 3. BillPayment
    ref = f"BPREF{uuid.uuid4().hex[:8].upper()}"
    bp = BillPayment.objects.create(
        user=user,
        saved_biller=sb,
        bill=bill,
        payment_reference=ref,
        amount=Decimal(str(amount)),
        convenience_fee=Decimal("0"),
        total_amount=Decimal(str(amount)),
        payment_mode="ACCOUNT",
        from_account_number=account.account_number,
        transaction_id=f"BPTXN{uuid.uuid4().hex[:10].upper()}",
        status="COMPLETED",
        completed_at=timezone.now() - timedelta(days=days_ago),
    )
    # 4. Mirror as bank transaction
    Transaction.objects.create(
        account=account,
        amount=Decimal(str(amount)),
        type="DEBIT",
        reference=ref,
        description=f"Bill Payment – {biller.name}",
        status="SUCCESS",
        created_at=timezone.now() - timedelta(days=days_ago),
    )
    return bp

mk_bill_payment(c1, biller_bescom,  accounts_map[c1.id][0], 1840,  "CUST-BLR-20011", "Home Electricity", 5)
mk_bill_payment(c1, biller_airtel,  accounts_map[c1.id][0], 699,   "9876543210",      "My Airtel",        10)
mk_bill_payment(c1, biller_act,     accounts_map[c1.id][0], 1199,  "ACT-KL-5511",     "Home Internet",    15)
mk_bill_payment(c2, biller_msedcl,  accounts_map[c2.id][0], 2340,  "CUST-MH-98721",   "Flat Electricity", 4)
mk_bill_payment(c2, biller_jio,     accounts_map[c2.id][0], 799,   "7654321098",      "My Jio",           9)
mk_bill_payment(c2, biller_tatasky, accounts_map[c2.id][0], 399,   "TSKY-002341",     "Home DTH",         20)
mk_bill_payment(c3, biller_bwssb,   accounts_map[c3.id][0], 650,   "BWSSB-87431",     "Home Water",       7)
mk_bill_payment(c3, biller_igl,     accounts_map[c3.id][0], 1120,  "IGL-DEL-33100",   "Piped Gas",        12)
mk_bill_payment(c3, biller_lic,     accounts_map[c3.id][1], 8400,  "LIC-101112131",   "Life Insurance",   25)
mk_bill_payment(c4, biller_bescom,  accounts_map[c4.id][0], 980,   "CUST-BLR-61199",  "Office Power",     6)
mk_bill_payment(c4, biller_bsnl,    accounts_map[c4.id][0], 549,   "BSNL-4421177",    "Home Broadband",   11)
mk_bill_payment(c5, biller_airtel,  accounts_map[c5.id][0], 1299,  "9123456789",      "My Airtel",        3)
mk_bill_payment(c5, biller_lic,     accounts_map[c5.id][1], 15600, "LIC-998877665",   "Term Insurance",   28)

print(f"   ✅ {BillerCategory.objects.count()} biller categories, {Biller.objects.count()} billers, {BillPayment.objects.count()} payments.")

# ─────────────────────────────────────────────
# 9. NOTIFICATIONS
# ─────────────────────────────────────────────
print("\n🔔 Creating notifications...")

def mk_notif(user, title, msg, ntype="SYSTEM", days_ago=0):
    Notification.objects.create(
        user=user,
        title=title,
        message=msg,
        notification_type=ntype,
        is_read=False,
        created_at=timezone.now() - timedelta(days=days_ago),
    )

mk_notif(c1, "Loan Disbursed",          "Your home loan of ₹35,00,000 has been disbursed successfully.",         "LOAN",         5)
mk_notif(c1, "Credit Card Statement",   "Your March 2026 statement is ready. Minimum due: ₹2,450.",              "CREDIT_CARD",  2)
mk_notif(c1, "Bill Payment Success",    "ACT Fibernet bill ₹1,199 paid successfully.",                           "TRANSACTION", 15)
mk_notif(c2, "Bill Payment Success",    "MSEDCL electricity bill ₹2,340 paid successfully.",                     "TRANSACTION",  4)
mk_notif(c2, "Loan Approved",           "Your personal loan of ₹5,00,000 has been approved. Disbursement soon.", "LOAN",         6)
mk_notif(c2, "Transaction Alert",       "Debit of ₹55,000 for Home Appliance Purchase on your savings account.", "TRANSACTION",  7)
mk_notif(c3, "Fraud Alert",             "Unusual transaction detected on your account. Please review immediately.","FRAUD",       6)
mk_notif(c3, "Large Debit Alert",       "A debit of ₹75,000 was made from your savings account.",                "TRANSACTION",  4)
mk_notif(c4, "Low Balance Warning",     "Your savings account balance is below ₹10,000. Please add funds.",      "SYSTEM",       1)
mk_notif(c4, "Bill Payment Success",    "BSNL Broadband bill ₹549 paid successfully.",                           "TRANSACTION", 11)
mk_notif(c5, "Fraud Alert",             "Rapid consecutive withdrawals detected on your account. Under review.",  "FRAUD",        3)
mk_notif(c5, "Loan Application Update", "Your car loan application has been rejected. Reason: High risk score.",  "LOAN",         8)
mk_notif(c5, "Salary Credited",         "₹4,20,000 salary credited to your savings account.",                    "TRANSACTION", 25)

print(f"   ✅ {Notification.objects.count()} notifications created.")

# ─────────────────────────────────────────────
# SUMMARY
# ─────────────────────────────────────────────
print("\n" + "="*55)
print("✅  SEED COMPLETE — Database Summary")
print("="*55)
print(f"  Users         : {User.objects.count()}")
print(f"    ADMIN       : {User.objects.filter(role='ADMIN').count()}")
print(f"    SUPPORT     : {User.objects.filter(role='SUPPORT').count()}")
print(f"    CUSTOMER    : {User.objects.filter(role='CUSTOMER').count()}")
print(f"  Accounts      : {Account.objects.count()}")
print(f"  Transactions  : {Transaction.objects.count()}")
print(f"  Fraud Flags   : {FraudFlag.objects.count()}")
print(f"  Loan Types    : {LoanType.objects.count()}")
print(f"  Loan Apps     : {LoanApplication.objects.count()}")
print(f"  Active Loans  : {Loan.objects.count()}")
print(f"  Card Types    : {CreditCardType.objects.count()}")
print(f"  Credit Cards  : {CreditCard.objects.count()}")
print(f"  Billers       : {Biller.objects.count()}")
print(f"  Bill Payments : {BillPayment.objects.count()}")
print(f"  Notifications : {Notification.objects.count()}")
print("="*55)
print("\nCredentials (all passwords: Test@1234):")
print("  admin@bankapp.com     — ADMIN")
print("  admin2@bankapp.com    — ADMIN")
print("  support@bankapp.com   — SUPPORT")
print("  support2@bankapp.com  — SUPPORT")
print("  alice@example.com     — CUSTOMER")
print("  bob@example.com       — CUSTOMER")
print("  carol@example.com     — CUSTOMER")
print("  david@example.com     — CUSTOMER")
print("  eve@example.com       — CUSTOMER")
