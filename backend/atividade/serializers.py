# atividade/serializers.py
from rest_framework import serializers
from .models import Atividade, Comentario

class ComentarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comentario
        fields = ["id", "atividade", "texto", "criado_em"]
        read_only_fields = ["id", "criado_em"]

class AtividadeSerializer(serializers.ModelSerializer):
    comentarios = ComentarioSerializer(many=True, read_only=True)
    lista_responsaveis = serializers.ReadOnlyField()

    # 👉 PADRONIZAÇÃO: exibir nome/localidade do cliente com os nomes que o front usa
    # Se o modelo Cliente tiver o campo "area_cliente", use esta linha:
    cliente_nome = serializers.CharField(source="cliente.area_cliente", read_only=True)
    # Se o seu modelo tiver o campo "area" (e não "area_cliente"), troque por:
    # cliente_nome = serializers.CharField(source="cliente.area", read_only=True)

    cliente_localidade = serializers.CharField(source="cliente.localidade", read_only=True)

    class Meta:
        model = Atividade
        fields = [
            "id", "demanda", "area_solicitante", "responsaveis",
            "data_solicitacao", "prazo",
            "urgencia", "importancia", "quadrante", "status",
            "observacoes",
            "cliente",               # FK (id)
            "localidade",            # se existir como campo solto na Atividade, mantenha
            "cliente_nome",          # nome da área/cliente (read-only, vem do FK)
            "cliente_localidade",    # localidade do cliente (read-only, vem do FK)
            "lista_responsaveis", "comentarios",
            "criado_em", "atualizado_em",
        ]
        read_only_fields = [
            "id", "criado_em", "atualizado_em", "lista_responsaveis", "comentarios",
            "cliente_nome", "cliente_localidade",
        ]
