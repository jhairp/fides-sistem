from rest_framework import serializers
from django.db import transaction
from django.contrib.auth.models import Group
from apps.authentication.models import User
from apps.sacramentos.models import PersonaModel, CapillaModel


class PersonaMinimalSerializer(serializers.ModelSerializer):
    nombre_completo = serializers.SerializerMethodField()

    class Meta:
        model = PersonaModel
        fields = [
            'id', 'nombres', 'apellido_paterno', 'apellido_materno',
            'ci', 'fecha_nacimiento', 'sexo', 'telefono',
            'nombre_completo', 'tipo_persona'
        ]

    def get_nombre_completo(self, obj):
        mat = f" {obj.apellido_materno}" if obj.apellido_materno else ""
        return f"{obj.nombres} {obj.apellido_paterno}{mat}".strip()


class UserSerializer(serializers.ModelSerializer):
    persona = PersonaMinimalSerializer(read_only=True)
    role = serializers.SerializerMethodField()
    capillas = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'persona',
            'role', 'capillas', 'foto_url',
            'is_staff', 'is_superuser', 'is_active', 'date_joined'
        ]

    def get_role(self, obj):
        group = obj.groups.first()
        return group.name if group else None

    def get_capillas(self, obj):
        return [{"id": c.id, "nombre": c.nombre} for c in obj.capillas.all()]


