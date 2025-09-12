"use client"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

type PessoaFilters = { q?: string; especialidade?: string }
type ClienteFilters = { q?: string; localidade?: string }

type Props =
  | { kind: "pessoas"; values: PessoaFilters; onChange: (v: PessoaFilters) => void; especialidades: string[] }
  | { kind: "clientes"; values: ClienteFilters; onChange: (v: ClienteFilters) => void; localidades: string[] }

export default function FiltersSidebar(props: Props) {
  const [local, setLocal] = useState(props.values as any)
  useEffect(() => setLocal(props.values as any), [props.values])

  const set = (k: string, v?: string) => setLocal((p: any) => ({ ...p, [k]: v }))
  const apply = () => (props as any).onChange(local)
  const clear = () => {
    const empty = Object.fromEntries(Object.keys(local).map(k => [k, undefined]))
    setLocal(empty); (props as any).onChange(empty)
  }

  return (
    <aside className="card-glass w-[260px] p-3 shrink-0 hidden xl:block">
      <div className="font-medium mb-2 section-header">Filtros</div>
      <Separator className="mb-3" />

      <div className="space-y-3">
        <div>
          <div className="text-sm mb-1">Busca</div>
          <input
            className="w-full rounded-md border p-2"
            placeholder="nome, email, área..."
            value={local.q ?? ""}
            onChange={(e) => set("q", e.target.value || undefined)}
          />
        </div>

        {props.kind === "pessoas" ? (
          <div>
            <div className="text-sm mb-1">Especialidade</div>
            <select
              className="w-full rounded-md border p-2"
              value={(local as any).especialidade ?? ""}
              onChange={(e) => set("especialidade", e.target.value || undefined)}
            >
              <option value="">Todas</option>
              {(props as any).especialidades.map((n: string) => <option key={n}>{n}</option>)}
            </select>
          </div>
        ) : (
          <div>
            <div className="text-sm mb-1">Localidade</div>
            <select
              className="w-full rounded-md border p-2"
              value={(local as any).localidade ?? ""}
              onChange={(e) => set("localidade", e.target.value || undefined)}
            >
              <option value="">Todas</option>
              {(props as any).localidades.map((n: string) => <option key={n}>{n}</option>)}
            </select>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Button onClick={apply} className="bg-emerald-600 hover:bg-emerald-700 text-white">Aplicar</Button>
          <Button onClick={clear} className="bg-amber-500 hover:bg-amber-600 text-white">Limpar</Button>
        </div>
      </div>
    </aside>
  )
}