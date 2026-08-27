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

    class Meta:
        model = PartidaBaseModel
        fields = '__all__'

    def get_sacerdote_nombre(self, obj):
        return str(obj.sacerdote_celebrante) if obj.sacerdote_celebrante else None


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
