from rest_framework import serializers

class RolSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    codigo = serializers.CharField(max_length=30)
    nombre = serializers.CharField(max_length=50)
    descripcion = serializers.CharField(required=False, allow_blank=True, allow_null=True)
