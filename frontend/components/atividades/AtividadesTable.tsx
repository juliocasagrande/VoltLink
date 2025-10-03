"use client"

import { Button } from "@/components/ui/button"
import type { Atividade } from "@/lib/types"
import { Pencil, Trash2, Plus, ChevronUp, ChevronDown, Minus } from "lucide-react"
import ExcelJS from "exceljs"
import { saveAs } from "file-saver"

type Props = {
  data: Atividade[]
  onEdit: (a: Atividade) => void
  onDelete: (a: Atividade) => void
  onCreate: () => void
  sentinelRef: (el: HTMLDivElement | null) => void
  isFetchingNextPage: boolean
  hasNextPage?: boolean
  ordering: string | null
  onToggleOrdering?: (field: string) => void
}

// Helpers para texto legível
function getBadgeLabel(value: string) {
  const map: Record<string, string> = {
    alta: "Alta",
    media: "Média",
    baixa: "Baixa",
    Q1: "Q1",
    Q2: "Q2",
    Q3: "Q3",
    Q4: "Q4",
    "nao iniciado": "Não iniciado",
    "em andamento": "Em andamento",
    concluido: "Concluído",
  }
  return map[value.toLowerCase()] || value
}

/* Badges simples (UI) */
function levelBadge(level?: string) {
  const base = "inline-flex items-center rounded px-2 py-0.5 text-xs font-medium text-white"
  if (level === "Alta") return <span className={`${base} bg-rose-600`}>Alta</span>
  if (level === "Média") return <span className={`${base} bg-amber-500`}>Média</span>
  if (level === "Baixa") return <span className={`${base} bg-sky-600`}>Baixa</span>
  return <span className={`${base} bg-slate-400`}>{level ?? "-"}</span>
}

function statusBadge(level?: string) {
  const base = "inline-flex items-center rounded px-2 py-0.5 text-xs font-medium text-white"
  if (level === "Concluído") return <span className={`${base} bg-green-500`}>Concluído</span>
  if (level === "Em andamento") return <span className={`${base} bg-blue-500`}>Em andamento</span>
  if (level === "Não iniciado") return <span className={`${base} bg-orange-400`}>Não iniciado</span>
  return <span className={`${base} bg-slate-400`}>{level ?? "-"}</span>
}

