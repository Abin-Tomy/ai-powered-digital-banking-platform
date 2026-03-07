import pytest
from rest_framework import status


@pytest.mark.django_db
class TestEMICalculator:

    def test_emi_calculation_correct(self, api_client):
        response = api_client.post(
            '/api/loans/calculate-emi/', {
                'principal': 100000,
                'annual_interest_rate': 10.5,
                'tenure_months': 24
            }
        )
        assert response.status_code == status.HTTP_200_OK
        emi = float(response.data['emi'])
        assert 4610 < emi < 4650, \
            f"EMI {emi} outside expected range"

    def test_emi_amortization_schedule_length(
            self, api_client):
        response = api_client.post(
            '/api/loans/calculate-emi/', {
                'principal': 50000,
                'annual_interest_rate': 12,
                'tenure_months': 12
            }
        )
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['amortization_schedule']) == 12

    def test_emi_invalid_principal(self, api_client):
        response = api_client.post(
            '/api/loans/calculate-emi/', {
                'principal': -1000,
                'annual_interest_rate': 10,
                'tenure_months': 12
            }
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_emi_total_payment_equals_emi_times_months(
            self, api_client):
        response = api_client.post(
            '/api/loans/calculate-emi/', {
                'principal': 100000,
                'annual_interest_rate': 10,
                'tenure_months': 12
            }
        )
        data = response.data
        emi = float(data['emi'])
        total = float(data['total_payment'])
        assert abs(total - (emi * 12)) < 1.0
