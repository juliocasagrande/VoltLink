// app/(app)/dashboard/page.tsx
"use client"

import { useMemo } from "react"
import type { Atividade } from "@/lib/types"

import { useAtividadesAll } from "@/hooks/useAtividadesAll"
import { groupByKey, radialDataFromGroup } from "@/lib/charts"
import { levelBadge, quadranteBadge } from "@/components/charts/badges"
import {
  NightingaleQuadrante,
  BarrasPorResponsavel,
  SankeyAreaLocalidade,
  SunburstImpUrg,
} from "@/components/charts"

export default function DashboardPage() {
  const { data: atividades = [] } = useAtividadesAll()

  // (mantidos se você ainda usar em algum lugar)
  const urgData = useMemo(
    () => radialDataFromGroup(groupByKey<Atividade>(atividades, "urgencia")),
    [atividades]
  )
  const impData = useMemo(
    () => radialDataFromGroup(groupByKey<Atividade>(atividades, "importancia")),
    [atividades]
  )
  const quadData = useMemo(
    () => radialDataFromGroup(groupByKey<Atividade>(atividades, "quadrante")),
    [atividades]
  )

  const abertas = useMemo(
    () => atividades.filter((a) => a.status !== "Concluído"),
    [atividades]
  )

  return (
    <div className="px-[0px] pt-[0px]">
      {/* ===== LINHA 1 (40% da viewport) ===== */}
      <div className="grid grid-cols-12 gap-3 h-[50vh] min-h-0">
        {/* ESQUERDA (7 col) */}
        <div className="col-span-7 grid grid-cols-12 gap-3 min-h-0">
          {/* Sunburst */}
          <div className="col-span-8 min-h-0">
            <div className="card-glass h-full overflow-hidden flex flex-col">
              {/* o componente já desenha header interno */}
              <div className="flex-1 min-h-0">
                {/* garanta que o gráfico use 100% da altura do card */}
                <SunburstImpUrg data={atividades} />
              </div>
            </div>
          </div>

          {/* Nightingale (Quadrante) */}
          <div className="col-span-4 min-h-0">
            <div className="card-glass h-full overflow-hidden flex flex-col">
              <div className="flex-1 min-h-0">
                <NightingaleQuadrante
                  data={atividades}
                  title="Atividades por Quadrante"
                />
              </div>
            </div>
          </div>
        </div>

        {/* DIREITA (5 col) -> Barras por Responsável */}
        <div className="col-span-5 min-h-0">
          <div className="card-glass h-full overflow-hidden flex flex-col">
            <div className="flex-1 min-h-0">
              <BarrasPorResponsavel data={atividades} />
            </div>
          </div>
        </div>
      </div>

      {/* ===== LINHA 2 (restante da viewport) ===== */}
      <div className="grid grid-cols-12 gap-3 h-[calc(39vh-15px)] mt-3 mb-[15px] min-h-0">
        {/* Sankey (5 col) */}
        <div className="col-span-5 min-h-0">
          <div className="card-glass h-full overflow-hidden p-3 flex flex-col">
            <div className="section-header mb-2 font-medium">
              Área → Localidade
            </div>
            <div className="flex-1 min-h-0">
              <SankeyAreaLocalidade data={atividades} />
            </div>
          </div>
        </div>

        {/* Tabela (7 col) */}
        <div className="col-span-7 min-h-0">
          <div className="card-glass h-full overflow-hidden p-3 flex flex-col">
            <div className="section-header mb-2 font-medium">Atividades abertas</div>

            {/* container suave: borda clara + fundo pastel */}
            <div className="flex-1 min-h-0 overflow-auto rounded-xl border border-slate-200/60 bg-white/50 shadow-sm">
              <table className="w-full text-sm text-slate-700">
                {/* cabeçalho pastel, com blur leve e sem borda pesada */}
                <thead className="sticky top-0 z-10 bg-amber-100 backdrop-blur supports-[backdrop-filter]:backdrop-blur-sm">
                  <tr className="[&>th]:px-3 [&>th]:py-2 text-left text-slate-600">
                    <th>Demanda</th>
                    <th>Prazo</th>
                    <th>Urgência</th>
                    <th>Importância</th>
                    <th>Quadrante</th>
                  </tr>
                </thead>

                {/* linhas separadas por divisória suave + hover sutil */}
                <tbody className="divide-y divide-slate-200/60">
                  {abertas.map((a) => (
                    <tr
                      key={a.id}
                      className="hover:bg-slate-50/60 transition-colors [&>td]:px-3 [&>td]:py-2 align-top"
                    >
                      <td className="max-w-[560px] text-slate-800 font-medium">
                        {a.demanda}
                      </td>
                      <td className="whitespace-nowrap">
                        {a.prazo ? new Date(a.prazo).toLocaleDateString() : "-"}
                      </td>
                      <td>{levelBadge(a.urgencia ?? undefined)}</td>
                      <td>{levelBadge(a.importancia ?? undefined)}</td>
                      <td>{quadranteBadge(a.quadrante ?? undefined)}</td>
                    </tr>
                  ))}

                  {!abertas.length && (
                    <tr>
                      <td colSpan={5} className="px-3 py-4 text-slate-500">
                        Sem itens em aberto.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
