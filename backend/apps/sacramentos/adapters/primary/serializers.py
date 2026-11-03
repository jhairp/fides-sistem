from rest_framework import serializers
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


class ParroquiaSerializer(serializers.ModelSerializer):
    class Meta:
        model = ParroquiaModel
        fields = '__all__'


class CapillaSerializer(serializers.ModelSerializer):
    parroquia_nombre = serializers.ReadOnlyField(source='parroquia.nombre')

    class Meta:
        model = CapillaModel
        fields = '__all__'


class PersonaSerializer(serializers.ModelSerializer):
    nombre_completo = serializers.SerializerMethodField()

    class Meta:
        model = PersonaModel
        fields = '__all__'

    def get_nombre_completo(self, obj):
        mat = f" {obj.apellido_materno}" if obj.apellido_materno else ""
        return f"{obj.nombres} {obj.apellido_paterno}{mat}".strip()


class LibroSacramentalSerializer(serializers.ModelSerializer):
    capilla_nombre = serializers.ReadOnlyField(source='capilla.nombre')

    class Meta:
        model = LibroSacramentalModel
        fields = '__all__'


class PartidaBaseSerializer(serializers.ModelSerializer):
    sacerdote_nombre = serializers.SerializerMethodField()
    libro_numero = serializers.ReadOnlyField(source='libro.numero_libro')
    tipo_sacramento = serializers.ReadOnlyField(source='libro.tipo_sacramento')
    capilla_nombre = serializers.ReadOnlyField(source='libro.capilla.nombre')

    class Meta:
        model = PartidaBaseModel
        fields = '__all__'

    def get_sacerdote_nombre(self, obj):
        return str(obj.sacerdote_celebrante) if obj.sacerdote_celebrante else None


class BusquedaSacramentoListSerializer(serializers.ModelSerializer):
    partida_id = serializers.UUIDField(source='id', read_only=True)
    tipo_sacramento = serializers.SerializerMethodField()
    numero_libro = serializers.ReadOnlyField(source='libro.numero_libro')
    capilla_nombre = serializers.ReadOnlyField(source='libro.capilla.nombre')
    capilla_id = serializers.ReadOnlyField(source='libro.capilla.id')
    sacerdote_nombre = serializers.SerializerMethodField()
    titular_principal = serializers.SerializerMethodField()
    titular_ci = serializers.SerializerMethodField()
    titular_secundario = serializers.SerializerMethodField()

    class Meta:
        model = PartidaBaseModel
        fields = [
            'id',
            'partida_id',
            'tipo_sacramento',
            'numero_libro',
            'numero_folio',
            'numero_partida',
            'fecha_sacramento',
            'capilla_nombre',
            'capilla_id',
            'sacerdote_nombre',
            'titular_principal',
            'titular_ci',
            'titular_secundario',
            'estado_partida',
            'observaciones',
        ]

    def get_tipo_sacramento(self, obj):
        if obj.libro:
            return obj.libro.tipo_sacramento
        return 'DESCONOCIDO'

    def get_sacerdote_nombre(self, obj):
        return str(obj.sacerdote_celebrante) if obj.sacerdote_celebrante else None

    def get_titular_principal(self, obj):
        if hasattr(obj, 'bautismo') and obj.bautismo and obj.bautismo.bautizado:
            return str(obj.bautismo.bautizado)
        if hasattr(obj, 'matrimonio') and obj.matrimonio and obj.matrimonio.novio:
            return str(obj.matrimonio.novio)
        return 'SIN TITULAR REGISTRADO'

    def get_titular_ci(self, obj):
        if hasattr(obj, 'bautismo') and obj.bautismo and obj.bautismo.bautizado:
            return obj.bautismo.bautizado.ci
        if hasattr(obj, 'matrimonio') and obj.matrimonio and obj.matrimonio.novio:
            return obj.matrimonio.novio.ci
        return None

    def get_titular_secundario(self, obj):
        if hasattr(obj, 'matrimonio') and obj.matrimonio and obj.matrimonio.novia:
            return str(obj.matrimonio.novia)
        return None


class BusquedaSacramentoDetalleSerializer(BusquedaSacramentoListSerializer):
    detalles_adicionales = serializers.SerializerMethodField()

    class Meta(BusquedaSacramentoListSerializer.Meta):
        fields = BusquedaSacramentoListSerializer.Meta.fields + ['detalles_adicionales']

    def get_detalles_adicionales(self, obj):
        if hasattr(obj, 'bautismo') and obj.bautismo:
            b = obj.bautismo
            return {
                'padre': str(b.padre) if b.padre else None,
                'madre': str(b.madre) if b.madre else None,
                'padrino': str(b.padrino) if b.padrino else None,
                'madrina': str(b.madrina) if b.madrina else None,
                'hijo_legitimo': b.hijo_legitimo,
            }
        if hasattr(obj, 'matrimonio') and obj.matrimonio:
            m = obj.matrimonio
            return {
                'novia_ci': m.novia.ci if m.novia else None,
                'padrino': str(m.padrino) if m.padrino else None,
                'madrina': str(m.madrina) if m.madrina else None,
                'testigo_1': str(m.testigo_1) if m.testigo_1 else None,
                'testigo_2': str(m.testigo_2) if m.testigo_2 else None,
                'reg_civil_oficialia': m.reg_civil_oficialia,
                'reg_civil_libro': m.reg_civil_libro,
                'reg_civil_partida': m.reg_civil_partida,
                'reg_civil_fecha': str(m.reg_civil_fecha) if m.reg_civil_fecha else None,
            }
        return {}


# Alias for backwards compatibility
BusquedaSacramentoSerializer = BusquedaSacramentoListSerializer


class PartidaBautismoSerializer(serializers.ModelSerializer):
    partida_detalle = PartidaBaseSerializer(source='partida', read_only=True)
    bautizado_detalle = PersonaSerializer(source='bautizado', read_only=True)

    class Meta:
        model = PartidaBautismoModel
        fields = '__all__'


class PartidaMatrimonioSerializer(serializers.ModelSerializer):
    partida_detalle = PartidaBaseSerializer(source='partida', read_only=True)
    novio_detalle = PersonaSerializer(source='novio', read_only=True)
    novia_detalle = PersonaSerializer(source='novia', read_only=True)

    class Meta:
        model = PartidaMatrimonioModel
        fields = '__all__'


class NotaMarginalSerializer(serializers.ModelSerializer):
    autorizado_por_nombre = serializers.SerializerMethodField()

    class Meta:
        model = NotaMarginalModel
        fields = '__all__'

    def get_autorizado_por_nombre(self, obj):
        return str(obj.autorizado_por) if obj.autorizado_por else None


class AuditoriaPartidaSerializer(serializers.ModelSerializer):
    usuario_username = serializers.ReadOnlyField(source='usuario.username')

    class Meta:
        model = AuditoriaPartidaModel
        fields = '__all__'
