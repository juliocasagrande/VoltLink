"use client"
import { useInfiniteQuery, useQuery } from "@tanstack/react-query"
import api from "@/lib/axios"
import type { Atividade, Pessoa } from "@/lib/types"

/* ------------------------------
   Tipos utilitários
------------------------------ */

// Resposta paginada padrão do DRF
type Page<T> = {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

// Filtros da listagem
export type AtivFilters = {
  urgencia?: string[] | string
  importancia?: string[] | string
  status?: string[] | string
  responsavel?: string[] | string
  search?: string
  ordering?: string | null
}

/* ------------------------------
   Helpers
------------------------------ */

function toCsv(v?: string[] | string) {
  return Array.isArray(v) ? v.filter(Boolean).join(",") : (v ?? "")
}

/** Monta params estáveis para queryKey e requisição */
function buildParams(filters: AtivFilters) {
  const params: Record<string, string> = { page_size: "20" }

  if (filters.urgencia && toCsv(filters.urgencia)) params.urgencia = toCsv(filters.urgencia)
  if (filters.importancia && toCsv(filters.importancia)) params.importancia = toCsv(filters.importancia)
  if (filters.status && toCsv(filters.status)) params.status = toCsv(filters.status)
  if (filters.responsavel && toCsv(filters.responsavel)) params.responsavel = toCsv(filters.responsavel)
  if (filters.search) params.search = filters.search
  if (filters.ordering) params.ordering = filters.ordering

  return params
}

/* ------------------------------
   Atividades (infinite)
------------------------------ */

export function useInfiniteAtividades(filters: AtivFilters) {
  const params = buildParams(filters)

  return useInfiniteQuery<Page<Atividade>, Error>({
    queryKey: ["atividades", params],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const res = await api.get<Page<Atividade>>("/atividades/", {
        params: { ...params, page: pageParam ?? 1 },
      })
      return res.data
    },
    getNextPageParam: (last) => {
      if (!last?.next) return undefined
      const p = new URL(last.next).searchParams.get("page")
      return p ? Number(p) : undefined
    },
    getPreviousPageParam: (first) => {
      if (!first?.previous) return undefined
      const p = new URL(first.previous).searchParams.get("page")
      return p ? Number(p) : undefined
    },
  })
}

/* ------------------------------
   Pessoas (lista simples)
------------------------------ */
export function usePessoas() {
  return useQuery<Pessoa[], Error>({
    queryKey: ["pessoas"],
    queryFn: async () => {
      const res = await api.get<Page<Pessoa>>("/pessoas/", { params: { page_size: 1000 } })
      return res.data?.results ?? []
    },
  })
}

/* ------------------------------
   Áreas e Localidades (para modal)
------------------------------ */
export type AreasLocs = {
  areas: string[]
  areaToLocs: Map<string, string[]>
}

export function useAreasELocalidades() {
  return useQuery<AreasLocs, Error>({
    queryKey: ["areas-localidades"],
    queryFn: async () => {
      const r = await api.get<Page<any>>("/clientes/", { params: { page_size: 1000 } })
      const results: any[] = Array.isArray(r.data?.results) ? r.data.results : []

      const aSet = new Set<string>()
      const map = new Map<string, string[]>()

      for (const c of results) {
        const area = c.area_cliente ?? c.area ?? ""
        const localidade = c.localidade ?? ""
        if (!area) continue

        aSet.add(area)
        const arr = map.get(area) ?? []
        if (localidade && !arr.includes(localidade)) arr.push(localidade)
        map.set(area, arr)
      }

      return { areas: Array.from(aSet).sort(), areaToLocs: map }
    },
  })
}