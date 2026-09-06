from typing import List, Optional
from django.contrib.auth.models import Group
from ...domain.entities import Rol
from ...ports.repositories import RolRepositoryPort
from ...models import RolModel

class DjangoRolRepository(RolRepositoryPort):
    def _to_entity(self, model: RolModel) -> Rol:
        return Rol(
            id=model.id,
            codigo=model.codigo,
            nombre=model.nombre,
            descripcion=model.descripcion,
            permiso_ids=list(model.permisos.values_list('id', flat=True))
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
        modelos = RolModel.objects.prefetch_related('permisos').all().order_by('id')
        return [self._to_entity(m) for m in modelos]

    def obtener_por_id(self, rol_id: int) -> Optional[Rol]:
        try:
            modelo = RolModel.objects.prefetch_related('permisos').get(id=rol_id)
            return self._to_entity(modelo)
        except RolModel.DoesNotExist:
            return None

    def guardar(self, rol: Rol) -> Rol:
        modelo = self._to_model(rol)
        modelo.save()
        if rol.permiso_ids is not None:
            modelo.permisos.set(rol.permiso_ids)
        
        # Sincronizar con el grupo nativo de Django
        grupo, _ = Group.objects.get_or_create(name=rol.codigo)
        if rol.permiso_ids is not None:
            grupo.permissions.set(rol.permiso_ids)
            
        return self._to_entity(modelo)
