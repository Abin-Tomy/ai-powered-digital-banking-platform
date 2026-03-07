"""
Management command to create default credit card types
"""
from django.core.management.base import BaseCommand
from credit_cards.models import CreditCardType


class Command(BaseCommand):
    help = 'Create default credit card types for the banking platform'

    def handle(self, *args, **options):
        credit_card_types_data = [
            {
                'name': 'Silver Card',
                'description': 'Entry level credit card with basic benefits',
                'minimum_credit_limit': 10000,
                'maximum_credit_limit': 200000,
                'annual_fee': 0,
                'interest_rate': 20.0,
                'cash_advance_limit_percentage': 50,
                'minimum_income_requirement': 200000,
                'reward_points_per_100': 1,
                'is_active': True
            },
            {
                'name': 'Gold Card',
                'description': 'Premium credit card with enhanced rewards and benefits',
                'minimum_credit_limit': 50000,
                'maximum_credit_limit': 500000,
                'annual_fee': 2500,
                'interest_rate': 18.0,
                'cash_advance_limit_percentage': 60,
                'minimum_income_requirement': 500000,
                'reward_points_per_100': 2,
                'is_active': True
            },
            {
                'name': 'Platinum Card',
                'description': 'Elite credit card with luxury benefits and high rewards',
                'minimum_credit_limit': 100000,
                'maximum_credit_limit': 1000000,
                'annual_fee': 5000,
                'interest_rate': 16.0,
                'cash_advance_limit_percentage': 70,
                'minimum_income_requirement': 1000000,
                'reward_points_per_100': 3,
                'is_active': True
            },
            {
                'name': 'Titanium Card',
                'description': 'Ultra-premium credit card for high net worth individuals',
                'minimum_credit_limit': 500000,
                'maximum_credit_limit': 5000000,
                'annual_fee': 10000,
                'interest_rate': 14.0,
                'cash_advance_limit_percentage': 80,
                'minimum_income_requirement': 2000000,
                'reward_points_per_100': 5,
                'is_active': True
            },
            {
                'name': 'Student Card',
                'description': 'Special credit card for students with lower requirements',
                'minimum_credit_limit': 5000,
                'maximum_credit_limit': 50000,
                'annual_fee': 0,
                'interest_rate': 22.0,
                'cash_advance_limit_percentage': 30,
                'minimum_income_requirement': 100000,
                'reward_points_per_100': 1,
                'is_active': True
            },
            {
                'name': 'Business Card',
                'description': 'Corporate credit card for business expenses',
                'minimum_credit_limit': 100000,
                'maximum_credit_limit': 2000000,
                'annual_fee': 3000,
                'interest_rate': 17.0,
                'cash_advance_limit_percentage': 60,
                'minimum_income_requirement': 1000000,
                'reward_points_per_100': 2,
                'is_active': True
            }
        ]

        created_count = 0
        for card_data in credit_card_types_data:
            card_type, created = CreditCardType.objects.get_or_create(
                name=card_data['name'],
                defaults=card_data
            )
            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'Created credit card type: {card_type.name}')
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f'Credit card type already exists: {card_type.name}')
                )

        self.stdout.write(
            self.style.SUCCESS(f'Successfully created {created_count} credit card types')
        )