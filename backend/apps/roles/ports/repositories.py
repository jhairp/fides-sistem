from abc import ABC, abstractmethod
from typing import List, Optional
from ..domain.entities import Rol

class RolRepositoryPort(ABC):
    @abstractmethod
    def listar_todos(self) -> List[Rol]:
        pass

    @abstractmethod
    def obtener_por_id(self, rol_id: int) -> Optional[Rol]:
        pass

    @abstractmethod
    def guardar(self, rol: Rol) -> Rol:
        pass
