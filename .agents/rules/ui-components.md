---
name: FidesSystem UI Components Guideline
description: Standards and guidelines for using common React UI components (Table actions, Status toggles) across all modules to prevent code redundancy.
trigger: always_on
---

# FidesSystem Frontend Component Guidelines

When modifying or creating new features/tables in the React frontend of `FidesSystem`, **always** use the existing generic UI components located in `frontend/src/components/common/` instead of hardcoding HTML buttons or repetitive Tailwind classes.

## Available Common Components

### 1. Table Buttons (`frontend/src/components/common/TableButtons.tsx`)

Used primarily in the `render` functions of table columns.

- **`StatusToggleButton`**: For boolean active/inactive state changes.
  ```tsx
  import { StatusToggleButton } from '../components/common/TableButtons';
  // Usage:
  <StatusToggleButton 
    isActive={item.estado === 'ACTIVO'} 
    onToggle={() => toggleStatus(item.id)} 
    activeText="ACTIVO"      // Optional (Default: ACTIVO)
    inactiveText="INACTIVO"  // Optional (Default: INACTIVO)
  />
  ```

- **`EditButton`**: A standardized square, yellow edit button with a pencil icon that matches the project's aesthetics.
  ```tsx
  import { EditButton } from '../components/common/TableButtons';
  // Usage:
  <EditButton onClick={() => handleEdit(item)} title="Editar Registro" />
  ```

## General Rules
1. Never hardcode repetitive Tailwind styling for basic action buttons in tables. Import them from `TableButtons.tsx`.
2. Center your "Acciones" columns. (`className: 'text-center'` and `justify-center` for the cell flexbox).
3. If a new generic action button is created (e.g. Delete, View Details), add it to `TableButtons.tsx` and export it instead of making it unique to one file.
