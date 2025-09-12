// app/%28app%29/atividades/page.tsx
"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import FiltersSidebar from "@/components/atividades/FiltersSidebar"
import AtividadesTable from "@/components/atividades/AtividadesTable"
import AtividadeModal from "@/components/atividades/AtividadeModal"
import { useInfiniteAtividades, usePessoas } from "@/hooks/useInfiniteAtividades"
import api from "@/lib/axios"
import type { Atividade } from "@/lib/types"
import type { AtividadeForm } from "@/lib/schemas"
import { useQueryClient } from "@tanstack/react-query"

export default function AtividadesPage() {
  const [filters, setFilters] = useState<{
    urgencia?: string[]; importancia?: string[]; status?: string[]; responsavel?: string[]; search?: string;
  }>({})

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteAtividades(filters)

  const { data: pessoas = [] } = usePessoas()
  const respOptions: string[] = useMemo(
    () => Array.from(new Set(pessoas.map((p) => p.nome))).sort(),
    [pessoas]
  )

  // “Achatar” as páginas (evita erro de .map em InfiniteData)
  const pages = data?.pages ?? []
  const items: Atividade[] = useMemo(
    () => pages.flatMap((p) => p.results),
    [pages]
  )

  // Infinite scroll sentinel
  const sentinel = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    if (!sentinel.current) return
    const obs = new IntersectionObserver(
      (entries) => {
        const e = entries[0]
        if (e.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage()
        }
      },
      { rootMargin: "200px" }
    )
    obs.observe(sentinel.current)
    return () => obs.disconnect()
  }, [fetchNextPage, hasNextPage, isFetchingNextPage])

  // Modal
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Atividade | null>(null)

  const openCreate = () => {
    setEditing(null)
    setOpen(true)
  }
  const openEdit = (a: Atividade) => {
    setEditing(a)
    setOpen(true)
  }

  const queryClient = useQueryClient()

  async function handleSubmitForm(payload: any, id?: number) {
    // formata payload -> junta responsaveis em string
    const responsaveisStr = Array.isArray(payload.responsaveis)
      ? payload.responsaveis.join("; ")
      : (payload.responsaveis ?? "")

    const body = { ...payload, responsaveis: responsaveisStr }

    if (id) {
      await api.put(`/atividades/${id}/`, body)
    } else {
      await api.post(`/atividades/`, body)
    }

    // força recarregar lista e (opcional) gráficos do dashboard
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["atividades"], exact: false }),
      queryClient.invalidateQueries({ queryKey: ["dashboard", "urgencia"], exact: false }), 
      queryClient.invalidateQueries({ queryKey: ["dashboard", "responsavel"], exact: false }),
    ])
  }

  async function handleDelete(a: Atividade) {
    if (!confirm(`Excluir a atividade "${a.demanda}"?`)) return
    await api.delete(`/atividades/${a.id}/`)
    await refetch()
  }

  return (
    <div className="flex gap-4">
      <FiltersSidebar
        values={filters}
        onChange={setFilters}
        responsaveisOptions={respOptions}
      />

      <div className="flex-1 space-y-3">

        <AtividadesTable
          data={items}
          onEdit={openEdit}
          onDelete={handleDelete}
          onCreate={openCreate}
          sentinelRef={(el) => (sentinel.current = el)}
          isFetchingNextPage={isFetchingNextPage}
          hasNextPage={hasNextPage}
        />

        <div ref={sentinel} />

        <AtividadeModal
          open={open}
          onOpenChange={setOpen}
          initial={editing}
          responsaveisOptions={respOptions}
          onSubmitForm={handleSubmitForm}
        />
      </div>
    </div>
  )
}
