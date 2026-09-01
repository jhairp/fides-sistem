from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .adapters.primary.views import RolViewSet

router = DefaultRouter()
router.register(r'roles', RolViewSet, basename='roles')

urlpatterns = [
    path('', include(router.urls)),
]
