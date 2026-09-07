from django.core.management.base import BaseCommand
from django.core.management import call_command
from django.contrib.auth.models import Group
from apps.authentication.models import User
from apps.sacramentos.models import (
    ParroquiaModel,
    CapillaModel,
    PersonaModel
)
from datetime import date

class Command(BaseCommand):
    help = 'Poblar la base de datos con parroquias, capillas y usuarios para cada rol.'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('--- INICIANDO POBLADO DE DATOS ---'))

        # Llamar al comando seed_roles para asegurar que existan los roles y permisos
        self.stdout.write(self.style.WARNING('Llamando a seed_roles...'))
        call_command('seed_roles')

        # 1. Crear Parroquia
        parroquia, _ = ParroquiaModel.objects.get_or_create(
            nombre='PARROQUIA ESPIRITU SANTO',
            defaults={
                'diocesis': 'ARQUIDIOCESIS DE LA PAZ',
                'telefono': '74185852',
                'direccion': 'LA PAZ, BOLIVIA',
                'estado': 'ACTIVA'
            }
        )

        # 2. Crear Capillas
        capillas_data = [
            {
                'nombre': 'SANTISIMA TRINIDAD',
                'telefono': '74856914',
                'ciudad': 'LA PAZ',
                'municipio': 'LA PAZ',
                'direccion': 'AV. NUEVA YORK',
                'capacidad_personas': 200,
                'es_sede_principal': True,
                'estado': 'ACTIVA'
            },
            {
                'nombre': 'CAPILLA DE SANTA MONICA',
                'telefono': '741',
                'ciudad': 'LA PAZ',
                'municipio': 'LA PAZ',
                'direccion': 'LA PAZ, BOLIVIA',
                'capacidad_personas': 200,
                'es_sede_principal': False,
                'estado': 'ACTIVA'
            }
        ]

        capillas_db = {}
        for data in capillas_data:
            capilla, _ = CapillaModel.objects.get_or_create(
                parroquia=parroquia,
                nombre=data['nombre'].upper(),
                defaults=data
            )
            capillas_db[capilla.nombre] = capilla

        capilla_principal = capillas_db['SANTISIMA TRINIDAD']
        capilla_secundaria = capillas_db['CAPILLA DE SANTA MONICA']

        # 3. Crear Usuarios por Rol
        roles_usuarios = [
            ('SUPERADMIN', 'SuperAdmin', 'suad@gmail.com', 'SUPERADMIN', 'SISTEMA', None),
            ('ADMINISTRADOR', 'Administrador', 'admin@gmail.com', 'ADMIN', 'GENERAL', None),
            ('PARROCO', 'Parroco', 'parroco@gmail.com', 'PARROCO', 'TITULAR', capilla_principal),
            ('RECTOR', 'Rector', 'rector@gmail.com', 'RECTOR', 'CAPILLA', capilla_secundaria),
            ('SACERDOTE', 'Sacerdote', 'sacerdote@gmail.com', 'PADRE', 'CELEBRANTE', capilla_principal),
            ('SECRETARIO', 'Secretario', 'secretario@gmail.com', 'SECRETARIO', 'PARROQUIAL', capilla_principal),
            ('FELIGRES', 'Feligres', 'feligres@gmail.com', 'FELIGRES', 'COMUN', capilla_secundaria)
        ]

        for rol_codigo, username, email, nombre, apellido, capilla in roles_usuarios:
            # Crear la persona asociada
            persona, _ = PersonaModel.objects.get_or_create(
                nombres=nombre.upper(),
                apellido_paterno=apellido.upper(),
                defaults={
                    'ci': f'000{username.upper()}',
                    'fecha_nacimiento': date(1980, 1, 1),
                    'sexo': 'M',
                    'estado_civil': 'SOLTERO'
                }
            )

            # Crear el usuario
            user, u_created = User.objects.get_or_create(
                username=username,
                defaults={
                    'email': email,
                    'is_staff': True if rol_codigo in ['SUPERADMIN', 'ADMINISTRADOR'] else False,
                    'is_superuser': True if rol_codigo == 'SUPERADMIN' else False,
                    'persona': persona,
                }
            )

            if u_created:
                user.set_password('12345678')
                user.save()
                self.stdout.write(self.style.SUCCESS(f'Usuario {username} creado con rol {rol_codigo}.'))

            if capilla:
                user.capillas.add(capilla)

            # Asignar grupo
            grupo = Group.objects.get(name=rol_codigo)
            user.groups.add(grupo)

        self.stdout.write(self.style.SUCCESS('--- POBLADO DE DATOS COMPLETADO SATISFACTORIAMENTE ---'))
