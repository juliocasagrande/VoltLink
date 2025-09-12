"use client"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

type Values = { nome: string; email?: string; especialidade?: string }

type Props = {
  open: boolean
  onOpenChange: (v: boolean) => void
  initial: Values | null
  onSubmitForm: (payload: Values, id?: number) => Promise<void>
  id?: number
}

export default function PessoaModal({ open, onOpenChange, initial, onSubmitForm, id }: Props) {
  const form = useForm<Values>({ defaultValues: { nome: "", email: "", especialidade: "" } })

  useEffect(() => {
    if (open) form.reset(initial ?? { nome: "", email: "", especialidade: "" })
  }, [open, initial, form])

  const submit = form.handleSubmit(async (data) => {
    await onSubmitForm(data, id)
    onOpenChange(false)
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white">
        <div className="section-header mb-3">
          <DialogHeader className="p-0"><DialogTitle>{id ? "Editar Pessoa" : "Nova Pessoa"}</DialogTitle></DialogHeader>
        </div>

        <form className="space-y-3" onSubmit={submit}>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Nome</Label>
            <Input {...form.register("nome")} />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Email</Label>
            <Input type="email" {...form.register("email")} />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Especialidade</Label>
            <Input {...form.register("especialidade")} />
          </div>

        <DialogFooter className="mt-2">
          <Button type="button" onClick={() => onOpenChange(false)} className="bg-rose-600 hover:bg-rose-700 text-white">Cancelar</Button>
          <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">{id ? "Salvar" : "Criar"}</Button>
        </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}