"use client"

import React, { useMemo } from "react"
import ReactECharts from "echarts-for-react"
import type { Atividade } from "@/lib/types"

// Paleta: Alto (vermelho), Médio (âmbar), Baixo (azul)
const C_ALTA = "#dc2626"
const C_MEDIA = "#f59e0b"
const C_BAIXA = "#0284c7"
const corPorNivel = (nivel?: string) =>
  nivel === "Alta" ? C_ALTA : nivel === "Média" ? C_MEDIA : C_BAIXA

type Node = {
  name: string
  value?: number
  itemStyle?: { color?: string; borderRadius?: number; borderWidth?: number }
  children?: Node[]
  _items?: Atividade[]
}

function buildTree(ativs: Atividade[]): Node[] {
  const IMPORTANCIAS = ["Alta", "Média", "Baixa"]
  const URGENCIAS = ["Alta", "Média", "Baixa"]

  const mapa = new Map<string, Map<string, Atividade[]>>()
  for (const a of ativs) {
    const imp = (a.importancia ?? "Baixa") as string
    const urg = (a.urgencia ?? "Baixa") as string
    const m = mapa.get(imp) ?? new Map<string, Atividade[]>()
    const arr = m.get(urg) ?? []
    arr.push(a); m.set(urg, arr); mapa.set(imp, m)
  }

  const data: Node[] = IMPORTANCIAS.map((imp) => {
    const m = mapa.get(imp) ?? new Map<string, Atividade[]>()
    const children: Node[] = URGENCIAS.map((urg) => {
      const items = m.get(urg) ?? []
      return { name: `Urg. ${urg}`, value: items.length, itemStyle: { color: corPorNivel(urg) }, _items: items }
    }).filter(n => (n.value ?? 0) > 0)
    const total = children.reduce((s, c) => s + (c.value || 0), 0)
    return { name: `Imp. ${imp}`, value: total, itemStyle: { color: corPorNivel(imp) }, children }
  }).filter(n => (n.value ?? 0) > 0)

  return data
}

export default function SunburstImpUrg({ data }: { data: Atividade[] }) {
  const tree = useMemo(() => buildTree(data), [data])

  const option = useMemo(() => ({
    legend: { show: false }, // desligado
    tooltip: {
      appendTo: "body",
      confine: false,
      trigger: "item",
      formatter: (p: any) => {
        const node: Node = p.data
        const path = p.treePathInfo?.slice(1)?.map((t: any) => t.name)?.join(" / ")
        if (node._items?.length) {
          const lis = node._items.slice(0, 12).map((a) => `<li>${(a as any).demanda || "—"}</li>`).join("")
          const extra = node._items.length > 12 ? "<li>…</li>" : ""
          return `<div style="max-width:320px">
            <div style="font-weight:600;margin-bottom:4px">${path} — ${p.value}</div>
            <ul style="padding-left:16px;margin:0">${lis}${extra}</ul>
          </div>`
        }
        return `<div style="font-weight:600">${path}: ${p.value}</div>`
      },
    },
    series: [
      {
        type: "sunburst",
        data: tree,
        radius: [60, "82%"],   // menor para não encostar nos cantos do card
        center: ["50%", "52%"],
        sort: undefined,
        itemStyle: { borderRadius: 6, borderWidth: 2 },
        label: { show: true }, // rótulos curtos cabem; desligue se quiser ainda mais respiro
        levels: [
          {},
          { r0: 60, r: "55%", label: { rotate: 0, show: true, color: "#111", fontWeight: 600 } },
          { r0: "55%", r: "82%", label: { show: true } },
        ],
      },
    ],
  }), [tree])

  return (
    <div className="card-glass h-full p-3 flex flex-col">
      <div className="section-header mb-2 font-medium">Importância × Urgência</div>
      <div className="flex-1 min-h-0">
        <ReactECharts option={option} style={{ width: "100%", height: "100%" }} notMerge lazyUpdate />
      </div>
      {/* legenda manual removida */}
    </div>
  )
}
