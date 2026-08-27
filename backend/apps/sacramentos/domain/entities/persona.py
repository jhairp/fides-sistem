from dataclasses import dataclass
from datetime import date
from typing import Optional
import uuid


@dataclass
class Persona:
    """
    Entidad pura de dominio que representa a un ser humano en FidesSystem.
    Sin dependencias de Django u ORM.
    """
    id: Optional[uuid.UUID]
    nombres: str
    apellido_paterno: str
    apellido_materno: Optional[str] = None
    ci: Optional[str] = None  # Opcional para registros antiguos
    fecha_nacimiento: Optional[date] = None
    lugar_nacimiento: Optional[str] = None
    sexo: Optional[str] = None  # 'M' o 'F'
    estado_civil: str = 'SOLTERO'
    domicilio: Optional[str] = None
    telefono: Optional[str] = None

    @property
    def nombre_completo(self) -> str:
        materno = f" {self.apellido_materno}" if self.apellido_materno else ""
        return f"{self.nombres} {self.apellido_paterno}{materno}".strip()
