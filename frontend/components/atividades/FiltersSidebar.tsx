"use client"
import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { usePessoas } from "@/hooks/useInfiniteAtividades"

type Props = {
  onApply: (f: {
    urgencia?: string
    importancia?: string          // <-- garantimos o nome
    status?: string
    responsavel?: string          // <-- garantimos o nome
    search?: string
  }) => void
  onClear: () => void
}

export default function FiltersSidebar({ onApply, onClear }: Props) {
  const { data: pessoas = [] } = usePessoas()

  const [urgencia, setUrgencia] = useState("")
  const [importancia, setImportancia] = useState("")   // <-- novo
  const [status, setStatus] = useState("")
  const [responsavel, setResponsavel] = useState("")   // <-- alinhado
  const [search, setSearch] = useState("")

  const respOptions = useMemo(
    () => Array.from(new Set(pessoas.map(p => p.nome).filter(Boolean))).sort(),
    [pessoas]
  )

  function apply() {
    onApply({
      urgencia: urgencia || undefined,
      importancia: importancia || undefined,
      status: status || undefined,
      responsavel: responsavel || undefined,
      search: search || undefined,
    })
  }

  function clear() {
    setUrgencia("")
    setImportancia("")
    setStatus("")
    setResponsavel("")
    setSearch("")
    onClear()
  }

  return (
    <aside className="card-glass p-3 w-[260px] shrink-0">
      <div className="section-header mb-3 font-medium">Filtros</div>

      <div className="space-y-3">
        <div>
          <label className="text-sm block mb-1">Busca</label>
          <input className="h-9 w-full rounded-md border px-2"
                 placeholder="nome, email, área…"
                 value={search} onChange={(e)=>setSearch(e.target.value)} />
        </div>

        <div>
          <label className="text-sm block mb-1">Urgência</label>
          <select className="h-9 w-full rounded-md border px-2"
                  value={urgencia} onChange={(e)=>setUrgencia(e.target.value)}>
            <option value="">Todas</option>
            <option value="Alta">Alta</option>
            <option value="Média">Média</option>
            <option value="Baixa">Baixa</option>
          </select>
        </div>

        <div>
          <label className="text-sm block mb-1">Importância</label>
          <select className="h-9 w-full rounded-md border px-2"
                  value={importancia} onChange={(e)=>setImportancia(e.target.value)}>
            <option value="">Todas</option>
            <option value="Alta">Alta</option>
            <option value="Média">Média</option>
            <option value="Baixa">Baixa</option>
          </select>
        </div>

        <div>
          <label className="text-sm block mb-1">Status</label>
          <select className="h-9 w-full rounded-md border px-2"
                  value={status} onChange={(e)=>setStatus(e.target.value)}>
            <option value="">Todos</option>
            <option value="Não iniciado">Não iniciado</option>
            <option value="Em andamento">Em andamento</option>
            <option value="Concluído">Concluído</option>
          </select>
        </div>

        <div>
          <label className="text-sm block mb-1">Responsável</label>
          <select className="h-9 w-full rounded-md border px-2"
                  value={responsavel} onChange={(e)=>setResponsavel(e.target.value)}>
            <option value="">Todos</option>
            {respOptions.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        <div className="flex gap-2 pt-1">
          <Button onClick={apply} className="bg-emerald-600 hover:bg-emerald-700 text-white">Aplicar</Button>
          <Button variant="secondary" onClick={clear}>Limpar</Button>
        </div>
      </div>
    </aside>
  )
}