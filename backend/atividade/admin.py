from django.contrib import admin
from .models import Atividade, Comentario

@admin.register(Atividade)
class AtividadeAdmin(admin.ModelAdmin):
    list_display = ("demanda", "area_solicitante","localidade", "urgencia", "importancia", "quadrante", "prazo", "status", "criado_em")
    list_filter = ("urgencia", "importancia", "quadrante", "status", "area_solicitante")
    search_fields = ("demanda", "responsaveis", "observacoes", "area_solicitante")
    date_hierarchy = "prazo"

@admin.register(Comentario)
class ComentarioAdmin(admin.ModelAdmin):
    list_display = ("atividade", "texto", "criado_em")
    search_fields = ("texto",)
