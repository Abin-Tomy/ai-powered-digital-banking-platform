from django.contrib import admin
from .models import Account


@admin.register(Account)
class AccountAdmin(admin.ModelAdmin):
    list_display = ('account_number', 'owner', 'account_type', 'status', 'created_at')
    list_filter = ('account_type', 'status')
    search_fields = ('account_number',)
