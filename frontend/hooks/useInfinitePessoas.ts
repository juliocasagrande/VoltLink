// frontend/hooks/useInfinitePessoas.ts
import { useInfiniteQuery } from "@tanstack/react-query"
import api from "@/lib/axios"
import type { PageResp, Pessoa } from "@/lib/types"

export type PessoasFilter = {
  q?: string
  especialidade?: string
}

function buildQuery(p: number, f: PessoasFilter) {
  const sp = new URLSearchParams()
  sp.set("page", String(p))
  sp.set("page_size", "20")
  if (f.q) sp.set("search", f.q)
  if (f.especialidade) sp.set("especialidade", f.especialidade)
  return sp
}

export function useInfinitePessoas(filters: PessoasFilter) {
  return useInfiniteQuery({
    queryKey: ["pessoas", filters],
    queryFn: async ({ pageParam = 1, signal }) => {
      const { data } = await api.get<PageResp<Pessoa>>("/pessoas/", {
        signal,
        params: {
          page: pageParam,
          page_size: 20,
          ...(filters.q ? { search: filters.q } : {}),
          ...(filters.especialidade ? { especialidade: filters.especialidade } : {}),
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