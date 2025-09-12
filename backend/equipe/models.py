from django.db import models

class Pessoa(models.Model):
    nome = models.CharField("Nome", max_length=150)
    email = models.EmailField("E-mail", blank=True, null=True)
    especialidade = models.CharField("Especialidade", max_length=150, blank=True, null=True)

    class Meta:
        verbose_name = "Pessoa"
        verbose_name_plural = "Pessoas"
        ordering = ["nome"]

    def __str__(self):
        return self.nome
