from rest_framework import serializers

class PermissionSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    name = serializers.CharField(max_length=255)
    codename = serializers.CharField(max_length=100)

class RolSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    codigo = serializers.CharField(max_length=30)
    nombre = serializers.CharField(max_length=50)
    descripcion = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    permiso_ids = serializers.ListField(
        child=serializers.IntegerField(), required=False, allow_null=True
    )
