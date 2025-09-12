//hooks/useAtividades.ts
"use client"
import { useQuery } from "@tanstack/react-query"
import api from "@/lib/axios"

export type Atividade = {
  id: number
  urgencia: "Alta" | "Média" | "Baixa" | null
  status?: "Não iniciado" | "Em andamento" | "Concluído" | null
  responsaveis?: string | null
}

export function useAtividades() {
  return useQuery({
    queryKey: ["atividades"],
    queryFn: async () => {
      const r = await api.get("/atividades/?page_size=1000")
      return r.data.results as Atividade[]
    },
  })
}