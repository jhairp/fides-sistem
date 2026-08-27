from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from apps.sacramentos.models import (
    ParroquiaModel,
    CapillaModel,
    PersonaModel,
    LibroSacramentalModel,
    PartidaBaseModel,
    PartidaBautismoModel,
    PartidaMatrimonioModel,
    NotaMarginalModel,
    AuditoriaPartidaModel
)
from .serializers import (
    ParroquiaSerializer,
    CapillaSerializer,
    PersonaSerializer,
    LibroSacramentalSerializer,
    PartidaBaseSerializer,
    PartidaBautismoSerializer,
    PartidaMatrimonioSerializer,
    NotaMarginalSerializer,
    AuditoriaPartidaSerializer
)


class ParroquiaViewSet(viewsets.ModelViewSet):
    queryset = ParroquiaModel.objects.all()
    serializer_class = ParroquiaSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['nombre', 'diocesis']


class CapillaViewSet(viewsets.ModelViewSet):
    queryset = CapillaModel.objects.all()
    serializer_class = CapillaSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['nombre', 'ciudad']


class PersonaViewSet(viewsets.ModelViewSet):
    queryset = PersonaModel.objects.all()
    serializer_class = PersonaSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['nombres', 'apellido_paterno', 'apellido_materno', 'ci']


class LibroSacramentalViewSet(viewsets.ModelViewSet):
    queryset = LibroSacramentalModel.objects.all()
    serializer_class = LibroSacramentalSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['numero_libro', 'tipo_sacramento']


class PartidaBaseViewSet(viewsets.ModelViewSet):
    queryset = PartidaBaseModel.objects.all()
    serializer_class = PartidaBaseSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['numero_folio', 'numero_partida']


class PartidaBautismoViewSet(viewsets.ModelViewSet):
    queryset = PartidaBautismoModel.objects.all()
    serializer_class = PartidaBautismoSerializer
    permission_classes = [IsAuthenticated]


class PartidaMatrimonioViewSet(viewsets.ModelViewSet):
    queryset = PartidaMatrimonioModel.objects.all()
    serializer_class = PartidaMatrimonioSerializer
    permission_classes = [IsAuthenticated]


class NotaMarginalViewSet(viewsets.ModelViewSet):
    queryset = NotaMarginalModel.objects.all()
    serializer_class = NotaMarginalSerializer
    permission_classes = [IsAuthenticated]


class AuditoriaPartidaViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AuditoriaPartidaModel.objects.all()
    serializer_class = AuditoriaPartidaSerializer
    permission_classes = [IsAuthenticated]
