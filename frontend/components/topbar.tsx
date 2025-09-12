"use client"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export default function Topbar() {
  const router = useRouter()

  function logout() {
    localStorage.removeItem("voltlink_access")
    localStorage.removeItem("voltlink_refresh")
    router.push("/login")
  }

  return (
    <header className="w-full h-14 card-glass flex items-center justify-between px-4">
      <div className="font-medium">Bem-vindo ao VoltLink</div>
      <div className="flex items-center gap-3">
        <Avatar className="h-8 w-8">
          <AvatarFallback></AvatarFallback>
        </Avatar>
        <Button variant="outline" onClick={logout}>Sair</Button>
      </div>
    </header>
  )
}