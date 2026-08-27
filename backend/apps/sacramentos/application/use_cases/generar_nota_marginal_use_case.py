from typing import Dict, Any
from apps.sacramentos.domain.entities.nota_marginal import NotaMarginal
from apps.sacramentos.ports.sacramento_repository_port import SacramentoRepositoryPort


class GenerarNotaMarginalUseCase:
    """
    Caso de uso de aplicación: Generar Nota Marginal Canónica.
    Soporta vincular partidas de bautismo locales o registrar referencias de bautismos realizados en iglesias externas.
    """

    def __init__(self, sacramento_repo: SacramentoRepositoryPort):
        self.sacramento_repo = sacramento_repo

    def execute(self, datos: Dict[str, Any]) -> NotaMarginal:
        # Si el bautismo fue realizado en otra parroquia fuera del sistema:
        parroquia_externa = datos.get('parroquia_externa_nombre')
        bautismo_id = datos.get('partida_bautismo_id')

        if not bautismo_id and not parroquia_externa:
            raise ValueError("Debe especificar la partida de bautismo local o el nombre de la parroquia externa de origen.")

        nota = NotaMarginal(
            id=None,
            partida_bautismo_id=bautismo_id,
            tipo_anotacion=datos['tipo_anotacion'],
            descripcion=datos['descripcion'],
            fecha_decreto=datos['fecha_decreto'],
            autorizado_por_nombre=datos['autorizado_por_nombre'],
            partida_origen_id=datos.get('partida_origen_id'),
            parroquia_externa_nombre=parroquia_externa,
            ciudad_externa=datos.get('ciudad_externa')
        )

        return self.sacramento_repo.save_nota_marginal(nota)
