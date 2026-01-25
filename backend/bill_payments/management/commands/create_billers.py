"""
Management command to create default biller categories and billers
"""
from django.core.management.base import BaseCommand
from bill_payments.models import BillerCategory, Biller


class Command(BaseCommand):
    help = 'Create default biller categories and billers for the banking platform'

    def handle(self, *args, **options):
        # Create Categories
        categories_data = [
            {'name': 'Electricity', 'description': 'Electricity bill providers', 'icon': 'zap', 'sort_order': 1},
            {'name': 'Gas', 'description': 'Gas bill providers', 'icon': 'flame', 'sort_order': 2},
            {'name': 'Water', 'description': 'Water bill providers', 'icon': 'droplet', 'sort_order': 3},
            {'name': 'Mobile & DTH', 'description': 'Mobile and DTH recharge', 'icon': 'smartphone', 'sort_order': 4},
            {'name': 'Internet & Cable', 'description': 'Internet and cable TV providers', 'icon': 'wifi', 'sort_order': 5},
            {'name': 'Insurance', 'description': 'Insurance premium payments', 'icon': 'shield', 'sort_order': 6},
            {'name': 'Education', 'description': 'School and college fees', 'icon': 'book', 'sort_order': 7},
            {'name': 'Municipal', 'description': 'Municipal taxes and services', 'icon': 'building', 'sort_order': 8}
        ]

        created_categories = {}
        for cat_data in categories_data:
            category, created = BillerCategory.objects.get_or_create(
                name=cat_data['name'],
                defaults=cat_data
            )
            created_categories[cat_data['name']] = category
            if created:
                self.stdout.write(
                    self.style.SUCCESS(f'Created category: {category.name}')
                )

        # Create Billers
        billers_data = [
            # Electricity
            {
                'name': 'BESCOM (Bangalore Electricity Supply Company)',
                'category': 'Electricity',
                'biller_code': 'BESCOM',
                'description': 'Electricity bills for Bangalore',
                'min_amount': 100,
                'max_amount': 50000,
                'convenience_fee_percentage': 0.5,
                'customer_id_label': 'Consumer Number'
            },
            {
                'name': 'MSEB (Maharashtra State Electricity Board)',
                'category': 'Electricity',
                'biller_code': 'MSEB',
                'description': 'Electricity bills for Maharashtra',
                'min_amount': 100,
                'max_amount': 50000,
                'convenience_fee_percentage': 0.5,
                'customer_id_label': 'Consumer Number'
            },
            {
                'name': 'Adani Electricity Mumbai',
                'category': 'Electricity',
                'biller_code': 'ADANI_MUM',
                'description': 'Electricity bills for Mumbai',
                'min_amount': 100,
                'max_amount': 50000,
                'convenience_fee_percentage': 0.75,
                'customer_id_label': 'Consumer ID'
            },

            # Gas
            {
                'name': 'Indraprastha Gas Limited (IGL)',
                'category': 'Gas',
                'biller_code': 'IGL',
                'description': 'Gas bills for Delhi NCR',
                'min_amount': 100,
                'max_amount': 25000,
                'convenience_fee_percentage': 1.0,
                'customer_id_label': 'Consumer Number'
            },
            {
                'name': 'Mahanagar Gas Limited (MGL)',
                'category': 'Gas',
                'biller_code': 'MGL',
                'description': 'Gas bills for Mumbai',
                'min_amount': 100,
                'max_amount': 25000,
                'convenience_fee_percentage': 1.0,
                'customer_id_label': 'Consumer ID'
            },

            # Water
            {
                'name': 'Bangalore Water Supply (BWSSB)',
                'category': 'Water',
                'biller_code': 'BWSSB',
                'description': 'Water bills for Bangalore',
                'min_amount': 50,
                'max_amount': 15000,
                'convenience_fee_percentage': 0.5,
                'customer_id_label': 'Connection ID'
            },
            {
                'name': 'Delhi Jal Board (DJB)',
                'category': 'Water',
                'biller_code': 'DJB',
                'description': 'Water bills for Delhi',
                'min_amount': 50,
                'max_amount': 15000,
                'convenience_fee_percentage': 0.5,
                'customer_id_label': 'K Number'
            },

            # Mobile & DTH
            {
                'name': 'Airtel',
                'category': 'Mobile & DTH',
                'biller_code': 'AIRTEL',
                'description': 'Airtel mobile and DTH recharge',
                'min_amount': 10,
                'max_amount': 5000,
                'convenience_fee_percentage': 0,
                'customer_id_label': 'Mobile Number'
            },
            {
                'name': 'Vodafone Idea (Vi)',
                'category': 'Mobile & DTH',
                'biller_code': 'VI',
                'description': 'Vi mobile recharge',
                'min_amount': 10,
                'max_amount': 5000,
                'convenience_fee_percentage': 0,
                'customer_id_label': 'Mobile Number'
            },
            {
                'name': 'Jio',
                'category': 'Mobile & DTH',
                'biller_code': 'JIO',
                'description': 'Jio mobile and fiber recharge',
                'min_amount': 10,
                'max_amount': 5000,
                'convenience_fee_percentage': 0,
                'customer_id_label': 'Mobile Number'
            },
            {
                'name': 'Tata Sky',
                'category': 'Mobile & DTH',
                'biller_code': 'TATASKY',
                'description': 'Tata Sky DTH recharge',
                'min_amount': 100,
                'max_amount': 5000,
                'convenience_fee_percentage': 0,
                'customer_id_label': 'Subscriber ID'
            },

            # Internet & Cable
            {
                'name': 'ACT Fibernet',
                'category': 'Internet & Cable',
                'biller_code': 'ACT',
                'description': 'ACT broadband bills',
                'min_amount': 200,
                'max_amount': 10000,
                'convenience_fee_percentage': 1.0,
                'customer_id_label': 'Customer ID'
            },
            {
                'name': 'Hathway Broadband',
                'category': 'Internet & Cable',
                'biller_code': 'HATHWAY',
                'description': 'Hathway cable and broadband',
                'min_amount': 200,
                'max_amount': 10000,
                'convenience_fee_percentage': 1.0,
                'customer_id_label': 'Customer Code'
            },

            # Insurance
            {
                'name': 'LIC of India',
                'category': 'Insurance',
                'biller_code': 'LIC',
                'description': 'Life Insurance Corporation premium',
                'min_amount': 500,
                'max_amount': 200000,
                'convenience_fee_percentage': 0,
                'customer_id_label': 'Policy Number'
            },
            {
                'name': 'HDFC Life Insurance',
                'category': 'Insurance',
                'biller_code': 'HDFC_LIFE',
                'description': 'HDFC Life insurance premium',
                'min_amount': 500,
                'max_amount': 200000,
                'convenience_fee_percentage': 0,
                'customer_id_label': 'Policy Number'
            },

            # Municipal
            {
                'name': 'BBMP Property Tax',
                'category': 'Municipal',
                'biller_code': 'BBMP',
                'description': 'Bangalore property tax',
                'min_amount': 100,
                'max_amount': 100000,
                'convenience_fee_percentage': 1.0,
                'customer_id_label': 'Property ID'
            },
            {
                'name': 'MCD Property Tax',
                'category': 'Municipal',
                'biller_code': 'MCD',
                'description': 'Delhi Municipal Corporation tax',
                'min_amount': 100,
                'max_amount': 100000,
                'convenience_fee_percentage': 1.0,
                'customer_id_label': 'Property ID'
            }
        ]

        created_count = 0
        for biller_data in billers_data:
            category_name = biller_data.pop('category')
            category = created_categories[category_name]
            biller_data['category'] = category
            
            biller, created = Biller.objects.get_or_create(
                biller_code=biller_data['biller_code'],
                defaults=biller_data
            )
            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'Created biller: {biller.name}')
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f'Biller already exists: {biller.name}')
                )

        self.stdout.write(
            self.style.SUCCESS(f'Successfully created {len(created_categories)} categories and {created_count} billers')
        )