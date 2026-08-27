"""
Exposición de modelos ORM para Django App 'sacramentos' desde la capa de Adaptadores Secundarios.
"""

from .adapters.secondary.models import (
    ParroquiaModel,
    CapillaModel,
    PersonaModel,
    LibroSacramentalModel,
    PartidaBaseModel,
    PartidaBautismoModel,
    PartidaMatrimonioModel,
    NotaMarginalModel,
    AuditoriaPartidaModel,
)

__all__ = [
    'ParroquiaModel',
    'CapillaModel',
    'PersonaModel',
    'LibroSacramentalModel',
    'PartidaBaseModel',
    'PartidaBautismoModel',
    'PartidaMatrimonioModel',
    'NotaMarginalModel',
    'AuditoriaPartidaModel',
]
