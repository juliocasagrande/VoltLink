"use client"
import { Button } from "@/components/ui/button"
import type { Cliente } from "@/lib/types"
import { Pencil, Trash2, Plus } from "lucide-react"

type Props = {
  data: Cliente[]
  onCreate: () => void
  onEdit: (c: Cliente) => void
  onDelete: (c: Cliente) => void
  sentinelRef: (el: HTMLDivElement | null) => void
  isFetchingNextPage: boolean
  hasNextPage?: boolean
}

export default function ClientesTable({
  data, onCreate, onEdit, onDelete, sentinelRef, isFetchingNextPage, hasNextPage
}: Props) {
  return (
    <div className="card-glass w-full">
      <div className="overflow-x-auto m-3">
        <table className="w-full text-sm">
          <thead>
            <tr className="[&>th]:text-left [&>th]:py-2 [&>th]:px-3 text-gray-600 bg-gray-100">
              <th>Área/Cliente</th><th>Localidade</th>
              <th className="text-right pr-3"></th>
            </tr>
          </thead>
          <tbody className="[&>tr]:border-t">
            {data.map(c => (
              <tr key={c.id} className="[&>td]:py-2 [&>td]:px-3">
                <td>{c.area}</td>
                <td>{c.localidade ?? "-"}</td>
                <td className="text-right space-x-1">
                  <Button size="icon" variant="ghost" onClick={() => onEdit(c)} aria-label="Editar"><Pencil className="h-4 w-4"/></Button>
                  <Button size="icon" variant="ghost" onClick={() => onDelete(c)} className="text-rose-600 hover:text-rose-700" aria-label="Excluir"><Trash2 className="h-4 w-4"/></Button>
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