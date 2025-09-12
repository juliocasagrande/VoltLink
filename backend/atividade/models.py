# atividade/models.py
from django.db import models
from cliente.models import Cliente 

class Urgencia(models.TextChoices):
    ALTA = "Alta", "Alta"
    MEDIA = "Média", "Média"
    BAIXA = "Baixa", "Baixa"

class Importancia(models.TextChoices):
    ALTA = "Alta", "Alta"
    MEDIA = "Média", "Média"
    BAIXA = "Baixa", "Baixa"

class Quadrante(models.TextChoices):
    Q1 = "Q1", "Q1"
    Q2 = "Q2", "Q2"
    Q3 = "Q3", "Q3"
    Q4 = "Q4", "Q4"

class Status(models.TextChoices):
    NAO_INICIADO = "Não iniciado", "Não iniciado"
    EM_ANDAMENTO = "Em andamento", "Em andamento"
    CONCLUIDO = "Concluído", "Concluído"

class Atividade(models.Model):
    demanda = models.CharField("Demanda", max_length=255)
    area_solicitante = models.CharField("Área solicitante", max_length=255, blank=True, null=True)
    responsaveis = models.TextField("Responsáveis (separar por ;)", blank=True, null=True)
    data_solicitacao = models.DateField("Data de solicitação", blank=True, null=True)
    prazo = models.DateField("Prazo", blank=True, null=True)

    urgencia = models.CharField("Urgência", max_length=10, choices=Urgencia.choices, blank=True, null=True)
    importancia = models.CharField("Importância", max_length=10, choices=Importancia.choices, blank=True, null=True)
    quadrante = models.CharField("Quadrante", max_length=2, choices=Quadrante.choices, blank=True, null=True)
    status = models.CharField("Status", max_length=20, choices=Status.choices, blank=True, null=True)
    observacoes = models.TextField("Observações", blank=True, null=True)

    # NOVOS CAMPOS
    cliente = models.ForeignKey(
        Cliente,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name="atividades",
        verbose_name="Área/Cliente",
    )
    localidade = models.CharField("Localidade", max_length=150, blank=True, null=True)

    criado_em = models.DateTimeField("Criado em", auto_now_add=True)
    atualizado_em = models.DateTimeField("Atualizado em", auto_now=True)

    class Meta:
        verbose_name = "Atividade"
        verbose_name_plural = "Atividades"
        ordering = ["-criado_em"]

    def __str__(self):
        return self.demanda or f"Atividade {self.pk}"

    @property
    def lista_responsaveis(self):
        if not self.responsaveis:
            return []
        return [r.strip() for r in self.responsaveis.split(";") if r.strip()]

class Comentario(models.Model):
    atividade = models.ForeignKey(Atividade, on_delete=models.CASCADE, related_name="comentarios", verbose_name="Atividade")
    texto = models.TextField("Comentário")
    criado_em = models.DateTimeField("Criado em", auto_now_add=True)

    class Meta:
        verbose_name = "Comentário"
        verbose_name_plural = "Comentários"
        ordering = ["-criado_em"]

    def __str__(self):
        return f"Comentário #{self.pk} - Atividade {self.atividade_id}"