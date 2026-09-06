from dataclasses import dataclass
from typing import Optional, List

@dataclass
class Rol:
    id: Optional[int]
    codigo: str
    nombre: str
    descripcion: Optional[str] = None
    permiso_ids: List[int] = None

    def __post_init__(self):
        if self.permiso_ids is None:
            self.permiso_ids = []
