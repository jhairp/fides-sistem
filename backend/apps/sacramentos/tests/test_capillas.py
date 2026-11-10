import uuid
from django.test import TestCase
from django.contrib.auth import get_user_model
from django.db.models import RestrictedError
from rest_framework.test import APIClient
from rest_framework import status
from apps.sacramentos.models import ParroquiaModel, CapillaModel

User = get_user_model()


class CapillaModelAndAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_superuser(
            username="admin_test",
            email="admin@test.com",
            password="password123"
        )
        self.client.force_authenticate(user=self.user)

        self.parroquia = ParroquiaModel.objects.create(
            nombre="PARROQUIA SANTÍSIMA TRINIDAD",
            diocesis="ARQUIDIÓCESIS DE LA PAZ",
            telefono="2-2410000",
            direccion="ZONA SAN PEDRO",
            estado="ACTIVO",
        )

    def test_capilla_creation_and_attributes(self):
        """Verificar creación de capilla, clave primaria UUID y metadatos"""
        capilla = CapillaModel.objects.create(
            parroquia=self.parroquia,
            nombre="CAPILLA SEÑOR DE LA EXALTACIÓN",
            telefono="71234567",
            es_sede_principal=True,
            ciudad="LA PAZ",
            municipio="NUESTRA SEÑORA DE LA PAZ",
            direccion="CALLE BOLÍVAR #123",
            coordenadas_gps="-16.496500, -68.132800",
            capacidad_personas=350,
            estado="ACTIVA",
        )

        self.assertIsInstance(capilla.id, uuid.UUID)
        self.assertEqual(CapillaModel._meta.db_table, "capillas")
        self.assertEqual(capilla.estado, "ACTIVA")
        self.assertEqual(capilla.coordenadas_gps, "-16.496500, -68.132800")
        self.assertTrue(capilla.es_sede_principal)
        self.assertIn("CAPILLA SEÑOR DE LA EXALTACIÓN", str(capilla))

    def test_referential_integrity_prevent_cascade_delete(self):
        """Verificar regla de base de datos: Cero borrado en cascada (RESTRICT)"""
        CapillaModel.objects.create(
            parroquia=self.parroquia,
            nombre="CAPILLA SANTA BÁRBARA",
            direccion="AV. MONTES #456",
        )

        # Intentar borrar la parroquia padre debe fallar por RESTRICT
        with self.assertRaises(RestrictedError):
            self.parroquia.delete()

    def test_api_list_capillas(self):
        """Verificar endpoint GET /api/sacramentos/capillas/"""
        CapillaModel.objects.create(
            parroquia=self.parroquia,
            nombre="CAPILLA DE LA MERCED",
            coordenadas_gps="-16.501234, -68.145678",
            estado="ACTIVA",
        )

        response = self.client.get("/api/sacramentos/capillas/?all=true")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertTrue(len(data) >= 1)

        item = next(c for c in data if c["nombre"] == "CAPILLA DE LA MERCED")
        self.assertEqual(item["parroquia_nombre"], "PARROQUIA SANTÍSIMA TRINIDAD")
        self.assertEqual(item["coordenadas_gps"], "-16.501234, -68.145678")

    def test_api_create_capilla(self):
        """Verificar endpoint POST /api/sacramentos/capillas/ con coordenadas GPS"""
        payload = {
            "nombre": "CAPILLA NUESTRA SEÑORA DE GUADALUPE",
            "parroquia": str(self.parroquia.id),
            "es_sede_principal": False,
            "ciudad": "LA PAZ",
            "municipio": "NUESTRA SEÑORA DE LA PAZ",
            "direccion": "AV. AMÉRICA #789",
            "telefono": "78965412",
            "capacidad_personas": 250,
            "coordenadas_gps": "-16.498800, -68.135500",
            "estado": "ACTIVA",
        }

        response = self.client.post("/api/sacramentos/capillas/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        created_data = response.json()
        self.assertEqual(created_data["nombre"], "CAPILLA NUESTRA SEÑORA DE GUADALUPE")
        self.assertEqual(created_data["coordenadas_gps"], "-16.498800, -68.135500")
        self.assertEqual(created_data["parroquia"], str(self.parroquia.id))

        # Verificar persistencia en base de datos
        db_capilla = CapillaModel.objects.get(id=created_data["id"])
        self.assertEqual(db_capilla.nombre, "CAPILLA NUESTRA SEÑORA DE GUADALUPE")

    def test_api_create_capilla_validation_error(self):
        """Verificar que campos requeridos fallen con HTTP 400 si faltan"""
        # Falta parroquia y nombre
        response = self.client.post("/api/sacramentos/capillas/", {}, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        errors = response.json()
        self.assertIn("nombre", errors)
        self.assertIn("parroquia", errors)

    def test_api_update_capilla_and_gps(self):
        """Verificar endpoint PATCH /api/sacramentos/capillas/{id}/"""
        capilla = CapillaModel.objects.create(
            parroquia=self.parroquia,
            nombre="CAPILLA SAN PEDRO",
            coordenadas_gps="-16.500000, -68.150000",
            estado="ACTIVA",
        )

        update_payload = {
            "coordenadas_gps": "-16.505555, -68.142222",
            "capacidad_personas": 500,
        }

        response = self.client.patch(f"/api/sacramentos/capillas/{capilla.id}/", update_payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        capilla.refresh_from_db()
        self.assertEqual(capilla.coordenadas_gps, "-16.505555, -68.142222")
        self.assertEqual(capilla.capacidad_personas, 500)

    def test_api_toggle_capilla_estado(self):
        """Verificar cambio de estado ACTIVA -> INACTIVA"""
        capilla = CapillaModel.objects.create(
            parroquia=self.parroquia,
            nombre="CAPILLA ESPÍRITU SANTO",
            estado="ACTIVA",
        )

        # Desactivar
        response = self.client.patch(f"/api/sacramentos/capillas/{capilla.id}/", {"estado": "INACTIVA"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        capilla.refresh_from_db()
        self.assertEqual(capilla.estado, "INACTIVA")

        # Reactivar
        response = self.client.patch(f"/api/sacramentos/capillas/{capilla.id}/", {"estado": "ACTIVA"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        capilla.refresh_from_db()
        self.assertEqual(capilla.estado, "ACTIVA")
