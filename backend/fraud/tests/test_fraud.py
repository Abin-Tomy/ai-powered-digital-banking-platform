import pytest
from unittest.mock import patch
from decimal import Decimal
from rest_framework import status
from accounts.models import Account
from accounts.utils import generate_account_number
from transactions.models import Transaction


@pytest.mark.django_db
class TestFraudDetection:

    def test_ml_service_failure_does_not_block_transfer(
            self, auth_client, customer_user, db):
        """Fail-safe: ML service down must not block transactions"""
        from django.contrib.auth import get_user_model
        User = get_user_model()
        recipient = User.objects.create_user(
            email='failsafe@test.com',
            password='FailSafe123!',
            full_name='Failsafe User',
            role='CUSTOMER'
        )
        from_acct = Account.objects.create(
            owner=customer_user,
            account_type='SAVINGS',
            account_number=generate_account_number(),
            status='ACTIVE'
        )
        to_acct = Account.objects.create(
            owner=recipient,
            account_type='SAVINGS',
            account_number=generate_account_number(),
            status='ACTIVE'
        )
        Transaction.objects.create(
            account=from_acct,
            amount=Decimal('50000'),
            type='CREDIT',
            reference='SEED',
            status='SUCCESS'
        )

        with patch('fraud.ai_service.requests.post') as mock_post:
            mock_post.side_effect = Exception("ML service down")
            response = auth_client.post(
                '/api/transactions/transfer/',
                {
                    'from_account': str(from_acct.id),
                    'to_account_number': to_acct.account_number,
                    'amount': '100.00',
                },
                HTTP_IDEMPOTENCY_KEY='failsafe-test-001'
            )
        assert response.status_code == status.HTTP_201_CREATED

    def test_fraud_features_no_random(self):
        """Verify no random imports in ai_service"""
        import fraud.ai_service as ai_service
        import inspect
        source = inspect.getsource(ai_service)
        assert 'random.random()' not in source
        assert 'import random' not in source

    @pytest.mark.django_db
    def test_fraud_feature_dict_shape(
            self, customer_user, db):
        """Verify feature dict has all 8 required keys"""
        from fraud.ai_service import build_fraud_features
        account = Account.objects.create(
            owner=customer_user,
            account_type='SAVINGS',
            account_number=generate_account_number(),
            status='ACTIVE'
        )
        txn = Transaction(
            account=account,
            amount=Decimal('5000'),
            type='DEBIT'
        )
        features = build_fraud_features(
            txn, account, customer_user
        )
        required_keys = [
            'amount', 'transaction_hour',
            'device_trust_score', 'velocity_last_24h',
            'cardholder_age', 'foreign_transaction',
            'location_mismatch', 'merchant_category'
        ]
        for key in required_keys:
            assert key in features, \
                f"Missing feature: {key}"
