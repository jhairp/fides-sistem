-- =============================================================================
-- ESQUEMA DE BASE DE DATOS OPTIMIZADO: FidesSystem v2
-- Arquitectura Relacional para Registros Sacramentales, OCR y Reservas
-- Motor: PostgreSQL 14+
-- =============================================================================

-- Habilitar extensiones necesarias para UUIDs y Búsqueda Avanzada
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- =============================================================================
-- 1. ESTRUCTURA GEOGRÁFICA Y ADMINISTRATIVA
-- =============================================================================

CREATE TABLE parroquias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(150) NOT NULL,
    diocesis VARCHAR(150) DEFAULT 'Arquidiócesis de La Paz',
    telefono VARCHAR(30),
    direccion TEXT,
    estado VARCHAR(20) DEFAULT 'ACTIVA' CHECK (estado IN ('ACTIVA', 'INACTIVA')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE capillas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parroquia_id UUID NOT NULL REFERENCES parroquias(id) ON DELETE RESTRICT,
    nombre VARCHAR(150) NOT NULL, -- Ej: 'Santuario Jesús del Gran Poder'
    es_sede_principal BOOLEAN DEFAULT FALSE,
    ciudad VARCHAR(100) DEFAULT 'La Paz',
    municipio VARCHAR(100) DEFAULT 'Nuestra Señora de La Paz',
    direccion TEXT,
    coordenadas_gps VARCHAR(100),
    capacidad_personas INT DEFAULT 0,
    estado VARCHAR(20) DEFAULT 'ACTIVA' CHECK (estado IN ('ACTIVA', 'INACTIVA')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- 2. ENTIDAD UNIFICADA DE SERES HUMANOS (PERSONAS)
-- =============================================================================

CREATE TABLE personas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombres VARCHAR(100) NOT NULL,
    apellido_paterno VARCHAR(100) NOT NULL,
    apellido_materno VARCHAR(100),
    ci VARCHAR(20),
    fecha_nacimiento DATE,
    lugar_nacimiento VARCHAR(150),
    sexo CHAR(1) CHECK (sexo IN ('M', 'F')),
    estado_civil VARCHAR(30) DEFAULT 'SOLTERO' CHECK (estado_civil IN ('SOLTERO', 'CASADO', 'VIUDO', 'DIVORCIADO', 'CONSAGRADO')),
    domicilio TEXT,
    telefono VARCHAR(30),
    -- Datos opcionales del Registro Civil (para cruzamiento de partidas)
    reg_civil_oficialia VARCHAR(50),
    reg_civil_libro VARCHAR(50),
    reg_civil_partida VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices de búsqueda optimizados para nombres en español
CREATE INDEX idx_personas_apellidos_nombres ON personas (apellido_paterno, apellido_materno, nombres);
CREATE INDEX idx_personas_ci ON personas (ci) WHERE ci IS NOT NULL;
-- Índice trigram para búsquedas difusas con errores de ortografía (ej: "Gonzáles" vs "Gonzales")
CREATE INDEX idx_personas_nombre_trgm ON personas USING gin ((nombres || ' ' || apellido_paterno || ' ' || COALESCE(apellido_materno, '')) gin_trgm_ops);

-- =============================================================================
-- 3. SISTEMA DE USUARIOS Y AUTENTICACIÓN (RBAC)
-- =============================================================================

CREATE TABLE roles (
    id INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    codigo VARCHAR(30) UNIQUE NOT NULL, -- 'SUPERADMIN', 'PARROCO', 'SECRETARIO', 'SACERDOTE', 'FIEL'
    nombre VARCHAR(50) NOT NULL,
    descripcion TEXT
);

INSERT INTO roles (codigo, nombre, descripcion) VALUES
('SUPERADMIN', 'Super Administrador', 'Acceso total al sistema y configuración multi-parroquia'),
('PARROCO', 'Párroco / Rector', 'Gestión de partidas, aprobación de certificados y reportes'),
('SECRETARIO', 'Secretario/a Parroquial', 'Registro de partidas, escaneo OCR y reservas'),
('SACERDOTE', 'Sacerdote Celebrante', 'Consulta de agenda litúrgica y misas asignadas'),
('FIEL', 'Fiel / Creyente', 'Solicitud de misas e intenciones en línea');

CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID UNIQUE NOT NULL REFERENCES personas(id) ON DELETE RESTRICT,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    rol_id INT NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
    capilla_asignada_id UUID REFERENCES capillas(id) ON DELETE SET NULL,
    foto_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    is_staff BOOLEAN DEFAULT FALSE,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- 4. CONTROL DE LIBROS FÍSICOS Y ARCHIVO PARROQUIAL
-- =============================================================================

CREATE TABLE libros_sacramentales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    capilla_id UUID NOT NULL REFERENCES capillas(id) ON DELETE RESTRICT,
    tipo_sacramento VARCHAR(20) NOT NULL CHECK (tipo_sacramento IN ('BAUTISMO', 'COMUNION', 'CONFIRMACION', 'MATRIMONIO')),
    numero_libro INT NOT NULL,
    fecha_apertura DATE NOT NULL,
    fecha_cierre DATE,
    estado VARCHAR(20) DEFAULT 'ABIERTO' CHECK (estado IN ('ABIERTO', 'CERRADO', 'ARCHIVADO')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    -- Garantiza que no existan 2 libros del mismo tipo con el mismo número en la misma capilla
    CONSTRAINT unique_libro_por_capilla UNIQUE (capilla_id, tipo_sacramento, numero_libro)
);

-- =============================================================================
-- 5. NÚCLEO SACRAMENTAL (PATRÓN DE HERENCIA BASE + ESPECIALIZACIÓN)
-- =============================================================================

-- Tabla Madre General para todas las partidas
CREATE TABLE partidas_base (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    libro_id UUID NOT NULL REFERENCES libros_sacramentales(id) ON DELETE RESTRICT,
    numero_folio INT NOT NULL,
    numero_partida INT NOT NULL,
    fecha_sacramento DATE NOT NULL,
    sacerdote_celebrante_id UUID REFERENCES personas(id) ON DELETE RESTRICT,
    observaciones TEXT,
    imagen_escaneada_url TEXT, -- Fotografía o escaneo del archivo histórico
    estado_partida VARCHAR(20) DEFAULT 'ACTIVA' CHECK (estado_partida IN ('ACTIVA', 'RECTIFICADA', 'ANULADA')),
    registrado_por_usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    -- RESTRICCIÓN FÍSICA INVIOLABLE: Imposible repetir Libro + Folio + Partida en el archivo
    CONSTRAINT unique_partida_fisica UNIQUE (libro_id, numero_folio, numero_partida)
);

-- Especialización: BAUTISMO
CREATE TABLE partidas_bautismo (
    partida_id UUID PRIMARY KEY REFERENCES partidas_base(id) ON DELETE CASCADE,
    bautizado_id UUID NOT NULL REFERENCES personas(id) ON DELETE RESTRICT,
    padre_id UUID REFERENCES personas(id) ON DELETE SET NULL,
    madre_id UUID REFERENCES personas(id) ON DELETE SET NULL,
    padrino_id UUID REFERENCES personas(id) ON DELETE SET NULL,
    madrina_id UUID REFERENCES personas(id) ON DELETE SET NULL,
    hijo_legitimo BOOLEAN DEFAULT TRUE
);

-- Especialización: PRIMERA COMUNIÓN
CREATE TABLE partidas_comunion (
    partida_id UUID PRIMARY KEY REFERENCES partidas_base(id) ON DELETE CASCADE,
    comulgante_id UUID NOT NULL REFERENCES personas(id) ON DELETE RESTRICT,
    padrino_id UUID REFERENCES personas(id) ON DELETE SET NULL,
    madrina_id UUID REFERENCES personas(id) ON DELETE SET NULL
);

-- Especialización: CONFIRMACIÓN
CREATE TABLE partidas_confirmacion (
    partida_id UUID PRIMARY KEY REFERENCES partidas_base(id) ON DELETE CASCADE,
    confirmado_id UUID NOT NULL REFERENCES personas(id) ON DELETE RESTRICT,
    padrino_id UUID REFERENCES personas(id) ON DELETE SET NULL,
    madrina_id UUID REFERENCES personas(id) ON DELETE SET NULL
);

-- Especialización: MATRIMONIO
CREATE TABLE partidas_matrimonio (
    partida_id UUID PRIMARY KEY REFERENCES partidas_base(id) ON DELETE CASCADE,
    novio_id UUID NOT NULL REFERENCES personas(id) ON DELETE RESTRICT,
    novia_id UUID NOT NULL REFERENCES personas(id) ON DELETE RESTRICT,
    testigo_1_id UUID REFERENCES personas(id) ON DELETE SET NULL,
    testigo_2_id UUID REFERENCES personas(id) ON DELETE SET NULL,
    padrino_id UUID REFERENCES personas(id) ON DELETE SET NULL,
    madrina_id UUID REFERENCES personas(id) ON DELETE SET NULL,
    reg_civil_oficialia VARCHAR(50),
    reg_civil_libro VARCHAR(50),
    reg_civil_partida VARCHAR(50),
    reg_civil_fecha DATE
);

-- =============================================================================
-- 6. NOTAS MARGINALES CANÓNICAS E INTER-CAPILLAS
-- =============================================================================

CREATE TABLE notas_marginales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partida_bautismo_id UUID NOT NULL REFERENCES partidas_bautismo(partida_id) ON DELETE RESTRICT,
    tipo_anotacion VARCHAR(30) NOT NULL CHECK (tipo_anotacion IN ('MATRIMONIO', 'CONFIRMACION', 'ORDEN_SACERDOTAL', 'RECTIFICACION', 'NULIDAD')),
    partida_origen_id UUID REFERENCES partidas_base(id) ON DELETE SET NULL, -- Enlace relacional directo al matrimonio/sacramento de origen
    descripcion TEXT NOT NULL,
    fecha_decreto DATE NOT NULL,
    autorizado_por_id UUID REFERENCES personas(id) ON DELETE RESTRICT, -- Sacerdote o Canciller que autorizó
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- 7. MÓDULO DE IA & ESCANEO OCR DE LIBROS HISTÓRICOS
-- =============================================================================

CREATE TABLE escaneos_ocr (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    libro_id UUID REFERENCES libros_sacramentales(id) ON DELETE SET NULL,
    numero_folio INT,
    imagen_url TEXT NOT NULL,
    resultado_json_raw JSONB, -- Texto completo extraído por la IA
    confianza_promedio NUMERIC(5,2), -- Porcentaje de certeza (ej. 94.50%)
    estado_procesamiento VARCHAR(30) DEFAULT 'PENDIENTE' CHECK (estado_procesamiento IN ('PENDIENTE', 'PROCESADO_IA', 'VERIFICADO_HUMANO', 'RECHAZADO')),
    partida_generada_id UUID REFERENCES partidas_base(id) ON DELETE SET NULL,
    verificado_por_usuario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- 8. GESTIÓN LITÚRGICA, CALENDARIO Y RESERVA DE MISAS
-- =============================================================================

CREATE TABLE eventos_liturgicos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    capilla_id UUID NOT NULL REFERENCES capillas(id) ON DELETE RESTRICT,
    sacerdote_celebrante_id UUID REFERENCES personas(id) ON DELETE SET NULL,
    tipo_evento VARCHAR(50) NOT NULL CHECK (tipo_evento IN ('MISA_ORDINARIA', 'MISA_ESPECIAL', 'BAUTIZO_COMUN', 'CONFESION', 'FIESTA_PATRONAL')),
    fecha DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    detalle TEXT,
    cupo_maximo_intenciones INT DEFAULT 50,
    estado VARCHAR(20) DEFAULT 'PROGRAMADO' CHECK (estado IN ('PROGRAMADO', 'EN_CURSO', 'CONCLUIDO', 'CANCELADO')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE comprobantes_pago (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo_transaccion VARCHAR(100) UNIQUE NOT NULL,
    monto NUMERIC(10,2) NOT NULL,
    monto_literal VARCHAR(255) NOT NULL,
    metodo_pago VARCHAR(50) DEFAULT 'EFECTIVO' CHECK (metodo_pago IN ('EFECTIVO', 'TRANSFERENCIA_QR', 'DEPOSITO')),
    estado_pago VARCHAR(20) DEFAULT 'COMPLETADO' CHECK (estado_pago IN ('PENDIENTE', 'COMPLETADO', 'ANULADO')),
    registrado_por_usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE intenciones_misa (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    evento_id UUID NOT NULL REFERENCES eventos_liturgicos(id) ON DELETE RESTRICT,
    solicitante_persona_id UUID REFERENCES personas(id) ON DELETE SET NULL,
    nombre_solicitante_externo VARCHAR(150),
    telefono_contacto VARCHAR(30),
    tipo_intencion VARCHAR(40) NOT NULL CHECK (tipo_intencion IN ('SALUD', 'DIFUNTO', 'ACCION_DE_GRACIAS', 'CUMPLEAÑOS', 'INTENCION_ESPECIAL')),
    intencion_texto TEXT NOT NULL,
    comprobante_id UUID REFERENCES comprobantes_pago(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- 9. AUDITORÍA INALTERABLE Y SEGURIDAD (AUDIT LOG)
-- =============================================================================

CREATE TABLE auditoria_partidas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partida_id UUID NOT NULL REFERENCES partidas_base(id) ON DELETE CASCADE,
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
    accion VARCHAR(20) NOT NULL CHECK (accion IN ('CREACION', 'MODIFICACION', 'RECTIFICACION', 'ANULACION')),
    datos_anteriores JSONB, -- Fotografía exacta de los datos antes de modificar
    datos_nuevos JSONB,     -- Fotografía exacta de los datos ingresados
    motivo_justificacion TEXT, -- Exigido en rectificaciones según Derecho Canónico
    ip_origen VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
