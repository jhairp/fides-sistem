---
name: crear-modulo-frontend
description: Scaffolding completo para crear una nueva Feature de React en el frontend de FidesSystem, conectada a la API y usando los componentes comunes de interfaz.
---

# Procedimiento: Crear Nuevo Módulo Frontend (FidesSystem)

Cuando el usuario solicite crear un nuevo módulo visual en React (ej. "Crea el frontend para Capillas"), sigue estrictamente estos pasos:

## Paso 1: Tipos del Dominio
1. Abre `frontend/src/domain/types.ts`.
2. Añade las interfaces necesarias que coincidan exactamente con la respuesta del Serializer del backend.

## Paso 2: Servicio API
1. Abre `frontend/src/services/api.ts`.
2. Crea los métodos de Axios necesarios (GET, POST, PUT, PATCH).
3. Asegúrate de convertir a MAYÚSCULAS los datos en el payload (excepto emails y contraseñas) antes de enviarlos si la regla lo exige.

## Paso 3: Interfaz Principal (Feature)
1. Crea un nuevo archivo en `frontend/src/features/[Nombre]Feature.tsx`.
2. Configura el estado usando `useState` y la carga inicial usando `useEffect`.
3. Importa el hook `useActionAlert` para manejar el feedback visual.
4. Renderiza una tabla y un botón para crear nuevos registros.

## Paso 4: Reutilización de Componentes UI
1. Al armar la tabla, importa:
   `import { StatusToggleButton, EditButton } from '../components/common/TableButtons';`
2. Configura la columna "Estado" usando `<StatusToggleButton />`.
3. Configura la columna "Acciones" (centrada) usando `<EditButton />`.

## Paso 5: Modal de Formulario y Bajas Lógicas
1. Crea el formulario flotante (Modal) para crear/editar.
2. Implementa las funciones de creación/edición. En los bloques `catch`, muestra los errores específicos (HTTP 400) dentro del modal.
3. En el bloque `then`, dispara el feedback visual de éxito.
4. Recuerda que no existe el borrado. Solo implementa "Cambiar estado a INACTIVO/ANULADA".

## Paso 6: Verificación
Asegúrate de que NO se crearon archivos `.css` (usa solo clases de Tailwind). Notifica al usuario cuando el módulo esté renderizado.
