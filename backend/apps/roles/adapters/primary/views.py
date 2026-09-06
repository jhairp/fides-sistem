from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth.models import Permission
from .serializers import RolSerializer, PermissionSerializer
from ..secondary.repositories import DjangoRolRepository
from ...application.use_cases import ListarRolesUseCase, ObtenerRolUseCase, CrearRolUseCase, ActualizarRolUseCase

class RolViewSet(viewsets.ViewSet):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.repository = DjangoRolRepository()

    def list(self, request):
        use_case = ListarRolesUseCase(self.repository)
        roles = use_case.ejecutar()
        serializer = RolSerializer([r.__dict__ for r in roles], many=True)
        return Response(serializer.data)

    def retrieve(self, request, pk=None):
        use_case = ObtenerRolUseCase(self.repository)
        try:
            rol = use_case.ejecutar(int(pk))
            serializer = RolSerializer(rol.__dict__)
            return Response(serializer.data)
        except ValueError as e:
            return Response({'detail': str(e)}, status=status.HTTP_404_NOT_FOUND)

    def create(self, request):
        serializer = RolSerializer(data=request.data)
        if serializer.is_valid():
            use_case = CrearRolUseCase(self.repository)
            try:
                rol = use_case.ejecutar(serializer.validated_data)
                return Response(RolSerializer(rol.__dict__).data, status=status.HTTP_201_CREATED)
            except Exception as e:
                return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, pk=None):
        serializer = RolSerializer(data=request.data)
        if serializer.is_valid():
            use_case = ActualizarRolUseCase(self.repository)
            try:
                rol = use_case.ejecutar(int(pk), serializer.validated_data)
                return Response(RolSerializer(rol.__dict__).data)
            except ValueError as e:
                return Response({'detail': str(e)}, status=status.HTTP_404_NOT_FOUND)
            except Exception as e:
                return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def permisos(self, request):
        # Excluir permisos innecesarios si se desea, o devolver todos.
        # Aquí devolvemos todos los permisos nativos ordenados por su modelo.
        permisos = Permission.objects.all().select_related('content_type').order_by('content_type__app_label', 'codename')
        serializer = PermissionSerializer(permisos, many=True)
        return Response(serializer.data)
