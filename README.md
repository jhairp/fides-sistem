# 🏛️ FidesSystem — Sistema de Gestión y Digitalización de Registros Sacramentales con OCR/IA

Plataforma web centralizada desarrollada para la **Parroquia Santísima Trinidad** y sus capillas dependientes (*Santuario Jesús del Gran Poder*, *Santa Mónica*, *Exaltación Santa Rita*, etc.) en la ciudad de La Paz, Bolivia. 

**FidesSystem** permite la administración de registros sacramentales (Bautismos, Comuniones, Confirmaciones y Matrimonios), la vinculación automática de notas marginales canónicas (locales e inter-parroquiales), la digitalización asistida de libros históricos mediante **Inteligencia Artificial y OCR (Tesseract / Vision AI)** con revisión humana (*Human-in-the-loop*), la emisión de certificados en PDF con código QR de autenticidad, la búsqueda optimizada de partidas en libros físicos y la gestión de reservas litúrgicas.

---

## 👥 Usuarios de Prueba y Credenciales de Acceso

Al ejecutar la carga inicial de datos (`python backend/manage.py seed_data` o `reset_db`), el sistema puebla automáticamente las capillas base y los usuarios correspondientes a cada rol eclesiástico:

| Usuario (`username`) | Correo Electrónico | Contraseña | Rol / Grupo | Nombre y Asignación |
| :--- | :--- | :--- | :--- | :--- |
| **`SuperAdmin`** | `suad@gmail.com` | `12345678` | `SUPERADMIN` | SUPERADMIN SISTEMA (Modo Dios / Total) |
| **`Administrador`** | `admin@gmail.com` | `12345678` | `ADMINISTRADOR` | ADMIN GENERAL (Gestión global) |
| **`Parroco`** | `parroco@gmail.com` | `12345678` | `PARROCO` | PARROCO TITULAR (Santísima Trinidad) |
| **`Rector`** | `rector@gmail.com` | `12345678` | `RECTOR` | RECTOR CAPILLA (Santa Mónica) |
| **`Sacerdote`** | `sacerdote@gmail.com` | `12345678` | `SACERDOTE` | PADRE CELEBRANTE (Santísima Trinidad) |
| **`Secretario`** | `secretario@gmail.com` | `12345678` | `SECRETARIO` | SECRETARIO PARROQUIAL (Santísima Trinidad) |
| **`monicabuscador`** | `monicabuscador@gmail.com` | `moni12SJ` | `SECRETARIO` | MONICA ARCE ROJAS (Santísima Trinidad) |
| **`Feligres`** | `feligres@gmail.com` | `12345678` | `FELIGRES` | FELIGRES COMUN (Santa Mónica) |

---

## 🛡️ Matriz de Roles y Permisos (Django Groups)

El sistema crea 7 Grupos de Permisos nativos en Django (`Group`), organizados jerárquicamente según las reglas canónicas:

| Rol / Grupo | Descripción de Funciones | Alcance de Permisos |
| :--- | :--- | :--- |
| **`SUPERADMIN`** | Acceso absoluto a todo el sistema, gestión de capillas, respaldos y asignación de usuarios. | Todos los permisos de Django (`is_superuser=True`). |
| **`ADMINISTRADOR`** | Gestión administrativa global de capillas, libros sacramentales y usuarios. | Crear, Editar y Consultar en el módulo de sacramentos y usuarios (sin borrado). |
| **`PARROCO`** | Aprobación de partidas sacramentales, firma de certificados, emisión de notas marginales y reportes. | Crear, Editar y Consultar sacramentos, notas marginales y libros (ver parroquia). |
| **`RECTOR`** | Encargado de centro pastoral o capilla, administración de libros sacramentales y emisión de actas. | Crear, Editar y Consultar partidas y certificados de su capilla. |
| **`SECRETARIO`** | Registro manual de sacramentos, digitación de libros, búsqueda sacramental y atención eclesiástica. | Crear, Editar y Consultar actas, notas marginales y personas. |
| **`SACERDOTE`** | Celebrante de ceremonias litúrgicas y confirmación de sacramentos celebrados. | Permisos de lectura/consulta y registro de actas celebradas. |
| **`FELIGRES`** | Usuario final, consulta pública de horarios y seguimiento de solicitudes de actas. | Solo lectura y consulta básica. |

