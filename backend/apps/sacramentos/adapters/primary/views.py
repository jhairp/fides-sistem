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
    AuditoriaPartidaSerializer,
    BusquedaSacramentoListSerializer,
    BusquedaSacramentoDetalleSerializer,
    BusquedaSacramentoSerializer
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



from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response


class SacramentoPagination(PageNumberPagination):
    page_size = 50
    page_size_query_param = 'page_size'
    max_page_size = 100

    def get_paginated_response(self, data):
        return Response({
            'count': self.page.paginator.count,
            'total_pages': self.page.paginator.num_pages,
            'current_page': self.page.number,
            'page_size': self.get_page_size(self.request),
            'next': self.get_next_link(),
            'previous': self.get_previous_link(),
            'results': data
        })


class BusquedaSacramentosViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticatedOrReadOnly]
    pagination_class = SacramentoPagination

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return BusquedaSacramentoDetalleSerializer
        return BusquedaSacramentoListSerializer

    def get_queryset(self):
        from django.db.models import Q

        if self.action == 'retrieve':
            qs = PartidaBaseModel.objects.select_related(
                'libro',
                'libro__capilla',
                'sacerdote_celebrante',
                'bautismo__bautizado',
                'bautismo__padre',
                'bautismo__madre',
                'bautismo__padrino',
                'bautismo__madrina',
                'matrimonio__novio',
                'matrimonio__novia',
                'matrimonio__padrino',
                'matrimonio__madrina',
                'matrimonio__testigo_1',
                'matrimonio__testigo_2',
            )
        else:
            qs = PartidaBaseModel.objects.select_related(
                'libro',
                'libro__capilla',
                'sacerdote_celebrante',
                'bautismo__bautizado',
                'bautismo__padre',
                'bautismo__madre',
                'matrimonio__novio',
                'matrimonio__novia',
            )

        qs = qs.order_by('-fecha_sacramento', '-numero_folio', '-numero_partida')

        user = self.request.user
        # Jurisdiccion horizontal
        if user.is_authenticated and not (user.is_superuser or user.groups.filter(name='ADMINISTRADOR').exists()):
            user_capillas = user.capillas.all()
            parroquias_jurisdiccion = [c.parroquia_id for c in user_capillas if c.es_sede_principal]
            capillas_jurisdiccion = [c.id for c in user_capillas if not c.es_sede_principal]
            
            q_juris = Q()
            if parroquias_jurisdiccion:
                q_juris |= Q(libro__capilla__parroquia_id__in=parroquias_jurisdiccion)
            if capillas_jurisdiccion:
                q_juris |= Q(libro__capilla_id__in=capillas_jurisdiccion)
            
            if not q_juris:
                qs = qs.none()
            else:
                qs = qs.filter(q_juris).distinct()

        import re

        def _build_word_pattern(word: str) -> str:
            escaped = re.escape(word)
            vowel_map = {
                'a': '[aáàäAÁÀÄ]', 'A': '[aáàäAÁÀÄ]', 'á': '[aáàäAÁÀÄ]', 'Á': '[aáàäAÁÀÄ]',
                'e': '[eéèëEÉÈË]', 'E': '[eéèëEÉÈË]', 'é': '[eéèëEÉÈË]', 'É': '[eéèëEÉÈË]',
                'i': '[iíìïIÍÌÏ]', 'I': '[iíìïIÍÌÏ]', 'í': '[iíìïIÍÌÏ]', 'Í': '[iíìïIÍÌÏ]',
                'o': '[oóòöOÓÒÖ]', 'O': '[oóòöOÓÒÖ]', 'ó': '[oóòöOÓÒÖ]', 'Ó': '[oóòöOÓÒÖ]',
                'u': '[uúùüUÚÙÜ]', 'U': '[uúùüUÚÙÜ]', 'ú': '[uúùüUÚÙÜ]', 'Ú': '[uúùüUÚÙÜ]',
            }
            chars = [vowel_map.get(ch, ch) for ch in escaped]
            return rf'\y{"".join(chars)}\y'

        def _word_terms_q(field_name: str, text: str) -> Q:
            words = [w.strip() for w in text.strip().split() if w.strip()]
            if not words:
                return Q()
            q = Q()
            for w in words:
                q &= Q(**{f"{field_name}__iregex": _build_word_pattern(w)})
            return q

        # 1. Filtro dividido por NOMBRES, APELLIDO PATERNO y APELLIDO MATERNO del titular
        nombres = self.request.query_params.get('nombres', '').strip()
        apellido_paterno = self.request.query_params.get('apellido_paterno', '').strip()
        apellido_materno = self.request.query_params.get('apellido_materno', '').strip()

        if nombres or apellido_paterno or apellido_materno:
            # Para Bautismo (evaluado sobre bautizado)
            q_baut = Q()
            if nombres:
                q_baut &= _word_terms_q('bautismo__bautizado__nombres', nombres)
            if apellido_paterno:
                q_baut &= _word_terms_q('bautismo__bautizado__apellido_paterno', apellido_paterno)
            if apellido_materno:
                q_baut &= _word_terms_q('bautismo__bautizado__apellido_materno', apellido_materno)

            # Para Matrimonio (evaluado individualmente sobre el novio o sobre la novia)
            q_novio = Q()
            if nombres:
                q_novio &= _word_terms_q('matrimonio__novio__nombres', nombres)
            if apellido_paterno:
                q_novio &= _word_terms_q('matrimonio__novio__apellido_paterno', apellido_paterno)
            if apellido_materno:
                q_novio &= _word_terms_q('matrimonio__novio__apellido_materno', apellido_materno)

            q_novia = Q()
            if nombres:
                q_novia &= _word_terms_q('matrimonio__novia__nombres', nombres)
            if apellido_paterno:
                q_novia &= _word_terms_q('matrimonio__novia__apellido_paterno', apellido_paterno)
            if apellido_materno:
                q_novia &= _word_terms_q('matrimonio__novia__apellido_materno', apellido_materno)

            qs = qs.filter(q_baut | q_novio | q_novia).distinct()
        else:
            # Fallback a búsqueda unificada por nombre si se envía 'nombre' o 'search'
            nombre = self.request.query_params.get('nombre', '').strip() or self.request.query_params.get('search', '').strip()
            if nombre:
                terms = [w.strip() for w in nombre.split() if w.strip()]
                q_nom = Q()
                for term in terms:
                    pattern = _build_word_pattern(term)
                    q_term = (
                        Q(bautismo__bautizado__nombres__iregex=pattern) |
                        Q(bautismo__bautizado__apellido_paterno__iregex=pattern) |
                        Q(bautismo__bautizado__apellido_materno__iregex=pattern) |
                        Q(matrimonio__novio__nombres__iregex=pattern) |
                        Q(matrimonio__novio__apellido_paterno__iregex=pattern) |
                        Q(matrimonio__novio__apellido_materno__iregex=pattern) |
                        Q(matrimonio__novia__nombres__iregex=pattern) |
                        Q(matrimonio__novia__apellido_paterno__iregex=pattern) |
                        Q(matrimonio__novia__apellido_materno__iregex=pattern)
                    )
                    q_nom &= q_term
                qs = qs.filter(q_nom).distinct()

        # 2. Filtro por PADRES (Bautismos)
        padre = self.request.query_params.get('padre', '').strip()
        if padre:
            words = [w.strip() for w in padre.split() if w.strip()]
            q_padre = Q()
            for w in words:
                pattern = _build_word_pattern(w)
                q_padre &= (
                    Q(bautismo__padre__nombres__iregex=pattern) |
                    Q(bautismo__padre__apellido_paterno__iregex=pattern) |
                    Q(bautismo__padre__apellido_materno__iregex=pattern)
                )
            qs = qs.filter(q_padre).distinct()

        madre = self.request.query_params.get('madre', '').strip()
        if madre:
            words = [w.strip() for w in madre.split() if w.strip()]
            q_madre = Q()
            for w in words:
                pattern = _build_word_pattern(w)
                q_madre &= (
                    Q(bautismo__madre__nombres__iregex=pattern) |
                    Q(bautismo__madre__apellido_paterno__iregex=pattern) |
                    Q(bautismo__madre__apellido_materno__iregex=pattern)
                )
            qs = qs.filter(q_madre).distinct()

        # 3. Buscador por UBICACIÓN física exacta en 3 secciones (Libro, Folio/Página, Partida)
        libro = self.request.query_params.get('libro', '').strip()
        if libro:
            qs = qs.filter(libro__numero_libro__iexact=libro)

        folio = self.request.query_params.get('folio', '').strip()
        if folio:
            qs = qs.filter(numero_folio__iexact=folio)

        partida = self.request.query_params.get('partida', '').strip()
        if partida:
            qs = qs.filter(numero_partida__iexact=partida)

        # Fallback si se envía campo unificado ubicacion
        ubicacion = self.request.query_params.get('ubicacion', '').strip()
        if ubicacion:
            terms = ubicacion.split()
            q_ubi = Q()
            for term in terms:
                q_term = (
                    Q(libro__numero_libro__iexact=term) |
                    Q(numero_folio__iexact=term) |
                    Q(numero_partida__iexact=term)
                )
                q_ubi &= q_term
            qs = qs.filter(q_ubi)

        # 4. Filtro por tipo de sacramento
        tipo_sacramento = self.request.query_params.get('tipo_sacramento', '').strip().upper()
        if tipo_sacramento and tipo_sacramento != 'TODOS':
            qs = qs.filter(libro__tipo_sacramento=tipo_sacramento)

        # 5. Rango de Fechas de Nacimiento
        fecha_nac_desde = self.request.query_params.get('fecha_nac_desde', '').strip()
        if fecha_nac_desde:
            q_nac_desde = (
                Q(bautismo__bautizado__fecha_nacimiento__gte=fecha_nac_desde) |
                Q(matrimonio__novio__fecha_nacimiento__gte=fecha_nac_desde) |
                Q(matrimonio__novia__fecha_nacimiento__gte=fecha_nac_desde)
            )
            qs = qs.filter(q_nac_desde).distinct()

        fecha_nac_hasta = self.request.query_params.get('fecha_nac_hasta', '').strip()
        if fecha_nac_hasta:
            q_nac_hasta = (
                Q(bautismo__bautizado__fecha_nacimiento__lte=fecha_nac_hasta) |
                Q(matrimonio__novio__fecha_nacimiento__lte=fecha_nac_hasta) |
                Q(matrimonio__novia__fecha_nacimiento__lte=fecha_nac_hasta)
            )
            qs = qs.filter(q_nac_hasta).distinct()

        # 6. Rango de Fechas de Celebración (Fecha Sacramento)
        fecha_desde = self.request.query_params.get('fecha_desde', '').strip()
        if fecha_desde:
            qs = qs.filter(fecha_sacramento__gte=fecha_desde)

        fecha_hasta = self.request.query_params.get('fecha_hasta', '').strip()
        if fecha_hasta:
            qs = qs.filter(fecha_sacramento__lte=fecha_hasta)

        # Filtros opcionales adicionales
        capilla_id = self.request.query_params.get('capilla_id', '').strip()
        if capilla_id:
            qs = qs.filter(libro__capilla_id=capilla_id)

        estado = self.request.query_params.get('estado', '').strip().upper()
        if estado and estado != 'TODOS':
            qs = qs.filter(estado_partida=estado)

        return qs
