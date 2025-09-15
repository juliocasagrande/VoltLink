# atividade/views.py
from rest_framework import viewsets, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import Atividade, Comentario
from .serializers import AtividadeSerializer, ComentarioSerializer
from .filters import AtividadeFilter

class AtividadeViewSet(viewsets.ModelViewSet):
    queryset = Atividade.objects.select_related("cliente").all()
    serializer_class = AtividadeSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = AtividadeFilter
    search_fields = ["demanda", "responsaveis", "observacoes", "area_solicitante", "cliente__area"]
    ordering_fields = [
        "demanda",
        "area_solicitante",
        "localidade",
        "responsaveis",
        "prazo",
        "urgencia",
        "importancia",
        "quadrante",
        "status",
        "id",
    ]
    ordering = ["-prazo"]

class ComentarioViewSet(viewsets.ModelViewSet):
    queryset = Comentario.objects.select_related("atividade").all()
    serializer_class = ComentarioSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["atividade"]
    search_fields = ["texto"]
    ordering_fields = ["criado_em"]
    ordering = ["-criado_em"]