import django_filters as df
from .models import Atividade

class CSVInFilter(df.BaseInFilter, df.CharFilter):
    pass

class AtividadeFilter(df.FilterSet):
    # múltipla seleção via CSV: ?urgencia=Alta,Média
    urgencia = CSVInFilter(field_name="urgencia", lookup_expr="in")
    importancia = CSVInFilter(field_name="importancia", lookup_expr="in")
    status = CSVInFilter(field_name="status", lookup_expr="in")

    # filtra por responsável(s) no campo de texto 'responsaveis' (separados por ;)
    responsavel = CSVInFilter(method="filter_responsavel")

    def filter_responsavel(self, queryset, name, value_list):
        # value_list é uma lista de strings (responsáveis)
        for v in value_list:
            v = (v or "").strip()
            if v:
                queryset = queryset.filter(responsaveis__icontains=v)
        return queryset

    class Meta:
        model = Atividade
        fields = ["urgencia", "importancia", "status", "responsavel", "quadrante", "cliente", "localidade"]