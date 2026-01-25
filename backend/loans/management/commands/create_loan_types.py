from django.core.management.base import BaseCommand
from loans.models import LoanType


class Command(BaseCommand):
    help = 'Create initial loan types'

    def handle(self, *args, **options):
        loan_types = [
            {
                'name': 'Personal Loan',
                'description': 'Unsecured personal loan for various purposes',
                'interest_rate': 12.50,
                'min_amount': 10000,
                'max_amount': 500000,
                'min_tenure_months': 6,
                'max_tenure_months': 60,
                'processing_fee': 2500,
            },
            {
                'name': 'Home Loan',
                'description': 'Secured loan for purchasing or constructing residential property',
                'interest_rate': 8.75,
                'min_amount': 100000,
                'max_amount': 5000000,
                'min_tenure_months': 60,
                'max_tenure_months': 360,
                'processing_fee': 5000,
            },
            {
                'name': 'Car Loan',
                'description': 'Secured loan for purchasing new or used vehicles',
                'interest_rate': 9.50,
                'min_amount': 50000,
                'max_amount': 2000000,
                'min_tenure_months': 12,
                'max_tenure_months': 84,
                'processing_fee': 3000,
            },
            {
                'name': 'Education Loan',
                'description': 'Loan for higher education and skill development',
                'interest_rate': 10.25,
                'min_amount': 25000,
                'max_amount': 1000000,
                'min_tenure_months': 12,
                'max_tenure_months': 180,
                'processing_fee': 1000,
            },
        ]

        for loan_data in loan_types:
            loan_type, created = LoanType.objects.get_or_create(
                name=loan_data['name'],
                defaults=loan_data
            )
            if created:
                self.stdout.write(f'Created loan type: {loan_type.name}')
            else:
                self.stdout.write(f'Loan type already exists: {loan_type.name}')

        self.stdout.write(self.style.SUCCESS('Successfully created initial loan types'))