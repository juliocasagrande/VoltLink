from django.contrib import admin
from .models import Pessoa

@admin.register(Pessoa)
class PessoaAdmin(admin.ModelAdmin):
    list_display = ("nome", "email", "especialidade")
    search_fields = ("nome", "email", "especialidade")
