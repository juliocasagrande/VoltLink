"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation"
import api from "@/lib/axios"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

type LoginForm = { username: string; password: string }

export default function LoginPage() {
  const router = useRouter()
  const { register, handleSubmit } = useForm<LoginForm>()
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  // modais
  const [openCreate, setOpenCreate] = useState(false)
  const [openForgot, setOpenForgot] = useState(false)

  // ---- LOGIN ---------------------------------------------------------------
  const onSubmit = async (data: LoginForm) => {
    setLoading(true)
    setErr(null)
    try {
      // seu endpoint de auth (JWT)
      const r = await api.post("/token/", data)
      // guarde nos MESMOS nomes que você já usa
      localStorage.setItem("voltlink_access", r.data.access)
      localStorage.setItem("voltlink_refresh", r.data.refresh)
      router.push("/dashboard")
    } catch {
      setErr("Usuário ou senha inválidos.")
    } finally {
      setLoading(false)
    }
  }

  // ---- CRIAR USUÁRIO -------------------------------------------------------
  async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    try {
      await api.post("/auth/register/", {
        username: fd.get("username"),
        email: fd.get("email"),
        password: fd.get("password"),
      })
      setOpenCreate(false)
      alert("Usuário criado com sucesso. Faça login.")
    } catch (error: any) {
      const msg = error?.response?.data?.detail || "Não foi possível criar o usuário."
      alert(msg)
    }
  }

  
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="card-glass w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-xl section-header">Entrar no VoltLink</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="username">Usuário</Label>
              <Input id="username" placeholder="seu_usuario" {...register("username", { required: true })} />
            </div>

            <div className="space-y-1">
              <Label htmlFor="password">Senha</Label>
              <Input id="password" type="password" placeholder="********" {...register("password", { required: true })} />
            </div>

            {err && <p className="text-sm text-red-600">{err}</p>}

            <Button type="submit" className="w-full bg-emerald-500 font-bold" disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          {/* Ações secundárias */}
          <div className="mt-3 flex items-center justify-between text-sm">
            <button type="button" className="underline text-blue-700" onClick={() => setOpenCreate(true)}>
              Criar usuário
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Modal: Criar usuário */}
      <Dialog open={openCreate} onOpenChange={setOpenCreate}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader className="section-header">
            <DialogTitle>Criar usuário</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleRegister} className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="new_username">Usuário</Label>
              <Input id="new_username" name="username" required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="new_email">E-mail</Label>
              <Input id="new_email" type="email" name="email" required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="new_password">Senha</Label>
              <Input id="new_password" type="password" name="password" required />
            </div>

            <DialogFooter className="gap-2">
              <Button type="button" variant="secondary" onClick={() => setOpenCreate(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                Criar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}