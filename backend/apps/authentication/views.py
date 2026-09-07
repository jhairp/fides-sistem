from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from apps.authentication.models import User
from .serializers import UserSerializer, UserCreateUpdateSerializer


class UserViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['username', 'email', 'persona__nombres', 'persona__apellido_paterno', 'persona__apellido_materno', 'persona__ci']

    def get_queryset(self):
        user = self.request.user
        qs = User.objects.all().select_related('persona').prefetch_related('capillas').order_by('username')
        
        if user.is_authenticated:
            # Regla: No verse a sí mismo
            qs = qs.exclude(id=user.id)
            
            # Regla de Jurisdicción Horizontal y Filtrado de Feligreses
            if not (user.is_superuser or user.groups.filter(name='ADMINISTRADOR').exists()):
                # No ver a feligreses a menos que se sea admin
                qs = qs.exclude(groups__name='FELIGRES')

                user_capillas = user.capillas.all()
                parroquias_jurisdiccion = [c.parroquia_id for c in user_capillas if c.es_sede_principal]
                capillas_jurisdiccion = [c.id for c in user_capillas if not c.es_sede_principal]
                
                from django.db.models import Q
                q_filters = Q()
                if parroquias_jurisdiccion:
                    q_filters |= Q(capillas__parroquia_id__in=parroquias_jurisdiccion)
                if capillas_jurisdiccion:
                    q_filters |= Q(capillas__id__in=capillas_jurisdiccion)
                
                if not q_filters:
                    qs = qs.none()
                else:
                    qs = qs.filter(q_filters).distinct()
                    
        return qs

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return UserCreateUpdateSerializer
        return UserSerializer

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def toggle_active(self, request, pk=None):
        user = self.get_object()
        
        # Evitar desactivar al superusuario propio si es el mismo que hace la petición
        if user == request.user and not user.is_active:
            # Aunque desactivarse a sí mismo usualmente no se puede, evitemos el autoflag
            pass
            
        user.is_active = not user.is_active
        user.save()
        
        estado_str = "ACTIVADO" if user.is_active else "DESACTIVADO (BAJA LÓGICA)"
        return Response({
            "status": "success",
            "message": f"Usuario {user.username} {estado_str} exitosamente.",
            "is_active": user.is_active
        })

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def change_password(self, request):
        user = request.user
        current_password = request.data.get("current_password")
        new_password = request.data.get("new_password")

        if not current_password or not new_password:
            return Response(
                {"error": "Se requieren la contraseña actual y la nueva contraseña."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not user.check_password(current_password):
            return Response(
                {"error": "La contraseña actual es incorrecta."},
                status=status.HTTP_400_BAD_REQUEST
            )

        user.set_password(new_password)
        user.save()
        return Response({
            "status": "success",
            "message": "Contraseña actualizada exitosamente."
        })
