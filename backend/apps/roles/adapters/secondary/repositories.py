from typing import List, Optional
from ...domain.entities import Rol
from ...ports.repositories import RolRepositoryPort
from ...models import RolModel

class DjangoRolRepository(RolRepositoryPort):
    def _to_entity(self, model: RolModel) -> Rol:
        return Rol(
            id=model.id,
            codigo=model.codigo,
            nombre=model.nombre,
            descripcion=model.descripcion
        )

    def _to_model(self, entity: Rol) -> RolModel:
        model = RolModel(
            codigo=entity.codigo,
            nombre=entity.nombre,
            descripcion=entity.descripcion
        )
        if entity.id:
            model.id = entity.id
        return model

    def listar_todos(self) -> List[Rol]:
        modelos = RolModel.objects.all().order_by('id')
        return [self._to_entity(m) for m in modelos]

    def obtener_por_id(self, rol_id: int) -> Optional[Rol]:
        try:
            modelo = RolModel.objects.get(id=rol_id)
            return self._to_entity(modelo)
        except RolModel.DoesNotExist:
            return None

    def guardar(self, rol: Rol) -> Rol:
        # En Django, si ya existe el ID, al hacer save() se actualiza
        modelo = self._to_model(rol)
        modelo.save()
        return self._to_entity(modelo)
