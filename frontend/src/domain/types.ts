export interface Persona {
  id?: string;
  nombres: string;
  apellido_paterno: string;
  apellido_materno?: string;
  ci?: string;
  fecha_nacimiento?: string;
  lugar_nacimiento?: string;
  sexo?: 'M' | 'F';
  estado_civil?: string;
  domicilio?: string;
  telefono?: string;
  nombre_completo?: string;
}

export interface Capilla {
  id: string;
  nombre: string;
  telefono?: string;
  es_sede_principal: boolean;
  ciudad: string;
  municipio: string;
  direccion?: string;
  coordenadas_gps?: string;
  capacidad_personas: number;
  estado: string;
}

export interface Parroquia {
  id: string;
  nombre: string;
  diocesis: string;
  telefono?: string;
  direccion?: string;
  estado: string;
}

export interface LibroSacramental {
  id: string;
  capilla: string;
  capilla_nombre?: string;
  tipo_sacramento: 'BAUTISMO' | 'COMUNION' | 'CONFIRMACION' | 'MATRIMONIO';
  numero_libro: number;
  fecha_apertura: string;
  fecha_cierre?: string;
  estado: 'ABIERTO' | 'CERRADO' | 'ARCHIVADO';
}

export interface PartidaBase {
  id: string;
  libro: string;
  numero_folio: number;
  numero_partida: number;
  fecha_sacramento: string;
  sacerdote_celebrante?: string;
  sacerdote_nombre?: string;
  observaciones?: string;
  imagen_escaneada_url?: string;
  estado_partida: 'ACTIVA' | 'RECTIFICADA' | 'ANULADA';
  registrado_por?: string;
  modificado_por?: string;
  created_at?: string;
}

export interface PartidaBautismo {
  partida: string;
  partida_detalle?: PartidaBase;
  bautizado: string;
  bautizado_detalle?: Persona;
  padre?: string;
  madre?: string;
  padrino?: string;
  madrina?: string;
  hijo_legitimo: boolean;
}

export interface PartidaMatrimonio {
  partida: string;
  partida_detalle?: PartidaBase;
  novio: string;
  novio_detalle?: Persona;
  novia: string;
  novia_detalle?: Persona;
  testigo_1?: string;
  testigo_2?: string;
  padrino?: string;
  madrina?: string;
  reg_civil_oficialia?: string;
  reg_civil_libro?: string;
  reg_civil_partida?: string;
  reg_civil_fecha?: string;
}

export interface NotaMarginal {
  id?: string;
  partida_bautismo?: string;
  tipo_anotacion: 'MATRIMONIO' | 'CONFIRMACION' | 'ORDEN_SACERDOTAL' | 'RECTIFICACION' | 'NULIDAD';
  partida_origen?: string;
  descripcion: string;
  fecha_decreto: string;
  autorizado_por: string;
  autorizado_por_nombre?: string;
  parroquia_externa_nombre?: string;
  ciudad_externa?: string;
  created_at?: string;
}

export interface AuthUser {
  id?: string;
  username: string;
  email: string;
  is_staff?: boolean;
  is_superuser?: boolean;
  capilla_asignada?: string;
  capilla_nombre?: string;
  role?: string;
  foto_url?: string;
  persona?: {
    id: string;
    nombres: string;
    apellido_paterno: string;
    apellido_materno?: string;
    ci?: string;
    sexo?: string;
    telefono?: string;
    nombre_completo?: string;
  };
}

export interface UserAccount {
  id: string;
  username: string;
  email: string;
  role: string;
  capilla_asignada?: string;
  capilla_nombre?: string;
  foto_url?: string;
  is_active: boolean;
  is_staff?: boolean;
  is_superuser?: boolean;
  date_joined?: string;
  persona?: {
    id: string;
    nombres: string;
    apellido_paterno: string;
    apellido_materno?: string;
    ci?: string;
    sexo?: string;
    telefono?: string;
    nombre_completo?: string;
    tipo_persona?: string;
  };
}

export interface Permiso {
  id: number;
  name: string;
  codename: string;
}

export interface Rol {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  permiso_ids?: number[];
}

export interface LiturgicalEvent {
  id: string;
  tipo: 'MISA_SALUD' | 'MISA_DIFUNTO' | 'BAUTISMO_COLECTIVO' | 'CONFIRMACION' | 'MATRIMONIO';
  titulo: string;
  intencion_de: string;
  capilla_nombre: string;
  fecha_hora: string;
  sacerdote_nombre: string;
  estado: 'PENDIENTE' | 'CELEBRADA' | 'ANULADA';
}

export interface CertificateRequest {
  id: string;
  tipo_sacramento: 'BAUTISMO' | 'MATRIMONIO';
  titular_nombre: string;
  fecha_emision: string;
  codigo_verificacion_qr: string;
  firmado_por: string;
  estado: 'EMITIDO' | 'ANULADO';
}

export interface AuditLog {
  id: string;
  usuario_nombre: string;
  accion: 'CREACION' | 'EDICION' | 'ANULACION' | 'LECTURA';
  modelo_afectado: string;
  detalle_json: string;
  fecha_hora: string;
}

export interface OCRScanResult {
  imagen_url: string;
  confianza: number;
  nombres_detectados: string;
  apellido_paterno_detectado: string;
  apellido_materno_detectado: string;
  fecha_detectada: string;
  numero_libro_detectado: number;
  numero_folio_detectado: number;
  numero_partida_detectado: number;
}
