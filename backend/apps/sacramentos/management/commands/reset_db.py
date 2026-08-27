from django.core.management.base import BaseCommand
from django.core.management import call_command
from django.db import connection


class Command(BaseCommand):
    help = 'Reinicia por completo la base de datos, vuelve a aplicar las migraciones y ejecuta seed_data.'

    def handle(self, *args, **options):
        self.stdout.write(self.style.WARNING('=== INICIANDO REINICIO COMPLETO DE BASE DE DATOS (RESET DB) ==='))

        # 1. Vaciar datos de las tablas
        self.stdout.write(self.style.NOTICE('1. Limpiando tablas de la base de datos...'))
        try:
            call_command('flush', interactive=False)
            self.stdout.write(self.style.SUCCESS('Tablas vaciadas correctamente.'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Aviso durante flush: {e}'))

        # 2. Re-aplicar migraciones
        self.stdout.write(self.style.NOTICE('2. Ejecutando migraciones...'))
        call_command('migrate')
        self.stdout.write(self.style.SUCCESS('Migraciones aplicadas con éxito.'))

        # 3. Poblar datos iniciales
        self.stdout.write(self.style.NOTICE('3. Ejecutando comando seed_data...'))
        call_command('seed_data')

        self.stdout.write(self.style.SUCCESS('=== REINICIO Y POBLADO DE BASE DE DATOS COMPLETADO CON ÉXITO ==='))
