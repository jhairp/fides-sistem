from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .adapters.primary.views import (
    ParroquiaViewSet,
    CapillaViewSet,
    PersonaViewSet,
    LibroSacramentalViewSet,
    PartidaBaseViewSet,
    PartidaBautismoViewSet,
    PartidaMatrimonioViewSet,
    NotaMarginalViewSet,
    AuditoriaPartidaViewSet,
    BusquedaSacramentosViewSet
)

router = DefaultRouter()
router.register(r'parroquias', ParroquiaViewSet, basename='parroquias')
router.register(r'capillas', CapillaViewSet, basename='capillas')
router.register(r'personas', PersonaViewSet, basename='personas')
router.register(r'libros', LibroSacramentalViewSet, basename='libros')
router.register(r'partidas', PartidaBaseViewSet, basename='partidas')
router.register(r'bautismos', PartidaBautismoViewSet, basename='bautismos')
router.register(r'matrimonios', PartidaMatrimonioViewSet, basename='matrimonios')
router.register(r'notas-marginales', NotaMarginalViewSet, basename='notas-marginales')
router.register(r'auditorias', AuditoriaPartidaViewSet, basename='auditorias')
router.register(r'busqueda-sacramentos', BusquedaSacramentosViewSet, basename='busqueda-sacramentos')

urlpatterns = [
    path('', include(router.urls)),
]
