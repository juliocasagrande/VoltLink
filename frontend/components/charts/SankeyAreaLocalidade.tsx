// components/charts/SankeyAreaLocalidade.tsx
"use client"

import React, { useMemo } from "react"
import ReactECharts from "echarts-for-react"
import type { Atividade } from "@/lib/types"

type Props = { data: Atividade[]; apenasAbertas?: boolean }

// Prefixos para manter nomes únicos entre níveis
const A = (s: string) => `A|${s}` // Área
const L = (s: string) => `L|${s}` // Localidade
const unprefix = (s: string) => s.replace(/^[AL]\|/, "")

// Paletas pastel (duas famílias diferentes para diferenciar níveis)
const AREA_COLORS = [
  "#10B981", "#F59E0B", "#60A5FA", "#EF4444", "#8B5CF6",
  "#14B8A6", "#F472B6", "#84CC16", "#F97316", "#06B6D4",
]
const LOC_COLORS = [
  "#6EE7B7", "#FCD34D", "#93C5FD", "#FCA5A5", "#C4B5FD",
  "#5EEAD4", "#F9A8D4", "#A3E635", "#FDBA74", "#67E8F9",
]

// util: cor estável por nome
function colorFrom(name: string, palette: string[]) {
  // hash simples para distribuir nos índices
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0
  return palette[h % palette.length]
}

export default function SankeyAreaLocalidade({ data, apenasAbertas = false }: Props) {
  const { nodes, links } = useMemo(() => {
    const base = apenasAbertas
      ? data.filter((a) => (a.status ?? "") !== "Concluído")
      : data

    // ✅ corrige o erro de TS: parâmetro "talvez indefinido"
    const norm = (s: string | null | undefined, fallback: string) =>
      (s ?? "").toString().trim() || fallback

    const areasSet = new Set<string>()
    const locsSet = new Set<string>()
    const pair = new Map<string, Atividade[]>() // key = area||loc

    for (const a of base) {
      const area = norm(a.area_solicitante, "Sem área")
      const loc = norm(a.localidade, "Sem localidade")
      areasSet.add(area)
      locsSet.add(loc)
      const k = `${area}||${loc}`
      const arr = pair.get(k) ?? []
      arr.push(a)
      pair.set(k, arr)
    }

    const areas = Array.from(areasSet)
    const locs = Array.from(locsSet)

    const nodes = [
      ...areas.map((name) => ({
        name: A(name),
        _label: name,
        _level: 1,
        _color: colorFrom(name, AREA_COLORS),
      })),
      ...locs.map((name) => ({
        name: L(name),
        _label: name,
        _level: 2,
        _color: colorFrom(name, LOC_COLORS),
      })),
    ]

    const links = Array.from(pair.entries()).map(([k, items]) => {
      const [area, loc] = k.split("||")
      return {
        source: A(area),
        target: L(loc),
        value: items.length,
        _items: items,
      }
    })

    return { nodes, links }
  }, [data, apenasAbertas])

  const option = useMemo(
    () => ({
      tooltip: {
        appendTo: "body",
        confine: false,
        trigger: "item",
        extraCssText: "max-width:360px",
        formatter: (p: any) => {
          if (p.dataType === "edge") {
            const items: Atividade[] = p.data._items ?? []
            const src = unprefix(p.data.source)
            const tgt = unprefix(p.data.target)
            const lis = items
              .slice(0, 12)
              .map((a) => `<li>${a.demanda ?? "—"}</li>`)
              .join("")
            const extra = items.length > 12 ? "<li>…</li>" : ""
            return `
              <div>
                <div style="font-weight:600;margin-bottom:4px">
                  ${src} → ${tgt}: ${p.data.value}
                </div>
                <ul style="margin:0;padding-left:16px">${lis}${extra}</ul>
              </div>
            `
          }
          if (p.dataType === "node") {
            return `<b>${unprefix(p.name)}</b>`
          }
          return ""
        },
      },
      series: [
        {
          type: "sankey",
          layout: "none",
          orient: "horizontal",
          nodeAlign: "left", // Áreas à esquerda
          emphasis: { focus: "adjacency" },
          // 👉 dá espaço para os rótulos ficarem fora dos nós
          left: 140,
          right: 140,
          top: 10,
          bottom: 10,
          nodeWidth: 14,
          nodeGap: 18,
          draggable: false,
          label: {
            color: "#0f172a",
            fontSize: 12,
            // estas props evitam corte e deixam elegante
            overflow: "truncate",
            width: 120,
          },
          data: nodes.map((n) => ({
            name: n.name,
            itemStyle: { color: n._color },
            label: {
              formatter: unprefix(n.name),
              position: n._level === 1 ? "left" : "right",
              align: n._level === 1 ? "right" : "left",
            },
          })),
          links: links.map((l) => ({
            source: l.source,
            target: l.target,
            value: l.value,
            // links neutros (cinza claro), destacando somente os nós
            lineStyle: { color: "#e5e7eb", opacity: 0.8, curveness: 0.5 },
            _items: l._items,
          })),
        },
      ],
    }),
    [nodes, links]
  )

  return (
    <div className="h-full">
      <ReactECharts option={option} notMerge lazyUpdate style={{ width: "100%", height: "100%" }} />
    </div>
  )
}
