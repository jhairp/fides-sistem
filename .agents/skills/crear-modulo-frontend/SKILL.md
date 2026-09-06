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

## Paso 4: Reutilización Estricta de Componentes UI (CRÍTICO)
1. **NO construyas tablas o headers manualmente.** Debes usar:
   - `<FeatureHeader />` para el título principal y el botón de creación principal.
   - `<FeatureTable />` para renderizar los datos. SIEMPRE pasa la prop `title="[Nombre] Registrados"` para que muestre el conteo total de registros.
   - `<FeatureSearchFilters />` para la barra de búsqueda y filtros. NUNCA lo envuelvas en divs adicionales que alteren su diseño nativo.
2. Al configurar las columnas de `FeatureTable`, usa los botones estandarizados:
   `import { StatusToggleButton, EditButton } from '../components/common/TableButtons';`
3. Usa `import type` (ej. `import type { TableColumn } from ...`) para importar interfaces puras y evitar errores de Vite al compilar.

## Paso 5: Modal de Formulario y Alertas
1. **Modal UI:** El formulario flotante debe seguir EXACTAMENTE el layout visual del proyecto (revisa `UsuariosFeature.tsx` como molde): un backdrop `bg-slate-950/60 backdrop-blur-sm`, un contenedor principal `max-w-md bg-white dark:bg-slate-900 rounded-2xl`, botones de 'CANCELAR' y 'GUARDAR' estandarizados, y los inputs con el estilo dark/light mode `bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800`.
2. **Alertas:** Usa `const { isVisible, alertType, alertMessage, triggerAlert } = useActionAlert();` y ASEGÚRATE de montar `<ActionOverlay isVisible={isVisible} type={alertType} message={alertMessage} />` en el return del componente. Llama a `triggerAlert('creado', 'Exito')` para dispararlas.

## Paso 6: Verificación
Asegúrate de que NO se crearon archivos `.css` (usa solo clases de Tailwind). Notifica al usuario cuando el módulo esté renderizado.
