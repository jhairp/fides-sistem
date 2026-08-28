from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated
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
    queryset = ParroquiaModel.objects.all().order_by('nombre')
    serializer_class = ParroquiaSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ['nombre', 'diocesis']


class CapillaViewSet(viewsets.ModelViewSet):
    queryset = CapillaModel.objects.all().order_by('nombre')
    serializer_class = CapillaSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ['nombre', 'ciudad']


class PersonaViewSet(viewsets.ModelViewSet):
    queryset = PersonaModel.objects.all().order_by('apellido_paterno', 'apellido_materno', 'nombres', 'id')
    serializer_class = PersonaSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ['nombres', 'apellido_paterno', 'apellido_materno', 'ci']


class LibroSacramentalViewSet(viewsets.ModelViewSet):
    queryset = LibroSacramentalModel.objects.all().order_by('tipo_sacramento', 'numero_libro', 'id')
    serializer_class = LibroSacramentalSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ['numero_libro', 'tipo_sacramento']


class PartidaBaseViewSet(viewsets.ModelViewSet):
    queryset = PartidaBaseModel.objects.all().order_by('fecha_sacramento', 'numero_folio', 'numero_partida', 'id')
    serializer_class = PartidaBaseSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ['numero_folio', 'numero_partida']


class PartidaBautismoViewSet(viewsets.ModelViewSet):
    queryset = PartidaBautismoModel.objects.all().order_by('partida__fecha_sacramento', 'partida__numero_folio', 'partida__numero_partida')
    serializer_class = PartidaBautismoSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


class PartidaMatrimonioViewSet(viewsets.ModelViewSet):
    queryset = PartidaMatrimonioModel.objects.all().order_by('partida__fecha_sacramento', 'partida__numero_folio', 'partida__numero_partida')
    serializer_class = PartidaMatrimonioSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


class NotaMarginalViewSet(viewsets.ModelViewSet):
    queryset = NotaMarginalModel.objects.all().order_by('fecha_decreto', 'id')
    serializer_class = NotaMarginalSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


class AuditoriaPartidaViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AuditoriaPartidaModel.objects.all().order_by('-created_at', 'id')
    serializer_class = AuditoriaPartidaSerializer
    permission_classes = [IsAuthenticated]
