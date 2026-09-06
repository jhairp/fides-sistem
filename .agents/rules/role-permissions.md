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
