// lib/hooks/useAtividadesAll.ts
"use client"

import { useQuery } from "@tanstack/react-query"
import api from "@/lib/axios"
import type { Atividade } from "@/lib/types"

export function useAtividadesAll() {
  return useQuery<Atividade[]>({
    queryKey: ["atividades-all"],
    queryFn: async () => {
      const r = await api.get("/atividades/", { params: { page_size: 1000 } })
      return (r.data?.results ?? []) as Atividade[]
    },
  })
}
