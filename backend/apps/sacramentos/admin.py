from django.contrib import admin
from .models import (
    ParroquiaModel,
    CapillaModel,
    PersonaModel,
    LibroSacramentalModel,
    PartidaBaseModel,
    PartidaBautismoModel,
    PartidaMatrimonioModel,
    NotaMarginalModel,
    AuditoriaPartidaModel,
)


@admin.register(ParroquiaModel)
class ParroquiaAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'diocesis', 'telefono', 'estado', 'created_at')
    search_fields = ('nombre', 'diocesis')
    list_filter = ('estado',)


@admin.register(CapillaModel)
class CapillaAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'parroquia', 'es_sede_principal', 'ciudad', 'capacidad_personas', 'estado')
    search_fields = ('nombre', 'parroquia__nombre', 'ciudad')
    list_filter = ('es_sede_principal', 'estado', 'parroquia')


@admin.register(PersonaModel)
class PersonaAdmin(admin.ModelAdmin):
    list_display = ('nombres', 'apellido_paterno', 'apellido_materno', 'ci', 'fecha_nacimiento', 'sexo')
    search_fields = ('nombres', 'apellido_paterno', 'apellido_materno', 'ci')
    list_filter = ('sexo', 'estado_civil')


@admin.register(LibroSacramentalModel)
class LibroSacramentalAdmin(admin.ModelAdmin):
    list_display = ('numero_libro', 'tipo_sacramento', 'capilla', 'fecha_apertura', 'estado')
    search_fields = ('numero_libro', 'capilla__nombre')
    list_filter = ('tipo_sacramento', 'estado', 'capilla')


class PartidaBautismoInline(admin.StackedInline):
    model = PartidaBautismoModel
    extra = 0


class PartidaMatrimonioInline(admin.StackedInline):
    model = PartidaMatrimonioModel
    extra = 0


class NotaMarginalInline(admin.TabularInline):
    model = NotaMarginalModel
    fk_name = 'partida_bautismo'
    extra = 0


@admin.register(PartidaBaseModel)
class PartidaBaseAdmin(admin.ModelAdmin):
    list_display = ('id', 'libro', 'numero_folio', 'numero_partida', 'fecha_sacramento', 'sacerdote_celebrante', 'estado_partida')
    search_fields = ('numero_folio', 'numero_partida', 'libro__numero_libro')
    list_filter = ('estado_partida', 'libro__tipo_sacramento', 'libro__capilla')
    inlines = [PartidaBautismoInline, PartidaMatrimonioInline]


@admin.register(PartidaBautismoModel)
class PartidaBautismoAdmin(admin.ModelAdmin):
    list_display = ('partida', 'bautizado', 'padre', 'madre', 'padrino', 'madrina')
    search_fields = ('bautizado__nombres', 'bautizado__apellido_paterno', 'bautizado__ci')
    inlines = [NotaMarginalInline]


@admin.register(PartidaMatrimonioModel)
class PartidaMatrimonioAdmin(admin.ModelAdmin):
    list_display = ('partida', 'novio', 'novia', 'testigo_1', 'testigo_2')
    search_fields = ('novio__nombres', 'novia__nombres', 'novio__apellido_paterno', 'novia__apellido_paterno')


@admin.register(NotaMarginalModel)
class NotaMarginalAdmin(admin.ModelAdmin):
    list_display = ('tipo_anotacion', 'partida_bautismo', 'fecha_decreto', 'autorizado_por', 'parroquia_externa_nombre')
    search_fields = ('descripcion', 'autorizado_por__nombres', 'parroquia_externa_nombre')
    list_filter = ('tipo_anotacion',)


@admin.register(AuditoriaPartidaModel)
class AuditoriaPartidaAdmin(admin.ModelAdmin):
    list_display = ('partida', 'usuario', 'accion', 'ip_origen', 'created_at')
    search_fields = ('partida__id', 'usuario__username', 'motivo_justificacion')
    list_filter = ('accion', 'created_at')
    readonly_fields = ('partida', 'usuario', 'accion', 'datos_anteriores', 'datos_nuevos', 'motivo_justificacion', 'ip_origen', 'created_at')
