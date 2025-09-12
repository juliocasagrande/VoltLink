// components/badges.tsx
"use client"

export function levelBadge(level?: string) {
  const base =
    "inline-flex items-center rounded px-2 py-0.5 text-xs font-medium text-white"
  if (level === "Alta") return <span className={`${base} bg-rose-600`}>Alta</span>
  if (level === "Média") return <span className={`${base} bg-amber-500`}>Média</span>
  if (level === "Baixa") return <span className={`${base} bg-sky-600`}>Baixa</span>
  return <span className={`${base} bg-slate-400`}>{level ?? "-"}</span>
}

export function quadranteBadge(q?: string) {
  const base =
    "inline-flex items-center rounded px-2 py-0.5 text-xs font-medium text-white"
  switch (q) {
    case "Q1": return <span className={`${base} bg-rose-600`}>Q1</span>
    case "Q2": return <span className={`${base} bg-amber-500`}>Q2</span>
    case "Q3": return <span className={`${base} bg-sky-600`}>Q3</span>
    case "Q4": return <span className={`${base} bg-cyan-600`}>Q4</span>
    default:   return <span className={`${base} bg-slate-400`}>{q ?? "-"}</span>
  }
}