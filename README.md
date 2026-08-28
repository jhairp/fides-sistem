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

## 💻 Ejecución del Backend (Django REST)

```powershell
# 1. Crear y activar entorno virtual
python -m venv venv
.\venv\Scripts\Activate.ps1

# 2. Navegar a backend e instalar dependencias
cd backend
pip install -r requirements.txt

# 3. Reiniciar y aplicar migraciones con datos reales (MAYÚSCULAS)
python manage.py reset_db

# 4. Iniciar el servidor de desarrollo
python manage.py runserver
```

Acceso al panel administrativo: `http://127.0.0.1:8000/admin/`  
Acceso a la API REST: `http://127.0.0.1:8000/api/sacramentos/`

---

## 🎨 Ejecución del Frontend (React + Vite + Tailwind CSS)

```powershell
# 1. Navegar a la carpeta del frontend
cd frontend

# 2. Iniciar el servidor de desarrollo Vite
npm run dev
```

La aplicación se iniciará en `http://localhost:5173/`.

### Características del Frontend:
- **Estética Eclesiástica Digna**: Paleta con Dorado Imperial Cálido (`#F59E0B`), Azul Noche Catedral (`#0F172A`) y detalles en Carmesí (`#E11D48`).
- **Soporte de Tema Claro y Oscuro**: Alternancia de tema con persistencia en `localStorage`.
- **Modo Mayúsculas Automático**: Transformación de todos los campos de texto a MAYÚSCULAS antes del envío a la API.
- **Visualización de Capillas**: Módulos interactivos para las 5 capillas reales (*Santísima Trinidad*, *Jesús del Gran Poder*, *Santa Rita*, *Señor de Exaltación*, *Santa Mónica*).
- **Procesamiento de Libros por OCR con IA**: Carga de imágenes con vista previa e interfaz de validación humana (*Human-in-the-loop*).