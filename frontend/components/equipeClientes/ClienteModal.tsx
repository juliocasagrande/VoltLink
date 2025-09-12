"use client"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

type Values = { area: string; localidade?: string }

type Props = {
  open: boolean
  onOpenChange: (v: boolean) => void
  initial: Values | null
  onSubmitForm: (payload: Values, id?: number) => Promise<void>
  id?: number
}

export default function ClienteModal({ open, onOpenChange, initial, onSubmitForm, id }: Props) {
  const form = useForm<Values>({ defaultValues: { area: "", localidade: "" } })

  useEffect(() => {
    if (open) form.reset(initial ?? { area: "", localidade: "" })
  }, [open, initial, form])

  const submit = form.handleSubmit(async (data) => {
    await onSubmitForm(data, id)
    onOpenChange(false)
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white">
        <div className="section-header mb-3">
          <DialogHeader className="p-0"><DialogTitle>{id ? "Editar Cliente" : "Novo Cliente"}</DialogTitle></DialogHeader>
        </div>

        <form className="space-y-3" onSubmit={submit}>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Área/Cliente</Label>
            <Input {...form.register("area")} />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Localidade</Label>
            <Input {...form.register("localidade")} />
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