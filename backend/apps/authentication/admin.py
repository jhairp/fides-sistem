from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('username', 'email', 'get_full_name', 'get_capillas', 'is_staff', 'is_active')
    list_filter = ('is_staff', 'is_superuser', 'is_active')
    
    # Custom fieldsets to remove first_name and last_name from the admin forms
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Personal info', {'fields': ('email', 'persona', 'capillas', 'foto_url')}),
        ('Permissions', {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions'),
        }),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )

    def get_full_name(self, obj):
        if obj.persona:
            return f"{obj.persona.nombres} {obj.persona.apellido_paterno}"
        return ""
    get_full_name.short_description = 'Nombre Completo'

    def get_capillas(self, obj):
        return ", ".join([c.nombre for c in obj.capillas.all()])
    get_capillas.short_description = 'Capillas Asignadas'