function quadranteBadge(q?: string) {
  const base = "inline-flex items-center rounded px-2 py-0.5 text-xs font-medium text-white"
  switch (q) {
    case "Q1": return <span className={`${base} bg-rose-600`}>Q1</span>
    case "Q2": return <span className={`${base} bg-amber-500`}>Q2</span>
    case "Q3": return <span className={`${base} bg-sky-600`}>Q3</span>
    case "Q4": return <span className={`${base} bg-cyan-600`}>Q4</span>
    default: return <span className={`${base} bg-slate-400`}>{q ?? "-"}</span>
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

  // --- EXPORTAÇÃO COM ESTILO (exceljs)
  async function exportToStyledExcel() {
    const wb = new ExcelJS.Workbook()
    const ws = wb.addWorksheet("Atividades")

    // Cabeçalhos + largura das colunas
    ws.columns = [
      { header: "Demanda", key: "demanda", width: 42 },
      { header: "Área/Cliente", key: "area", width: 22 },
      { header: "Localidade", key: "localidade", width: 20 },
      { header: "Responsáveis", key: "responsaveis", width: 28 },
      { header: "Prazo", key: "prazo", width: 14 },
      { header: "Urgência", key: "urgencia", width: 12 },
      { header: "Importância", key: "importancia", width: 12 },
      { header: "Quadrante", key: "quadrante", width: 10 },
      { header: "Status", key: "status", width: 16 },
      { header: "Observações", key: "obs", width: 36 },
    ]

    // Estilo do cabeçalho
    ws.getRow(1).eachCell((cell) => {
      cell.font = { bold: true }
      cell.alignment = { vertical: "middle", horizontal: "center" }
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF3F4F6" } } // cinza claro
      cell.border = {
        top: { style: "thin" }, left: { style: "thin" },
        bottom: { style: "thin" }, right: { style: "thin" },
      }
    })

    // Paleta para “badges”
    const fills: Record<string, ExcelJS.Fill> = {
      Alta:          { type: "pattern", pattern: "solid", fgColor: { argb: "FFDB2777" } }, // rose-600
      Média:         { type: "pattern", pattern: "solid", fgColor: { argb: "FFF59E0B" } }, // amber-500
      Baixa:         { type: "pattern", pattern: "solid", fgColor: { argb: "FF0EA5E9" } }, // sky-600
      Q1:            { type: "pattern", pattern: "solid", fgColor: { argb: "FFDB2777" } },
      Q2:            { type: "pattern", pattern: "solid", fgColor: { argb: "FFF59E0B" } },
      Q3:            { type: "pattern", pattern: "solid", fgColor: { argb: "FF0EA5E9" } },
      Q4:            { type: "pattern", pattern: "solid", fgColor: { argb: "FF06B6D4" } }, // cyan-600
      "Em andamento":{ type: "pattern", pattern: "solid", fgColor: { argb: "FF3B82F6" } }, // blue-500
      "Não iniciado":{ type: "pattern", pattern: "solid", fgColor: { argb: "FFF97316" } }, // orange-400
      "Concluído":   { type: "pattern", pattern: "solid", fgColor: { argb: "FF22C55E" } }, // green-500
    }

    // Linhas
    data.forEach((a) => {
      const row = ws.addRow({
        demanda: a.demanda ?? "",
        area: a.area_solicitante ?? "",
        localidade: a.localidade ?? "",
        responsaveis: a.responsaveis ?? "",
        // formata a data como string dd/mm/aaaa para ficar igual ao app
        prazo: a.prazo ? new Date(a.prazo).toLocaleDateString() : "",
        urgencia: getBadgeLabel((a.urgencia ?? "") as string),
        importancia: getBadgeLabel((a.importancia ?? "") as string),
        quadrante: getBadgeLabel((a.quadrante ?? "") as string),
        status: getBadgeLabel((a.status ?? "") as string),
        obs: a.observacoes ?? "",
      })

      // aplica “badge” (cor de fundo) nas colunas 6..9
      const paint = (col: number, val?: string | null) => {
        if (!val) return
        const fill = fills[val]
        if (fill) {
          const cell = row.getCell(col)
          cell.fill = fill
          cell.font = { color: { argb: "FFFFFFFF" }, bold: true }
          cell.alignment = { vertical: "middle", horizontal: "center" }
        }
      }
      paint(6, row.getCell(6).value as string) // Urgência
      paint(7, row.getCell(7).value as string) // Importância
      paint(8, row.getCell(8).value as string) // Quadrante
      paint(9, row.getCell(9).value as string) // Status
    })

    // Bordas + alinhamento padrão
    ws.eachRow((row, idx) => {
      if (idx === 1) return
      row.height = 20
      row.eachCell((cell) => {
        cell.alignment = cell.alignment ?? { vertical: "middle", horizontal: "left", wrapText: true }
        cell.border = {
          top: { style: "thin" }, left: { style: "thin" },
          bottom: { style: "thin" }, right: { style: "thin" },
        }
      })
    })

    // Gera e baixa
    const buf = await wb.xlsx.writeBuffer()
    const blob = new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
    saveAs(blob, "Voltlink_Atividades.xlsx")
  }


  return (
    <div className="card-glass">
      <div className="section-header m-3 flex items-center justify-between h-[42px] px-4 rounded-t-xl gap-2">
        <div className="font-medium">Atividades</div>
        <div className="flex gap-2">
          <Button
            onClick={exportToStyledExcel}
            className="bg-blue-500 hover:bg-blue-700 text-white text-sm h-8 px-3"
            title="Exportar Excel com formatação"
          >
            🔗 Baixar Dados
          </Button>
          <Button onClick={onCreate} className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm h-8 px-3">
            <Plus className="h-4 w-4 mr-2" />
            Nova Atividade
          </Button>
        </div>
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