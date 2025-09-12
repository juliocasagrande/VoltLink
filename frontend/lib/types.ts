export type Urgencia = "Alta" | "Média" | "Baixa"
export type Status = "Não iniciado" | "Em andamento" | "Concluído"

export type Atividade = {
  id: number
  demanda: string
  area_solicitante?: string | null
  localidade?: string | null
  responsaveis?: string | null       // nomes separados por ";"
  data_solicitacao?: string | null   // ISO
  prazo?: string | null              // ISO
  urgencia?: Urgencia | null
  importancia?: "Alta" | "Média" | "Baixa" | null
  quadrante?: "Q1" | "Q2" | "Q3" | "Q4" | null
  status?: Status | null
  observacoes?: string | null
}

export type Pessoa = {
  id: number
  nome: string
  email?: string
  especialidade?: string
  criado_em?: string
  atualizado_em?: string
}

export type Cliente = {
  id: number
  area: string
  localidade?: string
  criado_em?: string
  atualizado_em?: string
}

export type PageResp<T> = {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}