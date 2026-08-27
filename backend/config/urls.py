from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView


def health_check(request):
    return JsonResponse({
        "status": "online",
        "system": "FidesSystem Backend API",
        "architecture": "Hexagonal (Ports & Adapters)",
        "version": "2.0.0"
    })


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/health/', health_check, name='health_check'),

    # JWT Authentication Endpoints
    path('api/auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Módulo Hexagonal de Sacramentos API
    path('api/sacramentos/', include('apps.sacramentos.urls')),
]
