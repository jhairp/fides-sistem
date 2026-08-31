from django.contrib.auth.backends import ModelBackend
from django.contrib.auth import get_user_model

User = get_user_model()

class CaseInsensitiveModelBackend(ModelBackend):
    """
    Autenticación que permite iniciar sesión sin importar si el usuario
    está escrito en mayúsculas o minúsculas.
    """
    def authenticate(self, request, username=None, password=None, **kwargs):
        if username is None:
            username = kwargs.get(User.USERNAME_FIELD)
        
        if not username:
            return None
            
        username = username.strip()
        
        try:
            # Búsqueda ignorando mayúsculas/minúsculas por username O email
            from django.db.models import Q
            user = User.objects.get(Q(username__iexact=username) | Q(email__iexact=username))
        except User.DoesNotExist:
            User().set_password(password)
            return None
        except User.MultipleObjectsReturned:
            user = User.objects.filter(Q(username__iexact=username) | Q(email__iexact=username)).first()
        
        if user.check_password(password) and self.user_can_authenticate(user):
            return user
        return None
