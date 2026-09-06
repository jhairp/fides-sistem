import logging
from django.core.management.base import BaseCommand
from django.contrib.auth.models import Permission, Group
from django.contrib.contenttypes.models import ContentType
from apps.roles.models import RolModel

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Semilla (Seed) para configurar Roles y sus Permisos jerárquicos según las reglas de negocio de FidesSystem'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.WARNING("=== INICIANDO CONFIGURACIÓN DE ROLES Y PERMISOS ==="))

        # Modelos eclesiásticos y operativos principales
        modelos_operativos = [
            'auditoriapartidamodel', 'capillamodel', 'librosacramentalmodel', 
            'notamarginalmodel', 'parroquiamodel', 'partidabasemodel', 
            'partidabautismomodel', 'partidamatrimoniomodel', 'personamodel'
        ]

        # Configuración exacta de la jerarquía
        jerarquia = {
            'SUPERADMIN': {
                'descripcion': 'Control absoluto (Modo Dios).',
                'permisos': 'ALL' # Token especial para dar los 64 permisos
            },
            'ADMINISTRADOR': {
                'descripcion': 'Gestión global de operaciones sin tocar el núcleo del sistema.',
                'permisos': {
                    'modelos': modelos_operativos + ['user'],
                    'acciones': ['add', 'change', 'view'] # SIN delete
                }
            },
            'PARROCO': {
                'descripcion': 'Director de Parroquia y sus centros. Registra personal.',
                'permisos': {
                    'modelos': modelos_operativos + ['user'],
                    'acciones': ['add', 'change', 'view']
                },
                'excepciones': {
                    'parroquiamodel': ['view'] # El Párroco no puede crear parroquias, solo verlas
                }
            },
            'RECTOR': {
                'descripcion': 'Encargado de Capilla/Centro. Registra secretarios.',
                'permisos': {
                    'modelos': modelos_operativos + ['user'],
                    'acciones': ['add', 'change', 'view']
                },
                'excepciones': {
                    'parroquiamodel': ['view']
                }
            },
            'SACERDOTE': {
                'descripcion': 'Celebrante de sacramentos.',
                'permisos': {
                    'modelos': ['partidabasemodel', 'partidabautismomodel', 'partidamatrimoniomodel', 'notamarginalmodel', 'auditoriapartidamodel', 'personamodel'],
                    'acciones': ['add', 'change', 'view']
                }
            },
            'SECRETARIO': {
                'descripcion': 'Digitador de registros eclesiásticos.',
                'permisos': {
                    'modelos': ['partidabasemodel', 'partidabautismomodel', 'partidamatrimoniomodel', 'notamarginalmodel', 'auditoriapartidamodel', 'personamodel'],
                    'acciones': ['add', 'change', 'view']
                }
            },
            'FELIGRES': {
                'descripcion': 'Usuario final (Solo lectura).',
                'permisos': {
                    'modelos': ['partidabasemodel', 'partidabautismomodel', 'partidamatrimoniomodel', 'personamodel', 'capillamodel'],
                    'acciones': ['view']
                }
            }
        }

        # Iterar y crear/sincronizar
        for codigo, config in jerarquia.items():
            # 1. Crear o actualizar el RolModel
            rol, created = RolModel.objects.update_or_create(
                codigo=codigo,
                defaults={
                    'nombre': codigo,
                    'descripcion': config['descripcion']
                }
            )
            
            # 2. Generar la lista de permisos a asignar
            permisos_a_asignar = []
            
            if config['permisos'] == 'ALL':
                permisos_a_asignar = list(Permission.objects.all())
            else:
                modelos = config['permisos']['modelos']
                acciones = config['permisos']['acciones']
                excepciones = config.get('excepciones', {})
                
                for modelo in modelos:
                    # Determinar qué acciones aplican para este modelo (normal vs excepción)
                    acciones_aplicables = excepciones.get(modelo, acciones)
                    
                    for accion in acciones_aplicables:
                        codename = f"{accion}_{modelo}"
                        try:
                            perm = Permission.objects.get(codename=codename)
                            permisos_a_asignar.append(perm)
                        except Permission.DoesNotExist:
                            self.stdout.write(self.style.ERROR(f"Permiso no encontrado: {codename}"))
            
            # 3. Asignar los permisos al RolModel
            rol.permisos.set(permisos_a_asignar)
            
            # 4. Sincronizar obligatoriamente con el Group nativo de Django
            grupo, _ = Group.objects.get_or_create(name=codigo)
            grupo.permissions.set(permisos_a_asignar)

            status = "Creado" if created else "Actualizado"
            self.stdout.write(self.style.SUCCESS(f"[{status}] Rol {codigo} sincronizado con {len(permisos_a_asignar)} permisos."))
            
        self.stdout.write(self.style.WARNING("=== CONFIGURACIÓN DE ROLES COMPLETADA CON ÉXITO ==="))
