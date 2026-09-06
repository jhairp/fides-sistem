from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    Modelo de usuario personalizado para FidesSystem heredando de AbstractUser de Django.
    Permite integración nativa con django.contrib.auth, Groups y Permissions.
    """
    first_name = None
    last_name = None

    persona = models.ForeignKey(
        'sacramentos.PersonaModel',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='usuario_cuenta',
        help_text='Persona asociada a esta cuenta de usuario'
    )
    capilla_asignada = models.ForeignKey(
        'sacramentos.CapillaModel',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='usuarios_asignados',
        help_text='Capilla eclesiástica asignada para este usuario'
    )
    foto_url = models.URLField(max_length=500, blank=True, null=True)

    class Meta:
        db_table = 'usuarios'
        verbose_name = 'Usuario'
        verbose_name_plural = 'Usuarios'

    def __str__(self):
        return f"{self.username} ({self.email})"
