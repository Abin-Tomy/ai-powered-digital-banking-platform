import pytest
from rest_framework import status


@pytest.mark.django_db
class TestSecurityPolicies:

    def test_idor_account_isolation(
            self, auth_client, db):
        """Customer cannot access another customer's account"""
        from django.contrib.auth import get_user_model
        from accounts.models import Account
        from accounts.utils import generate_account_number
        User = get_user_model()

        other = User.objects.create_user(
            email='other_idor@test.com',
            password='OtherPass123!',
            full_name='Other',
            role='CUSTOMER'
        )
        other_account = Account.objects.create(
            owner=other,
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

    def test_unauthenticated_cannot_access_accounts(
            self, api_client):
        response = api_client.get('/api/accounts/my/')
        assert response.status_code == \
            status.HTTP_401_UNAUTHORIZED

    def test_unauthenticated_cannot_transfer(
            self, api_client):
        response = api_client.post(
            '/api/transactions/transfer/', {}
        )
        assert response.status_code == \
            status.HTTP_401_UNAUTHORIZED

    def test_customer_cannot_access_admin_endpoint(
            self, auth_client):
        response = auth_client.get(
            '/api/admin/analytics/'
        )
        assert response.status_code in [
            status.HTTP_403_FORBIDDEN,
            status.HTTP_401_UNAUTHORIZED
        ]

    def test_password_reset_token_reuse_blocked(
            self, api_client, customer_user):
        from users.models import VerificationToken
        token = VerificationToken.create_for_user(
            customer_user, 'password_reset', hours=1
        )
        # Use it once
        api_client.post('/api/auth/reset-password/', {
            'token': str(token.token),
            'password': 'NewPass123!'
        })
        # Try to use it again
        response = api_client.post(
            '/api/auth/reset-password/', {
                'token': str(token.token),
                'password': 'AnotherPass123!'
            }
        )
        assert response.status_code == \
            status.HTTP_400_BAD_REQUEST

    def test_account_enumeration_same_response(
            self, api_client, customer_user):
        """Forgot password returns same response
           whether email exists or not"""
        from django.core.cache import cache
        cache.clear()
        r1 = api_client.post(
            '/api/auth/forgot-password/',
            {'email': 'customer@test.com'}
        )
        r2 = api_client.post(
            '/api/auth/forgot-password/',
            {'email': 'nobody_here@test.com'}
        )
        # Both should return same status (200 or 429 if rate limited)
        assert r1.status_code == r2.status_code
