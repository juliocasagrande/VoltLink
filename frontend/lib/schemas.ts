import { z } from "zod"
import type { Status, Urgencia } from "./types"

export const atividadeSchema = z.object({
  demanda: z.string().min(3, "Descreva a demanda"),
  responsaveis: z.array(z.string()).min(1, "Escolha ao menos 1 responsável"),
  prazo: z.string().min(1, "Informe o prazo"),
  urgencia: z.enum(["Alta","Média","Baixa"] as [Urgencia, ...Urgencia[]]),
  status: z.enum(["Não iniciado","Em andamento","Concluído"] as [Status, ...Status[]]),
  observacoes: z.string().optional(),
})

export type AtividadeForm = z.infer<typeof atividadeSchema>