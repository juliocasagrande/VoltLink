"use client"

import React, { useMemo } from "react"
import ReactECharts from "echarts-for-react"
import type { Atividade } from "@/lib/types"

// Cores
const C_Q1 = "rgba(220, 38, 38, 0.95)"
const C_Q2 = "rgba(245, 158, 11, 0.95)"
const C_Q3 = "rgba(37, 99, 235, 0.95)"
const C_Q4 = "rgba(6, 182, 212, 0.95)"

type Props = {
  data: Atividade[]
  title?: string
  apenasAbertas?: boolean
}

/** Escala visual: comprime extremos preservando percepção de “quem tem mais”.
 *  Mantém um range agradável (30..100) para as áreas renderizadas.
 */
function scaleForVisual(v: number, vmax: number) {
  if (!vmax) return 30
  const s = Math.sqrt(v / vmax) // 0..1 (suave)
  return Math.max(5, Math.round(30 + s * 70)) // 30..100 (com piso)
  // (se preferir log, troque por:)
  // const s = Math.log(1 + v) / Math.log(1 + vmax)
  // return Math.max(5, Math.round(30 + s * 70))
}

export default function NightingaleQuadrante({
  data,
  title = "Quadrantes",
  apenasAbertas = false,
}: Props) {
  const seriesData = useMemo(() => {
    const base = apenasAbertas ? data.filter(a => a.status !== "Concluído") : data

    // Agrupar por quadrante
    const buckets = new Map<string, Atividade[]>()
    for (const a of base) {
      const q = (a.quadrante || "Q4").toString()
      const arr = buckets.get(q) ?? []
      arr.push(a)
      buckets.set(q, arr)
    }

    // Ordem fixa (cores)
    const order: Array<["Q1" | "Q2" | "Q3" | "Q4", string]> = [
      ["Q1", C_Q1],
      ["Q2", C_Q2],
      ["Q3", C_Q3],
      ["Q4", C_Q4],
    ]

    // Valores reais
    const raw = order
      .map(([q, color]) => {
        const itens = buckets.get(q) ?? []
        return {
          name: q,
          valueRaw: itens.length,                 // <- valor real preservado
          itemStyle: { color, borderRadius: 8 },
          _items: itens,
        }
      })
      .filter(d => d.valueRaw > 0)

    const vmax = raw.reduce((m, d) => Math.max(m, d.valueRaw), 0)

    // Valor renderizado (escalado)
    const scaled = raw.map(d => ({
      ...d,
      value: scaleForVisual(d.valueRaw, vmax),   // <- valor para o gráfico
    }))

    return scaled
  }, [data, apenasAbertas])

  const option = useMemo(
    () => ({
      legend: { show: false },
      toolbox: {
        show: true,
        feature: {
          mark: { show: true },
          dataView: { show: true, readOnly: false },
          restore: { show: true },
          saveAsImage: { show: true },
        },
      },
      tooltip: {
        appendTo: "body",
        confine: false,
        trigger: "item",
        extraCssText: "max-width:360px",
        formatter: (p: any) => {
          const node = p.data
          const real = node?.valueRaw ?? p.value // <- mostra o real
          const items = (node?._items ?? []) as Atividade[]
          if (!items.length) return `<b>${p.name}</b>: ${real}`
          const lis = items.slice(0, 12).map((a: Atividade) => `<li>${a.demanda ?? "—"}</li>`).join("")
          const extra = items.length > 12 ? "<li>…</li>" : ""
          return `
            <div>
              <div style="font-weight:600;margin-bottom:4px">${p.name}: ${real}</div>
              <ul style="margin:0;padding-left:16px">${lis}${extra}</ul>
            </div>
          `
        },
      },
      series: [
        {
          name: "Nightingale Chart",
          type: "pie",
          roseType: "area",
          radius: ["48%", "80%"],     // anel mais estável
          center: ["50%", "54%"],     // espaço para toolbox
          minAngle: 8,                // evita fatias minúsculas
          padAngle: 1,                // separa as fatias
          avoidLabelOverlap: true,
          label: { show: false },
          data: seriesData,
        },
      ],
    }),
    [seriesData]
  )

  return (
    <div className="card-glass h-full p-3 flex flex-col">
      <div className="section-header mb-2 font-medium">{title}</div>
      <div className="flex-1 min-h-0">
        <ReactECharts option={option} style={{ width: "100%", height: "100%" }} notMerge lazyUpdate />
      </div>

      {/* Legenda simplificada (fora do gráfico, estável) */}
      <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm leading-tight">
        <span className="inline-flex items-center gap-1">
          <i className="inline-block h-3 w-3 rounded-sm" style={{ background: C_Q1 }} />
          Q1 <span className="text-gray-500">(Fazer já)</span>
        </span>
        <span className="inline-flex items-center gap-1">
          <i className="inline-block h-3 w-3 rounded-sm" style={{ background: C_Q2 }} />
          Q2 <span className="text-gray-500">(Planejar)</span>
        </span>
        <span className="inline-flex items-center gap-1">
          <i className="inline-block h-3 w-3 rounded-sm" style={{ background: C_Q3 }} />
          Q3 <span className="text-gray-500">(Delegar)</span>
        </span>
        <span className="inline-flex items-center gap-1">
          <i className="inline-block h-3 w-3 rounded-sm" style={{ background: C_Q4 }} />
          Q4 <span className="text-gray-500">(Eliminar)</span>
        </span>
      </div>
    </div>
  )
}