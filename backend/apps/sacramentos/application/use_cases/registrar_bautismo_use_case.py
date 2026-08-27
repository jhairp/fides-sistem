from typing import Dict, Any
from apps.sacramentos.domain.entities.persona import Persona
from apps.sacramentos.domain.value_objects.ubicacion_fisica import UbicacionFisica
from apps.sacramentos.ports.sacramento_repository_port import SacramentoRepositoryPort, PersonaRepositoryPort


class RegistrarBautismoUseCase:
    """
    Caso de uso de aplicación: Registrar Partida de Bautismo.
    Aplica las reglas de negocio eclesiásticas y valida duplicidades en el archivo físico.
    """

    def __init__(self, sacramento_repo: SacramentoRepositoryPort, persona_repo: PersonaRepositoryPort):
        self.sacramento_repo = sacramento_repo
        self.persona_repo = persona_repo

    def execute(self, datos: Dict[str, Any]) -> Dict[str, Any]:
        ubicacion = UbicacionFisica(
            numero_libro=datos['numero_libro'],
            numero_folio=datos['numero_folio'],
            numero_partida=datos['numero_partida']
        )

        # 1. Validar unicidad física en la capilla
        if self.sacramento_repo.existe_partida_en_ubicacion(
            capilla_id=datos['capilla_id'],
            tipo_sacramento='BAUTISMO',
            ubicacion=ubicacion
        ):
            raise ValueError(f"Ya existe una partida registrada en el Libro {ubicacion.numero_libro}, Folio {ubicacion.numero_folio}, Partida {ubicacion.numero_partida}.")

        # 2. Registrar o recuperar bautizado
        bautizado_data = datos['bautizado']
        bautizado = Persona(
            id=bautizado_data.get('id'),
            nombres=bautizado_data['nombres'],
            apellido_paterno=bautizado_data['apellido_paterno'],
            apellido_materno=bautizado_data.get('apellido_materno'),
            ci=bautizado_data.get('ci'),  # Opcional para registros antiguos
            fecha_nacimiento=bautizado_data.get('fecha_nacimiento'),
            lugar_nacimiento=bautizado_data.get('lugar_nacimiento'),
            sexo=bautizado_data.get('sexo')
        )
        bautizado_guardado = self.persona_repo.save(bautizado)

        return {
            "status": "success",
            "message": "Partida de bautismo registrada exitosamente.",
            "bautizado_id": str(bautizado_guardado.id),
            "ubicacion": str(ubicacion)
        }
