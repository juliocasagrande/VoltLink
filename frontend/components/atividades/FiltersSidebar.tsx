// components/atividades/FiltersSidebar.tsx
"use client"

import { Eraser, Filter } from "lucide-react"

type Filters = {
  search?: string
  urgencia?: string[]
  importancia?: string[]
  status?: string[]
  responsavel?: string[]
}

type Props = {
  values: Filters
  onChange: (f: Filters) => void
  responsaveisOptions: string[]
}

const URGENCIA = ["Alta", "Média", "Baixa"]
const IMPORTANCIA = ["Alta", "Média", "Baixa"]
const STATUS = ["Não iniciado", "Em andamento", "Concluído"]

export default function FiltersSidebar({ values, onChange, responsaveisOptions }: Props) {
  const toggle = (key: keyof Filters, val: string) => {
    const set = new Set((values[key] as string[]) ?? [])
    set.has(val) ? set.delete(val) : set.add(val)
    onChange({ ...values, [key]: set.size ? Array.from(set) : undefined })
  }

  const clearAll = () =>
    onChange({ search: undefined, urgencia: undefined, importancia: undefined, status: undefined, responsavel: undefined })

  return (
    <aside className="w-72 shrink-0">
      <div className="card-glass p-3">
        {/* Cabeçalho */}
        <div className="section-header mb-3 rounded-xl px-3 py-2 flex items-center justify-between">
          <span className="inline-flex items-center gap-2 font-semibold">
            <Filter className="h-4 w-4" />
            Filtros
          </span>
          <button
            type="button"
            onClick={clearAll}
            className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 hover:text-amber-800"
            title="Limpar todos os filtros"
          >
            <Eraser className="h-4 w-4" />
            Limpar
          </button>
        </div>

        <div className="space-y-4">
          {/* Busca */}
          <Section title="Busca">
            <input
              className="w-full h-10 rounded-lg border px-3 text-[0.95rem]"
              placeholder="Buscar texto..."
              defaultValue={values.search ?? ""}
              onChange={(e) => onChange({ ...values, search: e.target.value || undefined })}
            />
          </Section>

          {/* Urgência */}
          <Section title="Urgência">
            <ChipGroup
              options={URGENCIA}
              selected={values.urgencia ?? []}
              onToggle={(v) => toggle("urgencia", v)}
            />
          </Section>

          {/* Importância */}
          <Section title="Importância">
            <ChipGroup
              options={IMPORTANCIA}
              selected={values.importancia ?? []}
              onToggle={(v) => toggle("importancia", v)}
            />
          </Section>

          {/* Status */}
          <Section title="Status">
            <ChipGroup
              options={STATUS}
              selected={values.status ?? []}
              onToggle={(v) => toggle("status", v)}
            />
          </Section>

          {/* Responsável */}
          <Section title="Responsável">
            <div className="max-h-48 overflow-auto pr-1">
              <ChipGroup
                options={responsaveisOptions}
                selected={values.responsavel ?? []}
                onToggle={(v) => toggle("responsavel", v)}
              />
            </div>
          </Section>
        </div>
      </div>
    </aside>
  )
}

/* ------------------------- Componentes de UI ------------------------- */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-yellow-500 bg-white/70 p-3">
      <div className="text-[0.95rem] font-semibold text-gray-800 mb-2">{title}</div>
      {children}
    </div>
  )
}

function ChipGroup({
  options,
  selected,
  onToggle,
}: {
  options: string[]
  selected: string[]
  onToggle: (val: string) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((op) => {
        const active = selected.includes(op)
        return (
          <button
            key={op}
            type="button"
            onClick={() => onToggle(op)}
            className={[
              "px-3 py-1.5 rounded-full border text-sm transition",
              "focus:outline-none focus:ring-2 focus:ring-amber-300",
              active
                ? "bg-amber-100 border-amber-500 text-amber-800 shadow-sm"
                : "bg-white/70 border-slate-200 text-slate-700 hover:bg-slate-50",
            ].join(" ")}
            title={op}
          >
            {op}
          </button>
        )
      })}
    </div>
  )
}
