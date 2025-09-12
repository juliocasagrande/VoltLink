// lib/utils/charts.ts
import type { Atividade } from "@/lib/types"

export function groupByKey<T extends Record<string, any>>(
  rows: T[],
  key: keyof T
): Record<string, T[]> {
  return rows.reduce((acc, row) => {
    const k = String(row[key] ?? "")
    acc[k] = acc[k] || []
    acc[k].push(row)
    return acc
  }, {} as Record<string, T[]>)
}

export function radialDataFromGroup(groups: Record<string, Atividade[]>) {
  return Object.entries(groups).map(([name, items]) => ({
    name,
    value: items.length,
    items,
  }))
}
