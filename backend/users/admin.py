from django.contrib import admin
from .models import User


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('email', 'full_name', 'role', 'is_active', 'is_locked')
    list_filter = ('role', 'is_active', 'is_locked')
    search_fields = ('email',)
