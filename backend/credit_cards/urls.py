from django.urls import path
from .views import (
    CreditCardTypeListView, CreditCardApplicationCreateView, CreditCardApplicationListView,
    CreditCardApplicationDetailView, CreditCardListView, CreditCardDetailView,
    CreditCardTransactionListView, CreditCardStatementListView,
    credit_card_payment, block_credit_card, unblock_credit_card,
    set_credit_card_pin, credit_card_rewards,
    AdminCreditCardListView, AdminCreditCardApplicationListView
)

urlpatterns = [
    # Credit Card Types
    path('types/', CreditCardTypeListView.as_view(), name='credit_card_types'),
    
    # Credit Card Applications
    path('applications/', CreditCardApplicationListView.as_view(), name='credit_card_applications'),
    path('applications/create/', CreditCardApplicationCreateView.as_view(), name='create_credit_card_application'),
    path('applications/<uuid:pk>/', CreditCardApplicationDetailView.as_view(), name='credit_card_application_detail'),
    
    # Credit Cards
    path('', CreditCardListView.as_view(), name='credit_cards'),
    path('<uuid:pk>/', CreditCardDetailView.as_view(), name='credit_card_detail'),
    
    # Credit Card Actions
    path('<uuid:card_id>/payment/', credit_card_payment, name='credit_card_payment'),
    path('<uuid:card_id>/block/', block_credit_card, name='block_credit_card'),
    path('<uuid:card_id>/unblock/', unblock_credit_card, name='unblock_credit_card'),
    path('<uuid:card_id>/pin/', set_credit_card_pin, name='set_credit_card_pin'),
    path('<uuid:card_id>/rewards/', credit_card_rewards, name='credit_card_rewards'),
    
    # Transactions
    path('transactions/', CreditCardTransactionListView.as_view(), name='credit_card_transactions'),
    path('<uuid:card_id>/transactions/', CreditCardTransactionListView.as_view(), name='credit_card_transactions_by_card'),
    
    # Statements
    path('statements/', CreditCardStatementListView.as_view(), name='credit_card_statements'),
    path('<uuid:card_id>/statements/', CreditCardStatementListView.as_view(), name='credit_card_statements_by_card'),
    
    # Admin URLs
    path('admin/cards/', AdminCreditCardListView.as_view(), name='admin_credit_cards'),
    path('admin/applications/', AdminCreditCardApplicationListView.as_view(), name='admin_credit_card_applications'),
]