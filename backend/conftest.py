import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def customer_user(db):
    return User.objects.create_user(
        email='customer@test.com',
        password='TestPass123!',
        full_name='Test Customer',
        role='CUSTOMER',
        is_verified=True
    )


@pytest.fixture
def admin_user(db):
    return User.objects.create_user(
        email='admin@test.com',
        password='AdminPass123!',
        full_name='Test Admin',
        role='ADMIN',
        is_verified=True,
        is_staff=True
    )


@pytest.fixture
def support_user(db):
    return User.objects.create_user(
        email='support@test.com',
        password='SupportPass123!',
        full_name='Test Support',
        role='SUPPORT',
        is_verified=True
    )


@pytest.fixture
def auth_client(api_client, customer_user):
    refresh = RefreshToken.for_user(customer_user)
    api_client.credentials(
        HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}'
    )
    return api_client


@pytest.fixture
def admin_client(api_client, admin_user):
    refresh = RefreshToken.for_user(admin_user)
    api_client.credentials(
        HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}'
    )
    return api_client


@pytest.fixture
def support_client(api_client, support_user):
    refresh = RefreshToken.for_user(support_user)
    api_client.credentials(
        HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}'
    )
    return api_client