class UserCreateUpdateSerializer(serializers.ModelSerializer):
    # Persona fields
    persona_id = serializers.UUIDField(required=False, write_only=True, allow_null=True)
    nombres = serializers.CharField(required=False, write_only=True)
    apellido_paterno = serializers.CharField(required=False, write_only=True)
    apellido_materno = serializers.CharField(required=False, write_only=True, allow_blank=True, allow_null=True)
    ci = serializers.CharField(required=False, write_only=True, allow_blank=True, allow_null=True)
    fecha_nacimiento = serializers.DateField(required=False, write_only=True, allow_null=True)
    sexo = serializers.CharField(required=False, write_only=True, allow_blank=True, allow_null=True)
    telefono = serializers.CharField(required=False, write_only=True, allow_blank=True, allow_null=True)

    role = serializers.ChoiceField(
        choices=['SUPERADMIN', 'ADMINISTRADOR', 'PARROCO', 'RECTOR', 'SACERDOTE', 'SECRETARIO', 'FELIGRES'],
        write_only=True
    )
    capillas = serializers.PrimaryKeyRelatedField(
        queryset=CapillaModel.objects.all(),
        many=True,
        required=False
    )
    password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'password', 'persona_id',
            'nombres', 'apellido_paterno', 'apellido_materno', 'ci',
            'fecha_nacimiento', 'sexo', 'telefono', 'role',
            'capillas', 'foto_url', 'is_active'
        ]

    def validate(self, attrs):
        # On creation, password is required
        if not self.instance and 'password' not in attrs:
            raise serializers.ValidationError({"password": "La contraseña es requerida para nuevos usuarios."})

        # Validate unique username
        username = attrs.get('username')
        if username:
            qs = User.objects.filter(username__iexact=username)
            if self.instance:
                qs = qs.exclude(id=self.instance.id)
            if qs.exists():
                raise serializers.ValidationError({"username": "Este nombre de usuario ya está en uso por otra cuenta."})

        # Validate unique email
        email = attrs.get('email')
        if email:
            qs = User.objects.filter(email__iexact=email)
            if self.instance:
                qs = qs.exclude(id=self.instance.id)
            if qs.exists():
                raise serializers.ValidationError({"email": "Este correo electrónico ya se encuentra registrado."})

        persona_id = attrs.get('persona_id')
        if not self.instance and not persona_id:
            if not attrs.get('nombres') or not attrs.get('apellido_paterno'):
                raise serializers.ValidationError({
                    "nombres": "Los nombres y el apellido paterno son requeridos si no se vincula a una persona existente."
                })

        role = attrs.get('role')
        if not role and self.instance:
            role = self.instance.groups.first().name if self.instance.groups.exists() else None
            
        capillas = attrs.get('capillas', [])
        if role == 'RECTOR' and capillas:
            for capilla in capillas:
                qs = User.objects.filter(groups__name='RECTOR', capillas=capilla)
                if self.instance:
                    qs = qs.exclude(id=self.instance.id)
                if qs.exists():
                    raise serializers.ValidationError({
                        "capillas": f"La capilla {capilla.nombre} ya tiene un Rector asignado. Solo puede haber uno por capilla."
                    })

        return attrs

    def create(self, validated_data):
        persona_id = validated_data.pop('persona_id', None)
        nombres = validated_data.pop('nombres', None)
        apellido_paterno = validated_data.pop('apellido_paterno', None)
        apellido_materno = validated_data.pop('apellido_materno', None)
        ci = validated_data.pop('ci', None)
        fecha_nacimiento = validated_data.pop('fecha_nacimiento', None)
        sexo = validated_data.pop('sexo', None)
        telefono = validated_data.pop('telefono', None)

        role = validated_data.pop('role')
        password = validated_data.pop('password')
        capillas = validated_data.pop('capillas', [])

        # Default profile picture location if not provided
        foto_url = validated_data.get('foto_url')
        if not foto_url:
            validated_data['foto_url'] = '/media/fotos_perfil/default.jpg'

        with transaction.atomic():
            if persona_id:
                try:
                    persona = PersonaModel.objects.get(id=persona_id)
                except PersonaModel.DoesNotExist:
                    raise serializers.ValidationError({"persona_id": "La persona especificada no existe."})
            else:
                tipo_persona = 'FIEL'
                if role == 'SACERDOTE':
                    tipo_persona = 'SACERDOTE'

                persona = PersonaModel.objects.create(
                    nombres=nombres.upper(),
                    apellido_paterno=apellido_paterno.upper(),
                    apellido_materno=apellido_materno.upper() if apellido_materno else None,
                    ci=ci,
                    fecha_nacimiento=fecha_nacimiento,
                    sexo=sexo,
                    telefono=telefono,
                    tipo_persona=tipo_persona
                )

            # Create User
            try:
                user = User.objects.create(
                    persona=persona,
                    **validated_data
                )
            except Exception as e:
                err_str = str(e).lower()
                if 'username' in err_str:
                    raise serializers.ValidationError({"username": "Este nombre de usuario ya está registrado."})
                if 'email' in err_str:
                    raise serializers.ValidationError({"email": "Este correo electrónico ya está registrado."})
                raise serializers.ValidationError({"detail": f"Error al crear el usuario: {str(e)}"})

            user.set_password(password)

            if capillas:
                user.capillas.set(capillas)

            # Set roles/groups
            group, _ = Group.objects.get_or_create(name=role)
            user.groups.add(group)

            # If role is SUPERADMIN or ADMINISTRADOR, grant staff/superuser status
            if role in ['SUPERADMIN', 'ADMINISTRADOR']:
                user.is_staff = True
                if role == 'SUPERADMIN':
                    user.is_superuser = True
            user.save()

            return user

    def update(self, instance, validated_data):
        persona_id = validated_data.pop('persona_id', None)
        nombres = validated_data.pop('nombres', None)
        apellido_paterno = validated_data.pop('apellido_paterno', None)
        apellido_materno = validated_data.pop('apellido_materno', None)
        ci = validated_data.pop('ci', None)
        fecha_nacimiento = validated_data.pop('fecha_nacimiento', None)
        sexo = validated_data.pop('sexo', None)
        telefono = validated_data.pop('telefono', None)

        role = validated_data.pop('role', None)
        password = validated_data.pop('password', None)
        capillas = validated_data.pop('capillas', None)

        with transaction.atomic():
            if persona_id:
                try:
                    persona = PersonaModel.objects.get(id=persona_id)
                    instance.persona = persona
                except PersonaModel.DoesNotExist:
                    raise serializers.ValidationError({"persona_id": "La persona especificada no existe."})
            elif instance.persona:
                persona = instance.persona
                if nombres:
                    persona.nombres = nombres.upper()
                if apellido_paterno:
                    persona.apellido_paterno = apellido_paterno.upper()
                if apellido_materno is not None:
                    persona.apellido_materno = apellido_materno.upper() if apellido_materno else None
                if ci is not None:
                    persona.ci = ci
                if fecha_nacimiento is not None:
                    persona.fecha_nacimiento = fecha_nacimiento
                if sexo is not None:
                    persona.sexo = sexo
                if telefono is not None:
                    persona.telefono = telefono

                if role == 'SACERDOTE':
                    persona.tipo_persona = 'SACERDOTE'
                persona.save()

            # Update User fields
            for attr, value in validated_data.items():
                setattr(instance, attr, value)

            if capillas is not None:
                instance.capillas.set(capillas)

            if password:
                instance.set_password(password)

            if role:
                instance.groups.clear()
                group, _ = Group.objects.get_or_create(name=role)
                instance.groups.add(group)
                if role in ['SUPERADMIN', 'ADMINISTRADOR']:
                    instance.is_staff = True
                    if role == 'SUPERADMIN':
                        instance.is_superuser = True
                else:
                    instance.is_staff = False
                    instance.is_superuser = False

            instance.save()
            return instance
