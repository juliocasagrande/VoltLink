"use client"

import { useEffect, useMemo } from "react"
import { useForm } from "react-hook-form"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { usePessoas, useAreasELocalidades } from "@/hooks/useInfiniteAtividades"

type FormValues = {
  demanda: string
  area_solicitante?: string | null
  localidade?: string | null

  importancia: "Baixa" | "Média" | "Alta"
  urgencia: "Baixa" | "Média" | "Alta"
  quadrante: "Q1" | "Q2" | "Q3" | "Q4"

  prazo?: string
  status: "Não iniciado" | "Em andamento" | "Concluído"

  responsaveis: string[] | string
  observacoes?: string
}

type Props = {
  open: boolean
  onOpenChange: (v: boolean) => void
  initial: any | null
  // opcional: se vier, substitui os nomes buscados por hook
  responsaveisOptions?: string[]
  onSubmitForm: (payload: any, id?: number) => Promise<void>
}

function toYMD(d?: string) {
  if (!d) return ""
  const dt = new Date(d)
  if (Number.isNaN(dt.getTime())) return d.slice(0, 10)
  return dt.toISOString().slice(0, 10)
}

export default function AtividadeModal({
  open,
  onOpenChange,
  initial,
  responsaveisOptions: respFromProps,
  onSubmitForm,
}: Props) {
  // --- hooks de dados
  const { data: pessoasHook = [] } = usePessoas()
  const {
    data: areasLocs,
    isLoading: loadingAreasLocs,
    isError: errorAreasLocs,
  } = useAreasELocalidades()

  const responsaveisOptions: string[] =
    respFromProps ?? pessoasHook.map((p: any) => p.nome).filter(Boolean)

  const areas = areasLocs?.areas ?? []
  const areaToLocs = areasLocs?.areaToLocs ?? new Map<string, string[]>()

  // --- form
  const form = useForm<FormValues>({
    shouldUnregister: true,
    defaultValues: {
      demanda: "",
      area_solicitante: "",
      localidade: "",
      importancia: "Média",
      urgencia: "Média",
      quadrante: "Q2",
      prazo: "",
      status: "Não iniciado",
      responsaveis: [],
      observacoes: "",
    },
  })

  // --- abrir (novo/edição) e preencher
  useEffect(() => {
    if (!open) return

    if (!initial) {
      form.reset({
        demanda: "",
        area_solicitante: "",
        localidade: "",
        importancia: "Média",
        urgencia: "Média",
        quadrante: "Q2",
        prazo: "",
        status: "Não iniciado",
        responsaveis: [],
        observacoes: "",
      })
      return
    }

    const responsaveisArr = String(initial.responsaveis || "")
      .split(";")
      .map((s: string) => s.trim())
      .filter(Boolean)

    form.reset({
      demanda: initial.demanda ?? "",
      area_solicitante: initial.area_solicitante ?? "",
      localidade: initial.localidade ?? "",
      importancia: (initial.importancia as FormValues["importancia"]) ?? "Média",
      urgencia: (initial.urgencia as FormValues["urgencia"]) ?? "Média",
      quadrante: (initial.quadrante as FormValues["quadrante"]) ?? "Q2",
      prazo: toYMD(initial.prazo),
      status: (initial.status as FormValues["status"]) ?? "Não iniciado",
      responsaveis: responsaveisArr,
      observacoes: initial.observacoes ?? "",
    })
  }, [open, initial, form])

  // --- localidades dependem da área
  const watchArea = form.watch("area_solicitante") ?? ""
  const locOptions = useMemo(
    () => (watchArea ? (areaToLocs.get(watchArea) ?? []).slice().sort() : []),
    [watchArea, areaToLocs]
  )

  // quando as listas/área mudarem, garantir uma localidade válida
  useEffect(() => {
    if (!watchArea) {
      form.setValue("localidade", "")
      return
    }
    const current = form.getValues("localidade") ?? ""
    if (!locOptions.length) {
      if (current) form.setValue("localidade", "")
      return
    }
    if (!current || !locOptions.includes(current)) {
      form.setValue("localidade", locOptions[0])
    }
  }, [watchArea, locOptions, form])

  const submit = form.handleSubmit(async (data) => {
    const respArray = Array.isArray(data.responsaveis)
      ? data.responsaveis
      : data.responsaveis
      ? [data.responsaveis]
      : []
    await onSubmitForm({ ...data, responsaveis: respArray }, initial?.id)
    onOpenChange(false)
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl bg-white">
        <div className="section-header mb-3">
          <DialogHeader className="p-0">
            <DialogTitle>{initial ? "Editar Atividade" : "Nova Atividade"}</DialogTitle>
          </DialogHeader>
        </div>

        <form className="space-y-3" onSubmit={submit}>
          {/* 1) Demanda */}
          <div className="space-y-2">
            <Label htmlFor="demanda" className="text-sm font-medium">Demanda</Label>
            <Input id="demanda" placeholder="Descreva a atividade" {...form.register("demanda")} />
          </div>

          {/* 2) Área/Cliente + Localidade */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <Label className="text-sm font-medium">Área/Cliente</Label>
              <select
                className="h-9 rounded-md border px-2"
                {...form.register("area_solicitante")}
                disabled={loadingAreasLocs || !!errorAreasLocs}
              >
                {loadingAreasLocs && <option value="">Carregando áreas…</option>}
                {errorAreasLocs && <option value="">Erro ao carregar áreas</option>}
                {!loadingAreasLocs && !errorAreasLocs && (
                  <>
                    <option value="">Selecione…</option>
                    {areas.map((a) => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </>
                )}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <Label className="text-sm font-medium">Localidade</Label>
              <select
                className="h-9 rounded-md border px-2"
                {...form.register("localidade")}
                disabled={!watchArea || loadingAreasLocs || !!errorAreasLocs}
              >
                {!watchArea && <option value="">Selecione uma área primeiro…</option>}
                {watchArea && !locOptions.length && <option value="">Sem localidades para esta área</option>}
                {watchArea && locOptions.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>
          </div>

          {/* 3) Importância + Urgência + Quadrante */}
          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col gap-1">
              <Label className="text-sm font-medium">Importância</Label>
              <select className="h-9 rounded-md border px-2" {...form.register("importancia")}>
                <option value="Baixa">Baixa</option>
                <option value="Média">Média</option>
                <option value="Alta">Alta</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <Label className="text-sm font-medium">Urgência</Label>
              <select className="h-9 rounded-md border px-2" {...form.register("urgencia")}>
                <option value="Baixa">Baixa</option>
                <option value="Média">Média</option>
                <option value="Alta">Alta</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <Label className="text-sm font-medium">Quadrante</Label>
              <select className="h-9 rounded-md border px-2" {...form.register("quadrante")}>
                <option value="Q1">Q1</option>
                <option value="Q2">Q2</option>
                <option value="Q3">Q3</option>
                <option value="Q4">Q4</option>
              </select>
            </div>
          </div>

          {/* 4) Prazo + Status */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <Label htmlFor="prazo" className="text-sm font-medium">Prazo</Label>
              <Input id="prazo" type="date" {...form.register("prazo")} />
            </div>

            <div className="flex flex-col gap-1">
              <Label className="text-sm font-medium">Status</Label>
              <select className="h-9 rounded-md border px-2" {...form.register("status")}>
                <option value="Não iniciado">Não iniciado</option>
                <option value="Em andamento">Em andamento</option>
                <option value="Concluído">Concluído</option>
              </select>
            </div>
          </div>

          {/* 5) Responsáveis */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Responsáveis</Label>
            <div className="grid grid-cols-3 gap-y-1">
              {responsaveisOptions.map((nome) => (
                <label key={nome} className="inline-flex items-center gap-2 text-sm">
                  <input type="checkbox" value={nome} {...form.register("responsaveis")} />
                  {nome}
                </label>
              ))}
            </div>
          </div>

          {/* 6) Observações */}
          <div className="space-y-2">
            <Label htmlFor="observacoes" className="text-sm font-medium">Observações</Label>
            <Textarea id="observacoes" placeholder="Opcional" {...form.register("observacoes")} />
          </div>

          <DialogFooter className="mt-2">
            <Button type="button" onClick={() => onOpenChange(false)} className="bg-rose-600 hover:bg-rose-700 text-white">
              Cancelar
            </Button>
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">
              {initial ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}