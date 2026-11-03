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
                'nombre': 'SANTUARIO JESUS DEL GRAN PODER',
                'telefono': '74851234',
                'ciudad': 'LA PAZ',
                'municipio': 'LA PAZ',
                'direccion': 'CALLE ANTONIO GALLARDO',
                'capacidad_personas': 500,
                'es_sede_principal': False,
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
        capilla_gran_poder = capillas_db['SANTUARIO JESUS DEL GRAN PODER']
        capilla_secundaria = capillas_db['CAPILLA DE SANTA MONICA']

        # 3. Crear Usuarios por Rol
        roles_usuarios = [
            {
                'rol': 'SUPERADMIN',
                'username': 'SuperAdmin',
                'email': 'suad@gmail.com',
                'password': '12345678',
                'nombres': 'SUPERADMIN',
                'apellido_paterno': 'SISTEMA',
                'apellido_materno': '',
                'sexo': 'M',
                'fecha_nacimiento': date(1980, 1, 1),
                'capilla': None,
            },
            {
                'rol': 'ADMINISTRADOR',
                'username': 'Administrador',
                'email': 'admin@gmail.com',
                'password': '12345678',
                'nombres': 'ADMIN',
                'apellido_paterno': 'GENERAL',
                'apellido_materno': '',
                'sexo': 'M',
                'fecha_nacimiento': date(1982, 3, 10),
                'capilla': None,
            },
            {
                'rol': 'PARROCO',
                'username': 'Parroco',
                'email': 'parroco@gmail.com',
                'password': '12345678',
                'nombres': 'PARROCO',
                'apellido_paterno': 'TITULAR',
                'apellido_materno': '',
                'sexo': 'M',
                'fecha_nacimiento': date(1975, 5, 20),
                'capilla': capilla_principal,
            },
            {
                'rol': 'RECTOR',
                'username': 'Rector',
                'email': 'rector@gmail.com',
                'password': '12345678',
                'nombres': 'RECTOR',
                'apellido_paterno': 'CAPILLA',
                'apellido_materno': '',
                'sexo': 'M',
                'fecha_nacimiento': date(1978, 8, 12),
                'capilla': capilla_secundaria,
            },
            {
                'rol': 'SACERDOTE',
                'username': 'Sacerdote',
                'email': 'sacerdote@gmail.com',
                'password': '12345678',
                'nombres': 'PADRE',
                'apellido_paterno': 'CELEBRANTE',
                'apellido_materno': '',
                'sexo': 'M',
                'fecha_nacimiento': date(1983, 11, 4),
                'capilla': capilla_principal,
            },
            {
                'rol': 'SECRETARIO',
                'username': 'Secretario',
                'email': 'secretario@gmail.com',
                'password': '12345678',
                'nombres': 'SECRETARIO',
                'apellido_paterno': 'PARROQUIAL',
                'apellido_materno': '',
                'sexo': 'M',
                'fecha_nacimiento': date(1985, 2, 18),
                'capilla': capilla_principal,
            },
            {
                'rol': 'SECRETARIO',
                'username': 'monicabuscador',
                'email': 'monicabuscador@gmail.com',
                'password': 'moni12SJ',
                'nombres': 'MONICA',
                'apellido_paterno': 'ARCE',
                'apellido_materno': 'ROJAS',
                'sexo': 'F',
                'fecha_nacimiento': date(1992, 6, 25),
                'capilla': capilla_gran_poder,
            },
            {
                'rol': 'FELIGRES',
                'username': 'Feligres',
                'email': 'feligres@gmail.com',
                'password': '12345678',
                'nombres': 'FELIGRES',
                'apellido_paterno': 'COMUN',
                'apellido_materno': '',
                'sexo': 'M',
                'fecha_nacimiento': date(1995, 9, 30),
                'capilla': capilla_secundaria,
            },
        ]

        for udata in roles_usuarios:
            rol_codigo = udata['rol']
            username = udata['username']
            email = udata['email']
            password = udata['password']
            nombre = udata['nombres']
            apellido_paterno = udata['apellido_paterno']
            apellido_materno = udata.get('apellido_materno', '')
            sexo = udata.get('sexo', 'M')
            fecha_nac = udata.get('fecha_nacimiento', date(1980, 1, 1))
            capilla = udata['capilla']

            # Crear o buscar la persona asociada
            persona, _ = PersonaModel.objects.get_or_create(
                nombres=nombre.upper(),
                apellido_paterno=apellido_paterno.upper(),
                defaults={
                    'apellido_materno': apellido_materno.upper() if apellido_materno else None,
                    'ci': f'000{username.upper()}',
                    'fecha_nacimiento': fecha_nac,
                    'sexo': sexo,
                    'estado_civil': 'SOLTERO'
                }
            )

            # Crear o actualizar el usuario
            user, u_created = User.objects.get_or_create(
                username=username,
                defaults={
                    'email': email,
                    'is_staff': True if rol_codigo in ['SUPERADMIN', 'ADMINISTRADOR'] else False,
                    'is_superuser': True if rol_codigo == 'SUPERADMIN' else False,
                    'persona': persona,
                }
            )

            user.set_password(password)
            user.email = email
            user.persona = persona
            user.is_active = True
            user.save()

            if u_created:
                self.stdout.write(self.style.SUCCESS(f'Usuario {username} creado con rol {rol_codigo}.'))
            else:
                self.stdout.write(self.style.NOTICE(f'Usuario {username} actualizado con rol {rol_codigo}.'))

            if capilla:
                user.capillas.add(capilla)

            # Asignar grupo
            grupo = Group.objects.get(name=rol_codigo)
            user.groups.add(grupo)

        self.stdout.write(self.style.SUCCESS('--- POBLADO DE DATOS COMPLETADO SATISFACTORIAMENTE ---'))
