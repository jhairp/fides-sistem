from django.core.management.base import BaseCommand
from django.contrib.auth.models import Group, Permission
from django.contrib.contenttypes.models import ContentType
from apps.authentication.models import User
from apps.sacramentos.models import (
    ParroquiaModel,
    CapillaModel,
    PersonaModel,
    LibroSacramentalModel,
    PartidaBaseModel,
    PartidaBautismoModel,
    PartidaMatrimonioModel,
    NotaMarginalModel
)
from datetime import date


class Command(BaseCommand):
    help = 'Poblar la base de datos con datos reales iniciales, roles, permisos y SuperAdmin para FidesSystem.'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('--- INICIANDO POBLADO DE DATOS (SEED DATA V2) ---'))

        # 1. Crear Parroquia Principal (SANTÍSIMA TRINIDAD)
        parroquia, created = ParroquiaModel.objects.get_or_create(
            nombre='PARROQUIA SANTÍSIMA TRINIDAD',
            defaults={
                'diocesis': 'ARQUIDIÓCESIS DE LA PAZ',
                'telefono': '74185852',
                'direccion': 'GV25+HJ5, LA PAZ, BOLIVIA',
                'estado': 'ACTIVA'
            }
        )
        if created:
            self.stdout.write(self.style.SUCCESS(f'Parroquia creada: {parroquia.nombre}'))

        # 2. Crear las 5 Capillas reales con capacidad 200 y en MAYÚSCULAS
        capillas_data = [
            {
                'nombre': 'SANTÍSIMA TRINIDAD',
                'telefono': '74185852',
                'ciudad': 'LA PAZ',
                'municipio': 'LA PAZ',
                'direccion': 'GV25+HJ5, LA PAZ, BOLIVIA',
                'coordenadas_gps': '-16.4986163,-68.1408758',
                'capacidad_personas': 200,
                'es_sede_principal': True,
                'estado': 'ACTIVA'
            },
            {
                'nombre': 'SANTUARIO JESÚS DEL GRAN PODER',
                'telefono': '72062964',
                'ciudad': 'LA PAZ',
                'municipio': 'MURILLO',
                'direccion': 'GALLARDO, VICENTE OCHOA, ELOY SALMON',
                'coordenadas_gps': '-16.4997032,-68.14259419999999',
                'capacidad_personas': 200,
                'es_sede_principal': False,
                'estado': 'ACTIVA'
            },
            {
                'nombre': 'SANTA RITA',
                'telefono': '67107486',
                'ciudad': 'LA PAZ',
                'municipio': 'MURILLO',
                'direccion': 'AV. EDUARDO AVAROA, LA PAZ, BOLIVIA',
                'coordenadas_gps': '-16.4998146,-68.1501187',
                'capacidad_personas': 200,
                'es_sede_principal': False,
                'estado': 'ACTIVA'
            },
            {
                'nombre': 'SEÑOR DE EXALTACIÓN',
                'telefono': '74856914',
                'ciudad': 'LA PAZ',
                'municipio': 'LA PAZ',
                'direccion': 'AV. NUEVA YORK',
                'coordenadas_gps': '-16.4961481,-68.1454899',
                'capacidad_personas': 200,
                'es_sede_principal': False,
                'estado': 'ACTIVA'
            },
            {
                'nombre': 'CAPILLA DE SANTA MÓNICA',
                'telefono': '741',
                'ciudad': 'LA PAZ',
                'municipio': 'LA PAZ',
                'direccion': 'FRVX+62Q, LA PAZ, BOLIVIA',
                'coordenadas_gps': '-16.5069112,-68.1524014',
                'capacidad_personas': 200,
                'es_sede_principal': False,
                'estado': 'ACTIVA'
            }
        ]

        capillas_db = {}
        for data in capillas_data:
            capilla, c_created = CapillaModel.objects.get_or_create(
                parroquia=parroquia,
                nombre=data['nombre'].upper(),
                defaults={
                    'telefono': data['telefono'],
                    'ciudad': data['ciudad'].upper(),
                    'municipio': data['municipio'].upper(),
                    'direccion': data['direccion'].upper(),
                    'coordenadas_gps': data['coordenadas_gps'],
                    'capacidad_personas': data['capacidad_personas'],
                    'es_sede_principal': data['es_sede_principal'],
                    'estado': data['estado'].upper()
                }
            )
            capillas_db[capilla.nombre] = capilla
            if c_created:
                self.stdout.write(self.style.SUCCESS(f'Capilla creada: {capilla.nombre}'))

        capilla_principal = capillas_db['SANTÍSIMA TRINIDAD']

        # 3. Crear los 7 Roles / Grupos de Permisos
        roles_definicion = [
            'SUPERADMIN',
            'ADMINISTRADOR',
            'PARROCO',
            'RECTOR',
            'SACERDOTE',
            'SECRETARIO',
            'FELIGRES'
        ]

        todos_los_permisos = Permission.objects.all()
        permisos_sacramentos = Permission.objects.filter(content_type__app_label='sacramentos')
        permisos_lectura = Permission.objects.filter(codename__startswith='view_')

        grupos_db = {}
        for r_name in roles_definicion:
            grupo, g_created = Group.objects.get_or_create(name=r_name.upper())
            grupos_db[r_name.upper()] = grupo

            # Asignación estratégica de permisos por Rol
            if r_name == 'SUPERADMIN':
                grupo.permissions.set(todos_los_permisos)
            elif r_name in ['ADMINISTRADOR', 'PARROCO', 'RECTOR']:
                grupo.permissions.set(permisos_sacramentos)
            elif r_name == 'SECRETARIO':
                permisos_secretaria = permisos_sacramentos.exclude(codename__startswith='delete_')
                grupo.permissions.set(permisos_secretaria)
            elif r_name == 'SACERDOTE':
                permisos_sacerdote = permisos_sacramentos.filter(codename__in=['view_partidabasemodel', 'view_partidabautismomodel', 'view_partidamatrimoniomodel', 'view_personamodel'])
                grupo.permissions.set(permisos_sacerdote)
            elif r_name == 'FELIGRES':
                grupo.permissions.set(permisos_lectura.filter(content_type__app_label='sacramentos'))

            if g_created:
                self.stdout.write(self.style.SUCCESS(f'Grupo y Permisos creados: {grupo.name}'))

        # 4. Crear Persona para el SuperAdmin
        super_persona, _ = PersonaModel.objects.get_or_create(
            nombres='SUPERADMIN',
            apellido_paterno='SISTEMA',
            apellido_materno='PARROQUIAL',
            defaults={
                'ci': '1111111 LP',
                'fecha_nacimiento': date(1990, 1, 1),
                'lugar_nacimiento': 'LA PAZ',
                'sexo': 'M',
                'estado_civil': 'SOLTERO'
            }
        )

        # 5. Crear el Usuario SuperAdmin solicitado (SuperAdmin / suad@gmail.com / 12345678)
        super_admin_user, u_created = User.objects.get_or_create(
            username='SuperAdmin',
            defaults={
                'email': 'suad@gmail.com',
                'first_name': 'SUPERADMINISTRADOR',
                'last_name': 'GENERAL',
                'is_staff': True,
                'is_superuser': True,
                'persona': super_persona,
                'capilla_asignada': capilla_principal
            }
        )
        if u_created:
            super_admin_user.set_password('12345678')
            super_admin_user.save()
            super_admin_user.groups.add(grupos_db['SUPERADMIN'])
            self.stdout.write(self.style.SUCCESS('Usuario SuperAdmin creado (User: SuperAdmin | Pass: 12345678 | Email: suad@gmail.com).'))

        # 6. Crear Personas de Prueba adicionales en MAYÚSCULAS
        sacerdote, _ = PersonaModel.objects.get_or_create(
            nombres='PADRE ALBERTO',
            apellido_paterno='QUISPE',
            apellido_materno='FLORES',
            defaults={
                'ci': '4589123 LP',
                'fecha_nacimiento': date(1975, 5, 15),
                'lugar_nacimiento': 'LA PAZ',
                'sexo': 'M',
                'estado_civil': 'CONSAGRADO'
            }
        )

        bautizado, _ = PersonaModel.objects.get_or_create(
            nombres='JUAN CARLOS',
            apellido_paterno='MAMANI',
            apellido_materno='PEREZ',
            defaults={
                'ci': '9876543 LP',
                'fecha_nacimiento': date(2015, 3, 20),
                'lugar_nacimiento': 'LA PAZ',
                'sexo': 'M',
                'estado_civil': 'SOLTERO'
            }
        )

        padre, _ = PersonaModel.objects.get_or_create(
            nombres='ROBERTO',
            apellido_paterno='MAMANI',
            apellido_materno='CHAVEZ',
            defaults={
                'ci': '3456789 LP',
                'fecha_nacimiento': date(1985, 8, 10),
                'lugar_nacimiento': 'LA PAZ',
                'sexo': 'M',
                'estado_civil': 'CASADO'
            }
        )

        madre, _ = PersonaModel.objects.get_or_create(
            nombres='MARIA ELENA',
            apellido_paterno='PEREZ',
            apellido_materno='RODRIGUEZ',
            defaults={
                'ci': '2345678 LP',
                'fecha_nacimiento': date(1988, 11, 25),
                'lugar_nacimiento': 'LA PAZ',
                'sexo': 'F',
                'estado_civil': 'CASADO'
            }
        )

        # 7. Crear Libros Sacramentales de Prueba
        libro_bautismo, _ = LibroSacramentalModel.objects.get_or_create(
            capilla=capilla_principal,
            tipo_sacramento='BAUTISMO',
            numero_libro=1,
            defaults={
                'fecha_apertura': date(2020, 1, 1),
                'estado': 'ABIERTO'
            }
        )

        # 8. Crear Partida de Bautismo de Ejemplo
        partida_base, p_created = PartidaBaseModel.objects.get_or_create(
            libro=libro_bautismo,
            numero_folio=1,
            numero_partida=1,
            defaults={
                'fecha_sacramento': date(2021, 6, 12),
                'sacerdote_celebrante': sacerdote,
                'observaciones': 'PARTIDA INICIAL DE PRUEBA CREADA POR SEED DATA V2',
                'registrado_por': super_admin_user
            }
        )

        if p_created:
            PartidaBautismoModel.objects.create(
                partida=partida_base,
                bautizado=bautizado,
                padre=padre,
                madre=madre,
                hijo_legitimo=True
            )
            self.stdout.write(self.style.SUCCESS('Partida de Bautismo N° 1 creada con éxito.'))

        self.stdout.write(self.style.SUCCESS('--- POBLADO DE DATOS COMPLETADO SATISFACTORIAMENTE ---'))
