# Jerarquía de Roles y Permisos (FidesSystem)

Esta regla define los niveles de acceso estandarizados para el sistema y debe ser respetada cada vez que se modifique la seguridad, se añadan nuevos permisos, o se diseñe lógica de negocio (tanto en el backend como en los componentes UI).

## Reglas de Restricción Vertical (Creación de Usuarios)
NUNCA permitas que un rol inferior cree o asigne un rol superior o igual al suyo (Prevención de escalada de privilegios).
- **SUPERADMIN:** Puede crear/asignar cualquier rol.
- **ADMINISTRADOR:** Puede crear roles eclesiásticos, pero NO Superadmins ni Administradores.
- **PÁRROCO:** SOLO puede registrar `SACERDOTE`, `RECTOR` y `SECRETARIO`.
- **RECTOR:** SOLO puede registrar `SECRETARIO`.
- Ningún otro rol puede registrar usuarios.
- *Implementación:* Esta validación debe aplicarse tanto en el dropdown del Frontend (`UsuariosFeature`) filtrando por el rol del usuario logueado, como en el Backend (`UserCreateUpdateSerializer`).

## Matriz de Permisos Base (CRUD y Bajas Lógicas)
Recordatorio: El borrado físico (`delete`) está estrictamente prohibido para los usuarios estándar. Las eliminaciones deben ser Soft Deletes (`change` de estado).

1. **SUPERADMIN (Modo Dios):**
   - Acceso total (`add`, `change`, `delete`, `view`) a todo el sistema, incluyendo tablas ocultas (`logentry`, `user`, `group`, `permission`, `session`).
2. **ADMINISTRADOR:**
   - `add`, `change`, `view` para todo el bloque eclesiástico y `user`. NO puede borrar nada físicamente. NO tiene acceso a tablas de auditoría/sistema.
3. **PÁRROCO:**
   - `add`, `change`, `view` en todo el bloque eclesiástico.
   - `add`, `change`, `view` en `user` (sometido a la regla de restricción vertical).
4. **RECTOR:**
   - Mismos permisos que el Párroco, pero su jurisdicción y creación de usuarios está limitada a su propia Capilla/Centro (lógica de negocio).
5. **SACERDOTE:**
   - `add`, `change`, `view` en **Sacramentos** (Partidas) y **Personas**.
   - CERO permisos de administración de Usuarios o Capillas.
6. **SECRETARIO:**
   - `add`, `change`, `view` en **Sacramentos** y **Personas**. (Igual que el Sacerdote, enfocado en digitación).
7. **FELIGRÉS:**
   - SOLO `view` en sus documentos (Personas, Partidas). No puede crear ni editar nada.

## Reglas de Jurisdicción Horizontal y Capillas
- **Multi-Capilla (ManyToMany):** Un usuario (Párroco, Rector, Sacerdote) puede estar asignado a múltiples capillas al mismo tiempo. El campo en el modelo es `User.capillas` (ManyToMany). 
- **Un Solo Rector:** Por regla de negocio, una capilla solo puede tener **un Rector activo** al mismo tiempo. Esta validación se realiza a nivel de Backend (`UserCreateUpdateSerializer`).
- **Feligreses sin Sede:** Un usuario con rol `FELIGRES` **no puede estar asignado a una capilla o centro**. Su arreglo de capillas siempre debe ir vacío `[]`.
- **Visibilidad Horizontal (Backend y Frontend):**
  - Los usuarios NO deben verse a sí mismos en la tabla de listado de usuarios.
  - El Superadmin y el Administrador pueden ver a todos los usuarios.
  - Los Párrocos y Rectores solo pueden ver usuarios y capillas que pertenezcan a su jurisdicción (filtrado mediante query `User.capillas.all()`).
  - Los `FELIGRESES` están ocultos de la tabla de listado de usuarios a menos que el usuario sea Superadmin o Administrador (excluidos con `qs.exclude(groups__name='FELIGRES')`).
- **Restricción de UI:** A los Sacerdotes se les oculta por completo la pestaña de "Usuarios" en el Sidebar.
