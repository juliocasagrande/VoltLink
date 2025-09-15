"use client"
import { Button } from "@/components/ui/button"
import type { Atividade } from "@/lib/types"
import { Pencil, Trash2, Plus, ChevronUp, ChevronDown, Minus } from "lucide-react"

type Props = {
  data: Atividade[]
  onEdit: (a: Atividade) => void
  onDelete: (a: Atividade) => void
  onCreate: () => void
  sentinelRef: (el: HTMLDivElement | null) => void
  isFetchingNextPage: boolean
  hasNextPage?: boolean
  ordering: string | null
  onToggleOrdering?: (field: string) => void // opcional por segurança
}

/* Badges simples (cores já usadas no projeto) */
function levelBadge(level?: string) {
  const base = "inline-flex items-center rounded px-2 py-0.5 text-xs font-medium text-white"
  if (level === "Alta")   return <span className={`${base} bg-rose-600`}>Alta</span>
  if (level === "Média")  return <span className={`${base} bg-amber-500`}>Média</span>
  if (level === "Baixa")  return <span className={`${base} bg-sky-600`}>Baixa</span>
  return <span className={`${base} bg-slate-400`}>{level ?? "-"}</span>
}

function statusBadge(level?: string) {
  const base = "inline-flex items-center rounded px-2 py-0.5 text-xs font-medium text-white"
  if (level === "Concluído")     return <span className={`${base} bg-green-500`}>Concluído</span>
  if (level === "Em andamento")  return <span className={`${base} bg-blue-500`}>Em andamento</span>
  if (level === "Não iniciado")  return <span className={`${base} bg-orange-400`}>Não iniciado</span>
  return <span className={`${base} bg-slate-400`}>{level ?? "-"}</span>
}

function quadranteBadge(q?: string) {
  const base = "inline-flex items-center rounded px-2 py-0.5 text-xs font-medium text-white"
  switch (q) {
    case "Q1": return <span className={`${base} bg-rose-600`}>Q1</span>
    case "Q2": return <span className={`${base} bg-amber-500`}>Q2</span>
    case "Q3": return <span className={`${base} bg-sky-600`}>Q3</span>
    case "Q4": return <span className={`${base} bg-cyan-600`}>Q4</span>
    default:   return <span className={`${base} bg-slate-400`}>{q ?? "-"}</span>
  }
}

function SortButton({
  field, label, ordering, onToggle, align = "left",
}: {
  field: string
  label: string
  ordering: string | null
  onToggle?: (f: string) => void
  align?: "left" | "right"
}) {
  const isAsc = ordering === field
  const isDesc = ordering === "-" + field
  const Icon = isAsc ? ChevronUp : isDesc ? ChevronDown : Minus
  const tint = isAsc || isDesc ? "text-amber-700" : "text-slate-500"

  return (
    <button
      type="button"
      className={`inline-flex items-center gap-1 hover:underline ${align === "right" ? "justify-end" : ""}`}
      onClick={() => onToggle?.(field)}
      title={`Ordenar por ${label}`}
    >
      <span>{label}</span>
      <Icon className={`h-4 w-4 ${tint}`} />
    </button>
  )
}

export default function AtividadesTable({
  data, onEdit, onDelete, onCreate, sentinelRef, isFetchingNextPage, hasNextPage,
  ordering, onToggleOrdering,
}: Props) {
  const safeToggle = onToggleOrdering ?? (() => {})

  return (
    <div className="card-glass">
      <div className="section-header m-3 flex items-center justify-between h-[42px] px-4 rounded-t-xl">
        <div className="font-medium">Atividades</div>
        <Button onClick={onCreate} className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm h-8 px-3">
          <Plus className="h-4 w-4 mr-2" />
          Nova Atividade
        </Button>
      </div>

      <div className="overflow-x-auto m-3 pt-0">
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10">
            <tr className="text-left text-sm bg-gray-100">
              <th className="px-4 py-2">
                <SortButton field="demanda" label="Demanda" ordering={ordering} onToggle={safeToggle} />
              </th>
              <th className="px-4 py-2">
                <SortButton field="area_solicitante" label="Área/Cliente" ordering={ordering} onToggle={safeToggle} />
              </th>
              <th className="px-4 py-2">
                <SortButton field="localidade" label="Localidade" ordering={ordering} onToggle={safeToggle} />
              </th>
              <th className="px-4 py-2">
                <SortButton field="responsaveis" label="Responsáveis" ordering={ordering} onToggle={safeToggle} />
              </th>
              <th className="px-4 py-2">
                <SortButton field="prazo" label="Prazo" ordering={ordering} onToggle={safeToggle} />
              </th>
              <th className="px-4 py-2">
                <SortButton field="urgencia" label="Urgência" ordering={ordering} onToggle={safeToggle} />
              </th>
              <th className="px-4 py-2">
                <SortButton field="importancia" label="Importância" ordering={ordering} onToggle={safeToggle} />
              </th>
              <th className="px-4 py-2">
                <SortButton field="quadrante" label="Quadrante" ordering={ordering} onToggle={safeToggle} />
              </th>
              <th className="px-4 py-2">
                <SortButton field="status" label="Status" ordering={ordering} onToggle={safeToggle} />
              </th>
              <th className="px-4 py-2 text-right">Ações</th>
            </tr>
          </thead>

          <tbody className="[&>tr]:border-t">
            {data.map((a) => (
              <tr key={a.id} className="[&>td]:py-2 [&>td]:px-3 align-top">
                <td className="max-w-[520px]">{a.demanda}</td>
                <td>{a.area_solicitante}</td>
                <td>{a.localidade}</td>
                <td>{a.responsaveis?.split(";").map(s => s.trim()).filter(Boolean).join(", ")}</td>
                <td>{a.prazo ? new Date(a.prazo).toLocaleDateString() : "-"}</td>
                <td>{levelBadge(a.urgencia ?? undefined)}</td>
                <td>{levelBadge(a.importancia ?? undefined)}</td>
                <td>{quadranteBadge(a.quadrante ?? undefined)}</td>
                <td>{statusBadge(a.status ?? undefined)}</td>
                <td className="text-right space-x-1">
                  <Button size="icon" variant="ghost" onClick={() => onEdit(a)} aria-label="Editar" title="Editar">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => onDelete(a)} aria-label="Excluir" title="Excluir">
                    <Trash2 className="h-4 w-4 text-rose-600" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div ref={sentinelRef} className="h-10" />
      {isFetchingNextPage && <div className="px-3 pb-3 text-sm text-gray-500">Carregando…</div>}
      {!hasNextPage && <div className="px-3 pb-3 text-sm text-gray-500">Fim da lista</div>}
    </div>
  )
}