// components/charts/BarrasPorResponsavel.tsx
"use client"

import { useMemo } from "react"
import type { Atividade } from "@/lib/types"
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LabelList,
  Cell,
} from "recharts"

type Props = { data: Atividade[] }

// paleta pastel
const COLORS = [
  "#A5C8E1", "#F7C8B4", "#C8E6C9", "#FFD9A8", "#D7C6E9",
  "#BEE3F8", "#FFE0E0", "#D1FAE5", "#FDE68A", "#E9D5FF",
  "#C7D2FE", "#FBCFE8", "#BBF7D0", "#FDE2E4", "#E0E7FF",
]

// (opcional) corta nomes muito longos visualmente; tooltip mostra completo
function clipName(name: string, n = 18) {
  return name.length > n ? name.slice(0, n - 1) + "…" : name
}

export default function BarrasPorResponsavel({ data }: Props) {
  const counts = useMemo(() => {
    const map = new Map<string, Atividade[]>()
    for (const a of data) {
      const nomes = String(a.responsaveis || "")
        .split(";")
        .map((s) => s.trim())
        .filter(Boolean)
      if (!nomes.length) {
        const arr = map.get("(sem)") ?? []
        arr.push(a)
        map.set("(sem)", arr)
      } else {
        for (const nome of nomes) {
          const arr = map.get(nome) ?? []
          arr.push(a)
          map.set(nome, arr)
        }
      }
    }

    return Array.from(map.entries())
      .map(([name, items]) => ({
        name,
        value: items.length,
        items,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 15)
  }, [data])

  return (
    <div className="card-glass h-full p-3">
      <div className="section-header mb-2 font-medium">Tarefas por Responsável</div>

      <ResponsiveContainer width="100%" height="88%">
        <BarChart
          data={counts}
          layout="vertical" // barras horizontais
          margin={{ top: 8, right: 16, bottom: 8, left: 8 }}
          barCategoryGap={8}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />

          {/* Sem eixo X (numérico) */}
          <XAxis type="number" hide />

          {/* Área reservada pros nomes à esquerda */}
          <YAxis
            type="category"
            dataKey="name"
            width={140}                 // espaço fixo para os nomes
            axisLine={false}
            tickLine={false}
            tickMargin={6}
            tick={({ x, y, payload, ...rest }) => (
              <text
                x={x}
                y={y}
                dy={4}
                textAnchor="start"
                className="fill-slate-700"
                {...rest}
              >
                {clipName(String(payload.value))}
              </text>
            )}
          />

          <Tooltip
            cursor={{ fill: "rgba(0,0,0,0.04)" }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null
              const p = payload[0].payload
              const nome = p.name
              const items: Atividade[] = p.items ?? []

              return (
                <div className="card-glass p-3 ml-2 text-lg max-w-[320px]">
                  <div className="font-medium mb-1">
                    {nome}: {items.length} atividade{items.length > 1 ? "s" : ""}
                  </div>
                  <ul className="list-disc pl-4">
                    {items.slice(0, 10).map((a: Atividade) => (
                      <li key={a.id}>{a.demanda}</li>
                    ))}
                    {items.length > 10 && <li>…</li>}
                  </ul>
                </div>
              )
            }}
          />

          <Bar dataKey="value" radius={[4, 4, 4, 4]}>
            {/* Cor pastel por barra */}
            {counts.map((_, i) => (
              <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
            ))}
            {/* Rótulo numérico no fim da barra */}
            <LabelList
              dataKey="value"
              position="right"
              className="fill-slate-800"
              formatter={(v: number) => `${v}`}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
