import pytest
from decimal import Decimal
from rest_framework import status
from accounts.models import Account
from accounts.utils import generate_account_number
from transactions.models import Transaction


@pytest.fixture
def customer_account(db, customer_user):
    return Account.objects.create(
        owner=customer_user,
        account_type='SAVINGS',
        account_number=generate_account_number(),
        status='ACTIVE'
    )


@pytest.fixture
def funded_account(db, customer_user):
    account = Account.objects.create(
        owner=customer_user,
        account_type='SAVINGS',
        account_number=generate_account_number(),
        status='ACTIVE'
    )
    Transaction.objects.create(
        account=account,
        amount=Decimal('50000.00'),
        type='CREDIT',
        reference='DEPOSIT-001',
        status='SUCCESS'
    )
    return account


@pytest.mark.django_db
class TestAccounts:

    def test_create_account_admin_only(self, admin_client, customer_user):
        response = admin_client.post(
            '/api/accounts/create/',
            {'owner_id': customer_user.id, 'account_type': 'SAVINGS'}
        )
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['account_type'] == 'SAVINGS'

    def test_customer_cannot_create_account(self, auth_client):
        response = auth_client.post(
            '/api/accounts/create/',
            {'account_type': 'SAVINGS'}
        )
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_cannot_create_duplicate_savings(
            self, admin_client, customer_user, customer_account):
        response = admin_client.post(
            '/api/accounts/create/',
            {'owner_id': customer_user.id, 'account_type': 'SAVINGS'}
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_get_my_accounts(
            self, auth_client, customer_account):
        response = auth_client.get('/api/accounts/my/')
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) >= 1

    def test_cannot_access_other_user_account(
            self, auth_client, db):
        from django.contrib.auth import get_user_model
        User = get_user_model()
        other_user = User.objects.create_user(
            email='other@test.com',
            password='OtherPass123!',
            full_name='Other User',
            role='CUSTOMER'
        )
        other_account = Account.objects.create(
            owner=other_user,
            account_type='SAVINGS',
            account_number=generate_account_number(),
            status='ACTIVE'
        )
        response = auth_client.get(
            f'/api/accounts/{other_account.id}/'
        )
        assert response.status_code in [
            status.HTTP_403_FORBIDDEN,
            status.HTTP_404_NOT_FOUND
        ]


@pytest.mark.django_db
class TestTransactions:

    def test_get_balance(
            self, auth_client, funded_account):
        response = auth_client.get(
            f'/api/transactions/{funded_account.id}/balance/'
        )
        assert response.status_code == status.HTTP_200_OK
        assert Decimal(str(response.data['balance'])) == Decimal('50000.00')

    def test_transfer_success(
            self, auth_client, customer_user,
            funded_account, db):
        from django.contrib.auth import get_user_model
        User = get_user_model()
        recipient = User.objects.create_user(
            email='recipient@test.com',
            password='RecipPass123!',
            full_name='Recipient',
            role='CUSTOMER'
        )
        to_account = Account.objects.create(
            owner=recipient,
            account_type='SAVINGS',
            account_number=generate_account_number(),
            status='ACTIVE'
        )
        response = auth_client.post(
            '/api/transactions/transfer/',
            {
                'from_account': str(funded_account.id),
                'to_account_number': to_account.account_number,
                'amount': '1000.00',
            },
            HTTP_IDEMPOTENCY_KEY='test-idem-001'
        )
        assert response.status_code == status.HTTP_201_CREATED

    def test_transfer_insufficient_funds(
            self, auth_client, customer_user, db):
        from django.contrib.auth import get_user_model
        User = get_user_model()
        recipient = User.objects.create_user(
            email='recip_insuf@test.com',
            password='RecipPass123!',
            full_name='Recipient',
            role='CUSTOMER'
        )
        empty_account = Account.objects.create(
            owner=customer_user,
            account_type='CURRENT',
            account_number=generate_account_number(),
            status='ACTIVE'
        )
        to_account = Account.objects.create(
            owner=recipient,
            account_type='SAVINGS',
            account_number=generate_account_number(),
            status='ACTIVE'
        )
        response = auth_client.post(
            '/api/transactions/transfer/',
            {
                'from_account': str(empty_account.id),
                'to_account_number': to_account.account_number,
                'amount': '999999.00',
            },
            HTTP_IDEMPOTENCY_KEY='test-idem-002'
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_idempotency_prevents_duplicate(
            self, auth_client, customer_user,
            funded_account, db):
        from django.contrib.auth import get_user_model
        User = get_user_model()
        recipient = User.objects.create_user(
            email='recip2@test.com',
            password='RecipPass123!',
            full_name='Recipient2',
            role='CUSTOMER'
        )
        to_account = Account.objects.create(
            owner=recipient,
            account_type='SAVINGS',
            account_number=generate_account_number(),
            status='ACTIVE'
        )
        kwargs = {
            'data': {
                'from_account': str(funded_account.id),
                'to_account_number': to_account.account_number,
                'amount': '500.00',
            },
            'HTTP_IDEMPOTENCY_KEY': 'unique-key-abc',
        }
        r1 = auth_client.post('/api/transactions/transfer/', **kwargs)
        r2 = auth_client.post('/api/transactions/transfer/', **kwargs)
        assert r1.status_code == status.HTTP_201_CREATED
        assert r2.status_code in [
            status.HTTP_200_OK,
            status.HTTP_409_CONFLICT
        ]
