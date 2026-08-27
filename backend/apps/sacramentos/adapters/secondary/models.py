import uuid
from django.db import models
from django.conf import settings


class ParroquiaModel(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    nombre = models.CharField(max_length=150)
    diocesis = models.CharField(max_length=150, default='ARQUIDIÓCESIS DE LA PAZ')
    telefono = models.CharField(max_length=30, blank=True, null=True)
    direccion = models.TextField(blank=True, null=True)
    estado = models.CharField(max_length=20, default='ACTIVA', choices=[('ACTIVA', 'Activa'), ('INACTIVA', 'Inactiva')])
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'parroquias'
        verbose_name = 'Parroquia'
        verbose_name_plural = 'Parroquias'

    def __str__(self):
        return self.nombre


class CapillaModel(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    parroquia = models.ForeignKey(ParroquiaModel, on_delete=models.RESTRICT, related_name='capillas')
    nombre = models.CharField(max_length=150)
    telefono = models.CharField(max_length=30, blank=True, null=True)
    es_sede_principal = models.BooleanField(default=False)
    ciudad = models.CharField(max_length=100, default='LA PAZ')
    municipio = models.CharField(max_length=100, default='NUESTRA SEÑORA DE LA PAZ')
    direccion = models.TextField(blank=True, null=True)
    coordenadas_gps = models.CharField(max_length=100, blank=True, null=True)
    capacidad_personas = models.IntegerField(default=200)
    estado = models.CharField(max_length=20, default='ACTIVA', choices=[('ACTIVA', 'Activa'), ('INACTIVA', 'Inactiva')])
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'capillas'
        verbose_name = 'Capilla'
        verbose_name_plural = 'Capillas'

    def __str__(self):
        return f"{self.nombre} ({self.parroquia.nombre})"


class PersonaModel(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    nombres = models.CharField(max_length=100)
    apellido_paterno = models.CharField(max_length=100)
    apellido_materno = models.CharField(max_length=100, blank=True, null=True)
    ci = models.CharField(max_length=20, blank=True, null=True, help_text='Opcional para registros antiguos')
    fecha_nacimiento = models.DateField(blank=True, null=True)
    lugar_nacimiento = models.CharField(max_length=150, blank=True, null=True)
    sexo = models.CharField(max_length=1, choices=[('M', 'Masculino'), ('F', 'Femenino')], blank=True, null=True)
    estado_civil = models.CharField(max_length=30, default='SOLTERO')
    domicilio = models.TextField(blank=True, null=True)
    telefono = models.CharField(max_length=30, blank=True, null=True)
    reg_civil_oficialia = models.CharField(max_length=50, blank=True, null=True)
    reg_civil_libro = models.CharField(max_length=50, blank=True, null=True)
    reg_civil_partida = models.CharField(max_length=50, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'personas'
        verbose_name = 'Persona'
        verbose_name_plural = 'Personas'
        indexes = [
            models.Index(fields=['apellido_paterno', 'apellido_materno', 'nombres'], name='idx_personas_apellidos_nom'),
        ]

    def __str__(self):
        mat = f" {self.apellido_materno}" if self.apellido_materno else ""
        return f"{self.nombres} {self.apellido_paterno}{mat}"


class LibroSacramentalModel(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    capilla = models.ForeignKey(CapillaModel, on_delete=models.RESTRICT, related_name='libros')
    tipo_sacramento = models.CharField(
        max_length=20,
        choices=[('BAUTISMO', 'Bautismo'), ('COMUNION', 'Primera Comunión'), ('CONFIRMACION', 'Confirmación'), ('MATRIMONIO', 'Matrimonio')]
    )
    numero_libro = models.IntegerField()
    fecha_apertura = models.DateField()
    fecha_cierre = models.DateField(blank=True, null=True)
    estado = models.CharField(max_length=20, default='ABIERTO', choices=[('ABIERTO', 'Abierto'), ('CERRADO', 'Cerrado'), ('ARCHIVADO', 'Archivado')])
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'libros_sacramentales'
        verbose_name = 'Libro Sacramental'
        verbose_name_plural = 'Libros Sacramentales'
        constraints = [
            models.UniqueConstraint(fields=['capilla', 'tipo_sacramento', 'numero_libro'], name='unique_libro_por_capilla')
        ]

    def __str__(self):
        return f"Libro N° {self.numero_libro} ({self.tipo_sacramento}) - {self.capilla.nombre}"


class PartidaBaseModel(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    libro = models.ForeignKey(LibroSacramentalModel, on_delete=models.RESTRICT, related_name='partidas')
    numero_folio = models.IntegerField(help_text='Página o folio físico del libro')
    numero_partida = models.IntegerField(help_text='Número de asiento o partida en el folio')
    fecha_sacramento = models.DateField()
    sacerdote_celebrante = models.ForeignKey(PersonaModel, on_delete=models.RESTRICT, related_name='sacramentos_celebrados', null=True, blank=True)
    observaciones = models.TextField(blank=True, null=True)
    imagen_escaneada_url = models.TextField(blank=True, null=True, help_text='URL de la foto o escaneo del libro histórico')
    estado_partida = models.CharField(max_length=20, default='ACTIVA', choices=[('ACTIVA', 'Activa'), ('RECTIFICADA', 'Rectificada'), ('ANULADA', 'Anulada')])
    registrado_por = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.RESTRICT, related_name='partidas_registradas')
    modificado_por = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='partidas_modificadas')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'partidas_base'
        verbose_name = 'Partida Base'
        verbose_name_plural = 'Partidas Base'
        constraints = [
            models.UniqueConstraint(fields=['libro', 'numero_folio', 'numero_partida'], name='unique_partida_fisica')
        ]

    def __str__(self):
        return f"Folio {self.numero_folio}, Partida {self.numero_partida} (Libro {self.libro.numero_libro})"


class PartidaBautismoModel(models.Model):
    partida = models.OneToOneField(PartidaBaseModel, primary_key=True, on_delete=models.CASCADE, related_name='bautismo')
    bautizado = models.ForeignKey(PersonaModel, on_delete=models.RESTRICT, related_name='bautismos_recibidos')
    padre = models.ForeignKey(PersonaModel, on_delete=models.SET_NULL, null=True, blank=True, related_name='hijos_bautizados_padre')
    madre = models.ForeignKey(PersonaModel, on_delete=models.SET_NULL, null=True, blank=True, related_name='hijos_bautizados_madre')
    padrino = models.ForeignKey(PersonaModel, on_delete=models.SET_NULL, null=True, blank=True, related_name='ahijados_bautizo_padrino')
    madrina = models.ForeignKey(PersonaModel, on_delete=models.SET_NULL, null=True, blank=True, related_name='ahijados_bautizo_madrina')
    hijo_legitimo = models.BooleanField(default=True)

    class Meta:
        db_table = 'partidas_bautismo'
        verbose_name = 'Partida de Bautismo'
        verbose_name_plural = 'Partidas de Bautismo'


class PartidaMatrimonioModel(models.Model):
    partida = models.OneToOneField(PartidaBaseModel, primary_key=True, on_delete=models.CASCADE, related_name='matrimonio')
    novio = models.ForeignKey(PersonaModel, on_delete=models.RESTRICT, related_name='matrimonios_novio')
    novia = models.ForeignKey(PersonaModel, on_delete=models.RESTRICT, related_name='matrimonios_novia')
    testigo_1 = models.ForeignKey(PersonaModel, on_delete=models.SET_NULL, null=True, blank=True, related_name='matrimonios_testigo_1')
    testigo_2 = models.ForeignKey(PersonaModel, on_delete=models.SET_NULL, null=True, blank=True, related_name='matrimonios_testigo_2')
    padrino = models.ForeignKey(PersonaModel, on_delete=models.SET_NULL, null=True, blank=True, related_name='matrimonios_padrino')
    madrina = models.ForeignKey(PersonaModel, on_delete=models.SET_NULL, null=True, blank=True, related_name='matrimonios_madrina')
    reg_civil_oficialia = models.CharField(max_length=50, blank=True, null=True)
    reg_civil_libro = models.CharField(max_length=50, blank=True, null=True)
    reg_civil_partida = models.CharField(max_length=50, blank=True, null=True)
    reg_civil_fecha = models.DateField(blank=True, null=True)

    class Meta:
        db_table = 'partidas_matrimonio'
        verbose_name = 'Partida de Matrimonio'
        verbose_name_plural = 'Partidas de Matrimonio'


class NotaMarginalModel(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    partida_bautismo = models.ForeignKey(PartidaBautismoModel, on_delete=models.RESTRICT, related_name='notas_marginales', null=True, blank=True, help_text='Opcional si se anota sobre un bautismo externo')
    tipo_anotacion = models.CharField(
        max_length=30,
        choices=[('MATRIMONIO', 'Matrimonio'), ('CONFIRMACION', 'Confirmación'), ('ORDEN_SACERDOTAL', 'Orden Sacerdotal'), ('RECTIFICACION', 'Rectificación'), ('NULIDAD', 'Nulidad')]
    )
    partida_origen = models.ForeignKey(PartidaBaseModel, on_delete=models.SET_NULL, null=True, blank=True, related_name='notas_marginales_generadas')
    descripcion = models.TextField()
    fecha_decreto = models.DateField()
    autorizado_por = models.ForeignKey(PersonaModel, on_delete=models.RESTRICT, related_name='notas_marginales_autorizadas')
    parroquia_externa_nombre = models.CharField(max_length=150, blank=True, null=True, help_text='Si el bautismo fue realizado en otra parroquia externa')
    ciudad_externa = models.CharField(max_length=100, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'notas_marginales'
        verbose_name = 'Nota Marginal'
        verbose_name_plural = 'Notas Marginales'


class AuditoriaPartidaModel(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    partida = models.ForeignKey(PartidaBaseModel, on_delete=models.CASCADE, related_name='auditorias')
    usuario = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.RESTRICT)
    accion = models.CharField(max_length=20, choices=[('CREACION', 'Creación'), ('MODIFICACION', 'Modificación'), ('RECTIFICACION', 'Rectificación'), ('ANULACION', 'Anulación')])
    datos_anteriores = models.JSONField(blank=True, null=True)
    datos_nuevos = models.JSONField(blank=True, null=True)
    motivo_justificacion = models.TextField(blank=True, null=True)
    ip_origen = models.GenericIPAddressField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'auditoria_partidas'
        verbose_name = 'Auditoría de Partida'
        verbose_name_plural = 'Auditorías de Partidas'
