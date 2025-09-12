// frontend/hooks/useInfiniteClientes.ts
import { useInfiniteQuery } from "@tanstack/react-query"
import api from "@/lib/axios"
import type { PageResp, Cliente } from "@/lib/types"

export type ClientesFilter = {
  q?: string
  localidade?: string
}

function buildQuery(p: number, f: ClientesFilter) {
  const sp = new URLSearchParams()
  sp.set("page", String(p))
  sp.set("page_size", "20")
  if (f.q) sp.set("search", f.q)
  if (f.localidade) sp.set("localidade", f.localidade)
  return sp
}

export function useInfiniteClientes(filters: ClientesFilter) {
  return useInfiniteQuery({
    queryKey: ["clientes", filters],
    queryFn: async ({ pageParam = 1, signal }) => {
      const { data } = await api.get<PageResp<Cliente>>("/clientes/", {
        signal,
        params: {
          page: pageParam,
          page_size: 20,
          ...(filters.q ? { search: filters.q } : {}),
          ...(filters.localidade ? { localidade: filters.localidade } : {}),
        },
      })
      return data
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (!lastPage.next) return undefined
      const u = new URL(lastPage.next)
      const p = u.searchParams.get("page")
      return p ? Number(p) : undefined
    },
  })
}