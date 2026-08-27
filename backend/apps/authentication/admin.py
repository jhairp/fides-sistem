from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'capilla_asignada', 'is_staff', 'is_active')
    list_filter = ('is_staff', 'is_superuser', 'is_active', 'capilla_asignada')
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Información Parroquial', {'fields': ('persona', 'capilla_asignada', 'foto_url')}),
    )
