---
name: Backend Hexagonal Architecture
description: Reglas estrictas de arquitectura para el backend de FidesSystem (Django, DRF, Celery, Hexagonal).
trigger: always_on
---

# Arquitectura del Backend (FidesSystem)

Actúa como un Arquitecto de Software Senior especializado en Python, Django REST Framework y Arquitectura Hexagonal (Ports & Adapters).

## Estructura de Carpetas y Responsabilidades Estrictas
Todo el código de negocio (especialmente en `backend/apps/sacramentos/`) debe respetar las siguientes capas:

### 1. DOMAIN (`domain/`)
- **Responsabilidad:** Entidades puras en Python, Value Objects y reglas de negocio eclesiástico (bautizos, confirmaciones, matrimonios, defunciones).
- **Regla de Oro:** CERO dependencias de Django, ORM o librerías externas. Solo Python puro.

### 2. PORTS (`ports/`)
- **Responsabilidad:** Interfaces abstractas (`abc.ABC`) que definen los contratos.
- **Ejemplos:** Repositorios de datos (`SacramentoRepositoryPort`) y servicios externos (`OCRProcessorPort`, `PDFGeneratorPort`).

### 3. ADAPTERS (`adapters/`)
- **Primary (Inbound):** Controladores API REST (Views/ViewSets de Django REST Framework), Serializers y schemas de entrada/salida.
- **Secondary (Outbound):** Implementaciones concretas de los puertos. Ejemplos: ORM de Django (`DjangoSacramentoRepository`), conector Tesseract OCR (`TesseractOCRAdapter`), y generador ReportLab PDF.

### 4. APPLICATION (`application/`)
- **Responsabilidad:** Casos de uso puros (Use Cases).
- **Ejemplos:** `ProcesarActaConOCRUseCase`, `RegistrarBautizoUseCase`, `GenerarCertificadoUseCase`.
- **Regla:** Esta capa orquesta los repositorios y puertos, no sabe de HTTP ni de la web.

### 5. ASINCRONÍA (Celery + Redis)
- **Regla estricta:** Las tareas pesadas de OCR, análisis de IA y generación de certificados PDF pesados **NUNCA** deben ejecutarse de forma sincrónica en las peticiones HTTP de Django.
- **Implementación:** Utiliza Celery (ej. `tasks.py`) para procesar estas tareas en segundo plano.
- **Respuestas API:** El endpoint REST debe retornar inmediatamente un estado HTTP `202 Accepted` con un `task_id` para que el frontend pueda hacer seguimiento.

## Principios de Implementación Obligatorios

### 1. Inyección de Dependencias (DI)
Los Casos de Uso (capa `application`) NUNCA deben instanciar adaptadores secundarios directamente. Deben recibir las interfaces (Puertos) a través de su constructor (`__init__`). Esto es vital para inyectar Mocks durante las pruebas.

### 2. DTOs (Data Transfer Objects)
Está **estrictamente prohibido** pasar objetos nativos de Django (como `request`, o instancias de modelos del ORM) hacia las capas `application` o `domain`. Los Adaptadores Primarios (Views/Serializers) deben convertir la data a `dataclasses` nativas de Python o diccionarios antes de llamar al Caso de Uso.

### 3. Manejo de Errores y Excepciones
La lógica de negocio debe lanzar excepciones de dominio personalizadas (ej. `ActaDuplicadaError`, `DatosIncompletosError`). La capa de `adapters` (DRF Views) es la única responsable de atrapar estos errores mediante un manejador (Exception Handler) y traducirlos a códigos HTTP (400, 404, 403). El dominio no sabe qué es HTTP.

### 4. Testing Estratégico
El código en `domain/` y `application/` debe estar cubierto por Unit Tests rápidos y aislados, utilizando Mocks para los repositorios. Prohibido iniciar la base de datos de prueba de Django para evaluar estas capas. Los Integration Tests que tocan la BD real quedan reservados exclusivamente para la capa de `adapters/`.
