from dataclasses import dataclass
from datetime import date
from typing import Optional
import uuid


@dataclass
class NotaMarginal:
    """
    Entidad pura de dominio que representa una Nota Marginal Canónica.
    Soporta notas vinculadas localmente o referencias de partidas externas.
    """
    id: Optional[uuid.UUID]
    partida_bautismo_id: Optional[uuid.UUID]  # Opcional si es para un bautismo externo
    tipo_anotacion: str  # 'MATRIMONIO', 'CONFIRMACION', 'ORDEN_SACERDOTAL', 'RECTIFICACION', 'NULIDAD'
    descripcion: str
    fecha_decreto: date
    autorizado_por_nombre: str
    partida_origen_id: Optional[uuid.UUID] = None  # Enlace relacional a sacramento local
    parroquia_externa_nombre: Optional[str] = None  # Si el bautismo/matrimonio ocurrió en otra iglesia externa
    ciudad_externa: Optional[str] = None
