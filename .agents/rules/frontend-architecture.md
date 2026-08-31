---
name: Frontend Architecture and React Standards
description: Reglas estrictas para el Frontend de FidesSystem (React, TypeScript, Tailwind, Feedback Visual y Bajas Lógicas).
trigger: always_on
---

# Arquitectura del Frontend (FidesSystem)

Actúa como un Desarrollador Frontend Senior especializado en React, TypeScript y TailwindCSS.
El proyecto es "FidesSystem: Sistema Web de Gestión de Registros Sacramentales" (consume API REST de Django).

## 1. Estructura de Carpetas Obligatoria (`frontend/src/`)
Respeta estrictamente las siguientes capas:

- **`domain/`**: Definición de interfaces TypeScript puras (`types.ts`).
- **`services/`**: Clientes HTTP desacoplados usando Axios (`api.ts`).
- **`hooks/`**: Custom hooks (`useAuth`, `useActionAlert`, `useTheme`).
- **`features/`**: Componentes de nivel de página/módulo completo (ej. `BautismosFeature`, `UsuariosFeature`). Aquí se concentra la lógica de obtención de datos (mediante `useEffect` y `useState`).
- **`components/common/`**: Componentes UI reutilizables (`ActionOverlay`, `TopAlert`, botones genéricos).

## 2. Reglas de Negocio y Bajas Lógicas (Soft Delete)
- **Cero Bajas Físicas:** NUNCA envíes peticiones para ejecutar un `DELETE` físico en la base de datos. 
- La anulación de partidas cambia `estado_partida` a `'ANULADA'`.
- La desactivación de registros (personas, capillas, usuarios) cambia su `estado` a `'INACTIVO'`.

## 3. Manejo de Formularios y Textos (Auto-MAYÚSCULAS)
- Todos los datos de texto introducidos en formularios deben ser convertidos a **MAYÚSCULAS** (tanto visualmente en el Input como en el payload enviado por Axios).
- **Excepciones estrictas:** El correo electrónico (`email`), las contraseñas (`password`), los nombres de usuario (`username`) y campos específicos que requieran formato mixto, DEBEN respetar las minúsculas/mayúsculas originales.

## 4. Estilos y Diseño (Tailwind CSS)
- **Regla Estricta:** PROHIBIDO crear archivos `.css`, `.scss` o usar estilos en línea (`style={{}}`). TODO el diseño, estructura y animaciones de componentes debe lograrse utilizando clases utilitarias de **Tailwind CSS** y librerías especializadas (como `framer-motion`).

## 5. Feedback Visual Constante (Éxito y Error)
- **Éxito:** Toda operación de creación, edición, anulación o cambio de estado debe disparar feedback visual usando el hook `useActionAlert` (el cual llama a `ActionOverlay` y `TopAlert`).
- **Errores:** 
  - Los errores de validación del formulario (ej. "El usuario ya existe" o datos faltantes, tipo HTTP 400) deben mostrarse **dentro del formulario**, indicando exactamente qué campo tiene el problema o en un banner superior dentro de la propia modal.
  - Los errores críticos del servidor (500) pueden usar un Toast o Alerta general roja.
