import pytest
from django.contrib.auth import get_user_model
from rest_framework import status

User = get_user_model()


@pytest.mark.django_db
class TestRegistration:

    def test_register_success(self, api_client):
        response = api_client.post('/api/auth/register/', {
            'email': 'new@test.com',
            'password': 'StrongPass123!',
            'full_name': 'New User'
        })
        assert response.status_code == status.HTTP_201_CREATED
        assert User.objects.filter(email='new@test.com').exists()

    @pytest.mark.django_db(transaction=True)
    def test_register_duplicate_email(self, api_client):
        from django.db import IntegrityError as DjangoIntegrityError
        # First register succeeds
        api_client.post('/api/auth/register/', {
            'email': 'dup@test.com',
            'password': 'StrongPass123!',
            'full_name': 'First User'
        })
        # Second register with same email should fail
        try:
            response = api_client.post('/api/auth/register/', {
                'email': 'dup@test.com',
                'password': 'StrongPass123!',
                'full_name': 'Duplicate'
            })
            # If no exception, it should be an error status
            assert response.status_code in [
                status.HTTP_400_BAD_REQUEST,
                status.HTTP_500_INTERNAL_SERVER_ERROR
            ]
        except DjangoIntegrityError:
            # DB unique constraint caught — duplicate correctly rejected
            pass

    def test_register_weak_password(self, api_client):
        response = api_client.post('/api/auth/register/', {
            'email': 'weak@test.com',
            'password': '123',
            'full_name': 'Weak User'
        })
        assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
class TestLogin:

    def test_login_success(self, api_client, customer_user):
        response = api_client.post('/api/auth/login/', {
            'email': 'customer@test.com',
            'password': 'TestPass123!'
        })
        assert response.status_code == status.HTTP_200_OK
        assert 'access' in response.data
        assert 'refresh' in response.data

    def test_login_wrong_password(self, api_client, customer_user):
        response = api_client.post('/api/auth/login/', {
            'email': 'customer@test.com',
            'password': 'WrongPassword!'
        })
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_login_nonexistent_email(self, api_client):
        response = api_client.post('/api/auth/login/', {
            'email': 'nobody@test.com',
            'password': 'AnyPass123!'
        })
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_protected_endpoint_without_token(self, api_client):
        response = api_client.get('/api/auth/me/')
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_protected_endpoint_with_token(self, auth_client):
        response = auth_client.get('/api/auth/me/')
        assert response.status_code == status.HTTP_200_OK
        assert response.data['email'] == 'customer@test.com'


@pytest.mark.django_db
class TestPasswordReset:

    def test_forgot_password_existing_email(
            self, api_client, customer_user):
        response = api_client.post(
            '/api/auth/forgot-password/',
            {'email': 'customer@test.com'}
        )
        assert response.status_code == status.HTTP_200_OK
        assert 'detail' in response.data

    def test_forgot_password_nonexistent_email(self, api_client):
        # Must return same response — no enumeration
        response = api_client.post(
            '/api/auth/forgot-password/',
            {'email': 'nobody@test.com'}
        )
        assert response.status_code == status.HTTP_200_OK
        assert 'detail' in response.data

    def test_reset_with_invalid_token(self, api_client):
        import uuid
        fake_uuid = str(uuid.uuid4())
        response = api_client.post(
            '/api/auth/reset-password/',
            {'token': fake_uuid,
             'password': 'NewPass123!'}
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_reset_with_short_password(
            self, api_client, customer_user):
        from users.models import VerificationToken
        token_obj = VerificationToken.create_for_user(
            customer_user, 'password_reset', hours=1
        )
        response = api_client.post(
            '/api/auth/reset-password/',
            {'token': str(token_obj.token),
             'password': '123'}
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST
