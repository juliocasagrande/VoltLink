"use client"
import { useInfiniteQuery, useQuery } from "@tanstack/react-query"
import api from "@/lib/axios"
import type { Atividade, Pessoa } from "@/lib/types"

// ------------------------------
// Tipos e filtros
// ------------------------------
export type AtivFilters = {
  urgencia?: string[] | string
  importancia?: string[] | string
  status?: string[] | string
  responsavel?: string[] | string
  search?: string
}

export function useInfiniteAtividades(filters: AtivFilters) {
  const params: Record<string, string> = {}

  const toCsv = (v?: string[] | string) =>
    Array.isArray(v) ? v.filter(Boolean).join(",") : (v ?? "")

  if (filters.urgencia && toCsv(filters.urgencia))     params.urgencia = toCsv(filters.urgencia)
  if (filters.importancia && toCsv(filters.importancia)) params.importancia = toCsv(filters.importancia)
  if (filters.status && toCsv(filters.status))         params.status = toCsv(filters.status)
  if (filters.responsavel && toCsv(filters.responsavel)) params.responsavel = toCsv(filters.responsavel)
  if (filters.search) params.search = filters.search

  params.page_size = "1000"

  return useInfiniteQuery({
    queryKey: ["atividades", params],   // muda quando filtros mudam (CSV estável)
    queryFn: async ({ pageParam }) => {
      const res = await api.get("/atividades/", { params: { ...params, page: pageParam ?? 1 } })
      return res.data
    },
    initialPageParam: 1 as number,
    getNextPageParam: (lastPage, all) =>
      lastPage.next ? all.length + 1 : undefined,
  })
}

// ------------------------------
// Pessoas (lista simples)
// ------------------------------
export function usePessoas() {
  return useQuery<Pessoa[]>({
    queryKey: ["pessoas"],
    queryFn: async () => {
      const res = await api.get("/pessoas/?page_size=1000")
      return (res.data?.results ?? []) as Pessoa[]
    },
  })
}

// ------------------------------
// Áreas e Localidades para o modal
// (consulta /clientes/ e deriva estruturas)
// ------------------------------
export type AreasLocs = {
  areas: string[]
  areaToLocs: Map<string, string[]>
}

export function useAreasELocalidades() {
  return useQuery<AreasLocs>({
    queryKey: ["areas-localidades"],
    queryFn: async () => {
      const r = await api.get("/clientes/", { params: { page_size: 1000 } })
      const results: any[] = Array.isArray(r.data?.results) ? r.data.results : []

      // Alguns projetos usam "area_cliente", outros "area" — cobrimos ambos
      const aSet = new Set<string>()
      const map = new Map<string, string[]>()

      for (const c of results) {
        const area =
          c.area_cliente ?? c.area ?? "" // <- tente os dois nomes
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