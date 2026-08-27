# 🏛️ FidesSystem — Sistema de Gestión y Digitalización de Registros Sacramentales con OCR/IA

Plataforma web centralizada desarrollada para la **Parroquia Santísima Trinidad** y sus capillas dependientes (*Santuario Jesús del Gran Poder*, *Santa Mónica*, *Exaltación Santa Rita*, etc.) en la ciudad de La Paz, Bolivia. 

**FidesSystem** permite la administración de registros sacramentales (Bautismos, Comuniones, Confirmaciones y Matrimonios), la vinculación automática de notas marginales canónicas (locales e inter-parroquiales), la digitalización asistida de libros históricos mediante **Inteligencia Artificial y OCR (Tesseract / Vision AI)** con revisión humana (*Human-in-the-loop*), la emisión de certificados en PDF con código QR de autenticidad y la gestión de reservas litúrgicas.

---

## 🔐 Credenciales del SuperAdmin Inicial

Al ejecutar la carga inicial de datos (`seed_data` o `reset_db`), el sistema crea automáticamente el usuario Administrador General:

- **Usuario**: `SuperAdmin`
- **Correo Electrónico**: `suad@gmail.com`
- **Contraseña**: `12345678`
- **Rol / Grupo**: `SUPERADMIN` (Superusuario con acceso total a todos los modelos y permisos del sistema).

---

## 🛡️ Matriz de Roles y Permisos (Django Groups)

El sistema crea 7 Grupos de Permisos nativos en Django (`Group`), organizados jerárquicamente:

| Rol / Grupo | Descripción de Funciones | Alcance de Permisos |
| :--- | :--- | :--- |
| **`SUPERADMIN`** | Acceso absoluto a todo el sistema, gestión de capillas, respaldos y asignación de usuarios. | Todos los permisos de Django (`is_superuser=True`). |
| **`ADMINISTRADOR`** | Gestión administrativa global de capillas, libros sacramentales y usuarios. | Crear, Editar, Eliminar y Consultar en el módulo de sacramentos. |
| **`PARROCO`** | Aprobación de partidas sacramentales, firma de certificados, emisión de notas marginales y reportes. | Crear, Editar y Consultar sacramentos, notas marginales y libros. |
| **`RECTOR`** | Gestión de ceremonias litúrgicas, administración de libros sacramentales y emisión de actas. | Crear, Editar y Consultar partidas y certificados. |
| **`SECRETARIO`** | Registro manual de bautismos/matrimonios, escaneo OCR de libros y atención de intenciones de misas. | Crear, Editar y Consultar (Sin permiso de eliminación definitiva de actas). |
| **`SACERDOTE`** | Consulta de agenda litúrgica, misas asignadas y confirmación de sacramentos celebrados. | Permisos de lectura/consulta de personas y sacramentos. |
| **`FELIGRES`** | Solicitud de intenciones de misa en línea y consulta pública de horarios. | Solo lectura de eventos públicos. |

---

## 🛠️ Comandos de Administración de Base de Datos

En la carpeta `backend`, dispones de dos comandos personalizados fundamentales:

### 1. Comando `seed_data`
Pobla la base de datos con los datos reales de la parroquia en **MAYÚSCULAS**:
```powershell
python manage.py seed_data
```
**Lo que genera**:
- **Parroquia Principal**: `PARROQUIA SANTÍSIMA TRINIDAD` (Teléfono `74185852`).
- **5 Capillas Reales** (Capacidad: 200 personas cada una):
  1. `SANTÍSIMA TRINIDAD` (Sede Principal - Teléf: `74185852`, Coord: `-16.4986163,-68.1408758`).
  2. `SANTUARIO JESÚS DEL GRAN PODER` (Teléf: `72062964`, Coord: `-16.4997032,-68.14259419999999`).
  3. `SANTA RITA` (Teléf: `67107486`, Coord: `-16.4998146,-68.1501187`).
  4. `SEÑOR DE EXALTACIÓN` (Teléf: `74856914`, Coord: `-16.4961481,-68.1454899`).
  5. `CAPILLA DE SANTA MÓNICA` (Teléf: `741`, Coord: `-16.5069112,-68.1524014`).
- Los 7 Grupos de Permisos en MAYÚSCULAS.
- El usuario `SuperAdmin` (`suad@gmail.com` / `12345678`).
- Personas y partidas de bautismo de prueba.

### 2. Comando `reset_db`
Vacía por completo todas las tablas de PostgreSQL/SQLite, re-aplica las migraciones de cero y ejecuta automáticamente `seed_data`:
```powershell
python manage.py reset_db
```

---

## 🚀 Guía de Instalación y Ejecución

```powershell
# 1. Crear y activar entorno virtual
python -m venv venv
.\venv\Scripts\Activate.ps1

# 2. Navegar a backend e instalar dependencias
cd backend
pip install -r requirements.txt

# 3. Aplicar migraciones y poblar datos iniciales
python manage.py reset_db

# 4. Iniciar el servidor de desarrollo
python manage.py runserver
```

Acceso al panel administrativo: `http://127.0.0.1:8000/admin/`  
Acceso a la API REST: `http://127.0.0.1:8000/api/sacramentos/`