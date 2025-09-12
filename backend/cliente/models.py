from django.db import models

class Cliente(models.Model):
    area = models.CharField("Área/Cliente", max_length=150)
    localidade = models.CharField("Localidade", max_length=150, blank=True, null=True)

    class Meta:
        verbose_name = "Cliente"
        verbose_name_plural = "Clientes"
        ordering = ["area"]

    def __str__(self):
        return self.area
