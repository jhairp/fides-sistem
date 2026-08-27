from abc import ABC, abstractmethod
from typing import List, Optional
import uuid
from apps.sacramentos.domain.entities.persona import Persona
from apps.sacramentos.domain.entities.nota_marginal import NotaMarginal
from apps.sacramentos.domain.value_objects.ubicacion_fisica import UbicacionFisica


class PersonaRepositoryPort(ABC):
    """Puerto de salida para el repositorio de Personas"""

    @abstractmethod
    def save(self, persona: Persona) -> Persona:
        pass

    @abstractmethod
    def find_by_id(self, persona_id: uuid.UUID) -> Optional[Persona]:
        pass

    @abstractmethod
    def search_by_name(self, query: str) -> List[Persona]:
        pass


class SacramentoRepositoryPort(ABC):
    """Puerto de salida para el repositorio de Sacramentos y Partidas Base"""

    @abstractmethod
    def existe_partida_en_ubicacion(self, capilla_id: uuid.UUID, tipo_sacramento: str, ubicacion: UbicacionFisica) -> bool:
        pass

    @abstractmethod
    def save_nota_marginal(self, nota: NotaMarginal) -> NotaMarginal:
        pass
