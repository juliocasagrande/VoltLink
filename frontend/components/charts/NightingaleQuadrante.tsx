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

export default function NightingaleQuadrante({
  data,
  title = "Quadrantes",
  apenasAbertas = false,
}: Props) {
  const seriesData = useMemo(() => {
    const base = apenasAbertas ? data.filter(a => a.status !== "Concluído") : data
    const buckets = new Map<string, Atividade[]>()
    for (const a of base) {
      const q = (a.quadrante || "Q4").toString()
      const arr = buckets.get(q) ?? []
      arr.push(a)
      buckets.set(q, arr)
    }
    const order: Array<["Q1" | "Q2" | "Q3" | "Q4", string]> = [
      ["Q1", C_Q1],
      ["Q2", C_Q2],
      ["Q3", C_Q3],
      ["Q4", C_Q4],
    ]
    return order
      .map(([q, color]) => {
        const itens = buckets.get(q) ?? []
        return { name: q, value: itens.length, itemStyle: { color, borderRadius: 8 }, _items: itens }
      })
      .filter(d => d.value > 0)
  }, [data, apenasAbertas])

  const option = useMemo(
    () => ({
      legend: { show: false }, // desligado
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
          const items = (node?._items ?? []) as Atividade[]
          if (!items.length) return `<b>${p.name}</b>: ${p.value}`
          const lis = items.slice(0, 12).map((a: Atividade) => `<li>${a.demanda ?? "—"}</li>`).join("")
          const extra = items.length > 12 ? "<li>…</li>" : ""
          return `
            <div>
              <div style="font-weight:600;margin-bottom:4px">${p.name}: ${p.value}</div>
              <ul style="margin:0;padding-left:16px">${lis}${extra}</ul>
            </div>
          `
        },
      },
      series: [
        {
          name: "Nightingale Chart",
          type: "pie",
          radius: ["45%", "85%"],     // um pouco menor para garantir respiro
          center: ["50%", "52%"],     // leve ajuste vertical para caber toolbox
          roseType: "area",
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
