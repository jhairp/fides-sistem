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
    serializer_class = CapillaSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ['nombre', 'ciudad']

    def get_queryset(self):
        qs = CapillaModel.objects.all().order_by('nombre')
        user = self.request.user
        
        # Filtrado de jurisdicción horizontal para listados
        if user.is_authenticated and not (user.is_superuser or user.groups.filter(name='ADMINISTRADOR').exists()):
            user_capillas = user.capillas.all()
            parroquias_jurisdiccion = [c.parroquia_id for c in user_capillas if c.es_sede_principal]
            capillas_jurisdiccion = [c.id for c in user_capillas if not c.es_sede_principal]
            
            from django.db.models import Q
            q_filters = Q()
            if parroquias_jurisdiccion:
                q_filters |= Q(parroquia_id__in=parroquias_jurisdiccion)
            if capillas_jurisdiccion:
                q_filters |= Q(id__in=capillas_jurisdiccion)
            
            if not q_filters:
                qs = qs.none()
            else:
                qs = qs.filter(q_filters).distinct()
                
        return qs

    def paginate_queryset(self, queryset):
        if self.request.query_params.get('all') == 'true':
            return None
        return super().paginate_queryset(queryset)


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
