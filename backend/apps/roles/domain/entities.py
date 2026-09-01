from dataclasses import dataclass
from typing import Optional

@dataclass
class Rol:
    id: Optional[int]
    codigo: str
    nombre: str
    descripcion: Optional[str] = None
