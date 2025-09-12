// app/(app)/equipe/page.tsx
"use client"

import { useEffect, useMemo, useState } from "react"
import { useInView } from "react-intersection-observer"
import { useQueryClient } from "@tanstack/react-query"
import api from "@/lib/axios"                    // ⬅️ use sempre ESTE cliente
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import FiltersSidebar from "@/components/equipeClientes/FiltersSidebar"
import PessoasTable from "@/components/equipeClientes/PessoasTable"
import ClientesTable from "@/components/equipeClientes/ClientesTable"
import PessoaModal from "@/components/equipeClientes/PessoaModal"
import ClienteModal from "@/components/equipeClientes/ClienteModal"
import { useInfinitePessoas, PessoasFilter } from "@/hooks/useInfinitePessoas"
import { useInfiniteClientes, ClientesFilter } from "@/hooks/useInfiniteClientes"
import type { Pessoa, Cliente } from "@/lib/types"

type TabKey = "pessoas" | "clientes"

export default function Page() {
  const [tab, setTab] = useState<TabKey>("pessoas")

  const [pFilters, setPFilters] = useState<PessoasFilter>({ q: undefined, especialidade: undefined })
  const [cFilters, setCFilters] = useState<ClientesFilter>({ q: undefined, localidade: undefined })

  const pessoas = useInfinitePessoas(pFilters)
  const clientes = useInfiniteClientes(cFilters)

  const { ref: pSentinel, inView: pInView } = useInView({ rootMargin: "400px" })
  const { ref: cSentinel, inView: cInView } = useInView({ rootMargin: "400px" })

  useEffect(() => { if (pInView && pessoas.hasNextPage && !pessoas.isFetchingNextPage) pessoas.fetchNextPage() }, [pInView, pessoas])
  useEffect(() => { if (cInView && clientes.hasNextPage && !clientes.isFetchingNextPage) clientes.fetchNextPage() }, [cInView, clientes])

  const pessoasData = useMemo<Pessoa[]>(
    () => pessoas.data?.pages.flatMap(pg => pg.results) ?? [],
    [pessoas.data]
  )
  const clientesData = useMemo<Cliente[]>(
    () => clientes.data?.pages.flatMap(pg => pg.results) ?? [],
    [clientes.data]
  )

  const especialidades = useMemo(
    () => Array.from(new Set(pessoasData.map(p => p.especialidade).filter(Boolean) as string[])).sort(),
    [pessoasData]
  )
  const localidades = useMemo(
    () => Array.from(new Set(clientesData.map(c => c.localidade).filter(Boolean) as string[])).sort(),
    [clientesData]
  )

  // ----- Modais -----
  const [pOpen, setPOpen] = useState(false)
  const [pEdit, setPEdit] = useState<Pessoa | null>(null)
  const [cOpen, setCOpen] = useState(false)
  const [cEdit, setCEdit] = useState<Cliente | null>(null)

  const qc = useQueryClient()

  // ⬇️ CRUD PESSOAS — SEMPRE com barra final
  async function savePessoa(payload: Omit<Pessoa, "id">, id?: number) {
    const url = id ? `/pessoas/${id}/` : `/pessoas/`
    if (id) await api.put(url, payload)
    else     await api.post(url, payload)
    await qc.invalidateQueries({ queryKey: ["pessoas"] })   // recarrega automaticamente
  }
  async function deletePessoa(p: Pessoa) {
    await api.delete(`/pessoas/${p.id}/`)
    await qc.invalidateQueries({ queryKey: ["pessoas"] })
  }

  // ⬇️ CRUD CLIENTES — SEMPRE com barra final
  async function saveCliente(payload: Omit<Cliente, "id">, id?: number) {
    const url = id ? `/clientes/${id}/` : `/clientes/`
    if (id) await api.put(url, payload)
    else     await api.post(url, payload)
    await qc.invalidateQueries({ queryKey: ["clientes"] })
  }
  async function deleteCliente(c: Cliente) {
    await api.delete(`/clientes/${c.id}/`)
    await qc.invalidateQueries({ queryKey: ["clientes"] })
  }

  return (
    <div className="flex gap-4">
      {/* Sidebar de filtros */}
      {tab === "pessoas" ? (
        <FiltersSidebar
          kind="pessoas"
          values={pFilters}
          onChange={setPFilters}
          especialidades={especialidades}
        />
      ) : (
        <FiltersSidebar
          kind="clientes"
          values={cFilters}
          onChange={setCFilters}
          localidades={localidades}
        />
      )}

      <div className="card-glass p-0 overflow-hidden flex-1 flex">
        <div className="flex-1">
          {/* ÚNICA barra superior (Tabs + botão à direita) */}
          <div className="section-header m-3 flex items-center justify-between text-sm h-[46px] px-4 rounded-t-xl">
            <Tabs value={tab} onValueChange={(v) => setTab(v as TabKey)}>
              <TabsList>
                <TabsTrigger value="pessoas">Equipe</TabsTrigger>
                <TabsTrigger value="clientes">Clientes</TabsTrigger>
              </TabsList>
            </Tabs>

            {tab === "pessoas" ? (
              <button
                onClick={() => { setPEdit(null); setPOpen(true) }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-md px-3 py-1 text-sm"
              >
                + Nova Pessoa
              </button>
            ) : (
              <button
                onClick={() => { setCEdit(null); setCOpen(true) }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-md px-3 py-1 text-sm"
              >
                + Novo Cliente
              </button>
            )}
          </div>

          {/* A tabela vem LOGO abaixo da primeira barra */}
          <div className="card-glass p-0 overflow-hidden">
            {tab === "pessoas" ? (
              <PessoasTable
                data={pessoasData}
                onCreate={() => { setPEdit(null); setPOpen(true) }}
                onEdit={(row) => { setPEdit(row); setPOpen(true) }}
                onDelete={deletePessoa}
                sentinelRef={pSentinel}
                isFetchingNextPage={!!pessoas.isFetchingNextPage}
                hasNextPage={!!pessoas.hasNextPage}
              />
            ) : (
              <ClientesTable
                data={clientesData}
                onCreate={() => { setCEdit(null); setCOpen(true) }}
                onEdit={(row) => { setCEdit(row); setCOpen(true) }}
                onDelete={deleteCliente}
                sentinelRef={cSentinel}
                isFetchingNextPage={!!clientes.isFetchingNextPage}
                hasNextPage={!!clientes.hasNextPage}
              />
            )}
          </div>
        </div>
      </div>

      {/* Modais */}
      <PessoaModal open={pOpen} onOpenChange={setPOpen} initial={pEdit} onSubmitForm={savePessoa} />
      <ClienteModal open={cOpen} onOpenChange={setCOpen} initial={cEdit} onSubmitForm={saveCliente} />
    </div>
  )
}