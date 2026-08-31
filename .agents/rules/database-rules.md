---
name: Reglas de Base de Datos y Modelado ORM
description: Estándares estrictos para el diseño de modelos en Django (Nomenclaturas de tablas, UUIDs, Auditoría e Integridad Referencial).
trigger: always_on
---

# Reglas de Base de Datos y Modelado (FidesSystem)

Al crear o modificar modelos de base de datos (`models.py`) en Django, debes seguir estrictamente estos 4 pilares para garantizar la integridad, seguridad y escalabilidad de los datos:

## 1. Convenciones de Nomenclatura (`db_table`)
- **Modelos:** El nombre de la clase en Python siempre debe terminar con el sufijo `Model` (ej. `CapillaModel`, `PartidaBautismoModel`), a excepción del modelo extendido `User`.
- **Tablas de BD:** Está **PROHIBIDO** dejar que Django nombre las tablas por defecto. Siempre debes usar la clase `Meta` y definir el campo `db_table`.
- **Formato:** Los nombres en `db_table` deben ser en **español, minúsculas, plural y en snake_case**.
  ```python
  class PartidaBautismoModel(models.Model):
      # ...
      class Meta:
          db_table = 'partidas_bautismo'
  ```

## 2. Claves Primarias Seguras (UUIDs)
- **Regla:** Está prohibido usar IDs numéricos auto-incrementables (`AutoField`) para modelos de negocio.
- Todos los nuevos modelos deben utilizar un `UUIDField` como clave primaria para evitar la enumeración de registros y prepararse para escalabilidad.
  ```python
  import uuid
  from django.db import models
  
  id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
  ```

## 3. Integridad Referencial (Cero Borrado en Cascada)
- **Regla:** Está **PROHIBIDO** el uso de `on_delete=models.CASCADE` en los modelos de negocio de `sacramentos`. El borrado en cascada genera un alto riesgo de pérdida de datos masiva accidental.
- **Alternativas Obligatorias:**
  - Usar `models.PROTECT` o `models.RESTRICT`: Para evitar que se borre un Padre (ej. Libro) si tiene Hijos (ej. Actas).
  - Usar `models.SET_NULL`: (con `null=True, blank=True`) Si es aceptable que el Hijo se quede huérfano al borrar el Padre (ej. Usuario vinculado a una Capilla eliminada).

## 4. Auditoría Automática (Clase Base)
- Para evitar repetir código, los modelos deben heredar de una clase base abstracta (ej. `TimeStampedModel` o `AuditoriaBaseModel`) que inyecte automáticamente:
  - El campo `id` (UUID).
  - `created_at` (DateTimeField auto_now_add).
  - `updated_at` (DateTimeField auto_now).
  - `estado` o `is_active` (si aplica para bajas lógicas).