---

## 🗄️ Guía de Semillas (Seeds) y Carga de Datos

El backend incluye comandos personalizados de gestión para poblar la base de datos según sea necesario:

### 1. Activar Entorno Virtual
```powershell
.\venv\Scripts\Activate.ps1
```

### 2. Comandos Disponibles

#### A. Seed de Roles y Permisos (`seed_roles`)
Sincroniza en la base de datos la tabla de roles (`RolModel`) y crea los grupos de Django con sus permisos específicos para cada modelo:
```powershell
python backend/manage.py seed_roles
```

#### B. Seed de Datos Base (`seed_data`)
Ejecuta `seed_roles`, inserta la parroquia principal (*Parroquia Espíritu Santo*), las capillas (*Santísima Trinidad* y *Santa Mónica*) y todos los usuarios de prueba detallados en la tabla superior (incluyendo a `monicabuscador`):
```powershell
python backend/manage.py seed_data
```

#### C. Reinicio Completo de Base de Datos (`reset_db`)
> ⚠️ **Precaución:** Este comando vacía todas las tablas (`flush`), reaplica todas las migraciones (`migrate`) y ejecuta automáticamente `seed_data`. Borra cualquier dato cargado previamente.
```powershell
python backend/manage.py reset_db
```

#### D. Migración de Sacramentos Históricos Reales (Access a PostgreSQL)
Para migrar y poblar los **más de 22,800 sacramentos históricos** (22,237 bautismos, 599 matrimonios, libros y personas normalizadas desde el sistema legado):
```powershell
python backend/scripts/migrate_access_to_fides.py --execute
```

---

## 🚀 Ejecución Simultánea del Proyecto (Backend + Frontend)

Para iniciar ambos servidores (Django REST en el puerto `8000` y React Vite en el puerto `5173`) **al mismo tiempo con un solo comando**:

```powershell
npm run dev
```

> 💡 **En Windows:** También puedes ejecutar `.\dev.bat` o hacer doble clic sobre el archivo `dev.bat` en el explorador de archivos.
>
> Detecta automáticamente el entorno virtual (`venv`) de Python y muestra la salida de ambos servicios en la misma consola con etiquetas de color:
> - `[BACKEND]` → Django API en `http://127.0.0.1:8000/`
> - `[FRONTEND]` → React Web en `http://localhost:5173/`

---

## 💻 Ejecución Individual del Backend (Django REST)

```powershell
# 1. Crear y activar entorno virtual
python -m venv venv
.\venv\Scripts\Activate.ps1

# 2. Navegar a backend e instalar dependencias
cd backend
pip install -r requirements.txt

# 3. Aplicar migraciones y cargar datos base
python manage.py migrate
python manage.py seed_data

# 4. Iniciar el servidor de desarrollo
python manage.py runserver
```

- Acceso al panel administrativo: `http://127.0.0.1:8000/admin/`  
- Acceso a la API REST: `http://127.0.0.1:8000/api/`

---

## 🎨 Ejecución del Frontend (React + Vite + Tailwind CSS)

```powershell
# 1. Navegar a la carpeta del frontend
cd frontend

# 2. Iniciar el servidor de desarrollo Vite
npm run dev
```

La aplicación se iniciará en `http://localhost:5173/`.

### Características Principales del Frontend:
- **Búsqueda Avanzada de Sacramentos:** Filtros instantáneos por nombre de feligrés, rango de fechas y ubicación física en libros dividida en 3 casillas (N° Libro, N° Folio, N° Partida), optimizados con debouncing y paginación en servidor.
- **Formato Canónico de Fechas:** Visualización estandarizada en formato `DD-MM-AAAA`.
- **Estética Eclesiástica Digna:** Paleta con Dorado Imperial Cálido (`#F59E0B`), Azul Noche Catedral (`#0F172A`) y detalles en Carmesí (`#E11D48`).
- **Soporte de Tema Claro y Oscuro:** Alternancia de tema con persistencia en `localStorage`.
- **Modo Mayúsculas Automático:** Transformación automática de textos a MAYÚSCULAS en formularios e interfaces eclesiásticas.
- **Digitalización OCR con IA:** Carga de imágenes con vista previa e interfaz de validación humana (*Human-in-the-loop*).
