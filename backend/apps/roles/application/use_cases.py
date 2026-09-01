from typing import List
from ..domain.entities import Rol
from ..ports.repositories import RolRepositoryPort

class ListarRolesUseCase:
    def __init__(self, repository: RolRepositoryPort):
        self.repository = repository

    def ejecutar(self) -> List[Rol]:
        return self.repository.listar_todos()

class ObtenerRolUseCase:
    def __init__(self, repository: RolRepositoryPort):
        self.repository = repository

    def ejecutar(self, rol_id: int) -> Rol:
        rol = self.repository.obtener_por_id(rol_id)
        if not rol:
            raise ValueError(f"Rol con id {rol_id} no encontrado")
        return rol

class CrearRolUseCase:
    def __init__(self, repository: RolRepositoryPort):
        self.repository = repository

    def ejecutar(self, datos: dict) -> Rol:
        rol = Rol(
            id=None,
            codigo=datos.get('codigo', '').upper(),
            nombre=datos.get('nombre', ''),
            descripcion=datos.get('descripcion', '')
        )
        return self.repository.guardar(rol)

class ActualizarRolUseCase:
    def __init__(self, repository: RolRepositoryPort):
        self.repository = repository

    def ejecutar(self, rol_id: int, datos: dict) -> Rol:
        rol_existente = self.repository.obtener_por_id(rol_id)
        if not rol_existente:
            raise ValueError(f"Rol con id {rol_id} no encontrado")
        
        # Actualizamos, recordando la regla de codigo en mayúsculas
        rol_existente.codigo = datos.get('codigo', rol_existente.codigo).upper()
        rol_existente.nombre = datos.get('nombre', rol_existente.nombre)
        rol_existente.descripcion = datos.get('descripcion', rol_existente.descripcion)
        
        return self.repository.guardar(rol_existente)
