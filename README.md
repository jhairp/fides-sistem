# 🏛️ FidesSystem — Sistema de Gestión y Digitalización de Registros Sacramentales con OCR/IA

FidesSystem es una plataforma web integral diseñada para la administración, digitalización y automatización de registros sacramentales (Bautizos, Confirmaciones, Matrimonios y Defunciones). Integra un motor de **OCR/IA (Tesseract OCR)** para la extracción e indización automática de datos provenientes de actas parroquiales históricas escaneadas.

---

## 🚀 Arquitectura del Sistema

El proyecto sigue los principios de **Clean Code** y **Arquitectura Hexagonal (Ports & Adapters)** combinados con un modelo de **Procesamiento Asíncrono orientado a tareas**.

```text
[ Frontend React (TS) ] ── (HTTP REST) ──> [ Django API (Adapters) ]
                                                  │
                                          (Despacha Tarea)
                                                  │
                                                  ▼
[ PostgreSQL ] <── [ Core Hexagonal ] <── [ Celery Worker ] <── [ Redis Broker ]
                             │
                             └──> [ Adaptador OCR / Tesseract ]


FidesSystem/
├── backend/                  # Proyecto Django REST
│   ├── config/               # Configuración global del proyecto Django / Celery
│   ├── sacramentos/          # Módulo principal (Arquitectura Hexagonal)
│   │   ├── domain/           # Entidades puras y reglas de negocio
│   │   ├── ports/            # Interfaces/Contratos abstractos (Interfaces de Repositorios y OCR)
│   │   ├── adapters/         # Adaptadores concretos (DRF Views, Django ORM, Tesseract OCR)
│   │   └── application/      # Casos de uso y tareas en segundo plano (Celery Tasks)
│   └── requirements.txt      # Dependencias de Python
│
├── frontend/                 # Proyecto React + Vite + TypeScript
│   ├── src/
│   │   ├── domain/           # Tipos e interfaces TypeScript puras
│   │   ├── services/         # Clientes de API HTTP (Axios)
│   │   ├── hooks/            # Custom Hooks & TanStack Query (Polling de OCR)
│   │   ├── features/         # Módulos de la UI (OCR, Sacramentos, Certificados)
│   │   └── components/       # Componentes UI atómicos (Tailwind CSS)
│   └── package.json          # Dependencias de Node.js
│
└── README.md                 # Documentación del proyecto