---
name: crear-modulo-backend
description: Scaffolding completo para crear un nuevo módulo de backend en Django usando Arquitectura Hexagonal y los estándares de base de datos de FidesSystem.
---

# Procedimiento: Crear Nuevo Módulo Backend (FidesSystem)

Cuando el usuario solicite crear un nuevo módulo en el backend (ej. "Crea el backend para Libros Sacramentales"), sigue estrictamente estos pasos:

## Paso 1: Adaptadores Secundarios (Base de Datos)
1. Modifica o crea el archivo `models.py` correspondiente.
2. Sigue las reglas de `database-rules.md`:
   - El modelo debe terminar en `Model`.
   - Define `db_table` en minúsculas y snake_case.
   - Usa `UUIDField` como clave primaria.
   - Si tiene ForeignKeys, usa `models.PROTECT` o `models.SET_NULL` (NUNCA CASCADE).
   - Hereda de la clase base de auditoría si existe, o añade `created_at` y `updated_at`.

## Paso 2: Dominio (Domain)
1. Crea/edita el archivo `domain/entities.py`.
2. Escribe una `@dataclass` pura de Python que represente la entidad.
3. ¡Cero dependencias de Django aquí!

## Paso 3: Puertos (Ports)
1. Crea/edita el archivo `ports/repositories.py`.
2. Define una clase abstracta (`abc.ABC`) con los métodos requeridos (ej. `guardar`, `obtener_por_id`).

## Paso 4: Casos de Uso (Application)
1. Crea/edita el archivo `application/use_cases.py`.
2. Crea la clase del caso de uso.
3. Inyecta el puerto del repositorio en el `__init__`.
4. La función principal debe recibir y devolver DTOs/Dataclasses, no modelos de Django.

## Paso 5: Adaptadores Primarios (Controladores API)
1. Crea el Serializador (`adapters/primary/serializers.py`).
2. Crea la Vista/ViewSet (`adapters/primary/views.py`).
3. En la vista, atrapa las excepciones de dominio y devuélvelas como HTTP 400.
4. Conecta la vista en `urls.py`.

## Paso 6: Verificación y Migraciones (CRÍTICO)
1. **Registrar App:** Si creaste una nueva App de Django, asegúrate de registrarla en `INSTALLED_APPS` en `config/settings.py` y de conectar sus URLs en `config/urls.py`.
2. **Ejecutar Migraciones:** SIEMPRE que crees un modelo que mapee a una tabla nueva, DEBES ejecutar obligatoriamente `python manage.py makemigrations [app]` y `python manage.py migrate [app]` usando el entorno virtual (`venv/Scripts/python.exe` o `venv/bin/python`). Nunca asumas que las tablas ya existen aunque estén en el esquema SQL, ya que el esquema V2 puede no haberse aplicado por completo.
3. Verifica que el código cumpla con la regla de Cero Bajas Físicas (Soft Delete). Si todo está bien, notifica al usuario que el módulo backend está listo.
