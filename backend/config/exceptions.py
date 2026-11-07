import logging
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
from django.db import IntegrityError

logger = logging.getLogger(__name__)


def custom_exception_handler(exc, context):
    """
    Manejador global de excepciones para Django REST Framework.
    Garantiza que la API SIEMPRE retorne respuestas JSON estructuradas
    y NUNCA páginas HTML de error 500, incluso cuando DEBUG=False.
    """
    # Ejecuta el manejador por defecto de DRF primero (cubre ValidationErrors, NotAuthenticated, etc.)
    response = exception_handler(exc, context)

    if response is not None:
        # Asegurar que el contenido sea JSON y tenga estructura estándar
        return response

    # Capturar excepciones de integridad de base de datos (PostgreSQL / SQLite)
    if isinstance(exc, IntegrityError):
        err_msg = str(exc).lower()
        logger.warning("IntegrityError capturado en API: %s", exc)

        if 'username' in err_msg or 'usuarios_username' in err_msg:
            return Response(
                {'username': ['Este nombre de usuario ya está en uso por otra cuenta.']},
                status=status.HTTP_400_BAD_REQUEST
            )
        if 'email' in err_msg or 'usuarios_email' in err_msg:
            return Response(
                {'email': ['Este correo electrónico ya se encuentra registrado.']},
                status=status.HTTP_400_BAD_REQUEST
            )
        if 'persona' in err_msg:
            return Response(
                {'persona': ['Error de vinculación con la persona especificada.']},
                status=status.HTTP_400_BAD_REQUEST
            )

        return Response(
            {'detail': 'Error de integridad en los datos: el registro ya existe o viola una restricción única.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Para cualquier otra excepción no controlada, loguear el error y responder JSON 500
    logger.exception("Excepción no controlada en la API: %s", exc)

    return Response(
        {
            'detail': 'Error interno del servidor. Por favor verifique los datos o contacte al administrador.'
        },
        status=status.HTTP_500_INTERNAL_SERVER_ERROR
    )

