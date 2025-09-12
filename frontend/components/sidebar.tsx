"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, ListTodo, Users, PanelLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

type Item = { href: string; icon: any; label: string }
const items: Item[] = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/atividades", icon: ListTodo, label: "Atividades" },
  { href: "/equipe", icon: Users, label: "Equipe/Clientes" },
]

// cor ativa na paleta da aplicação (âmbar, levemente mais escuro)
const ACTIVE_BG = "bg-[rgba(239,209,109,0.85)]"
const ACTIVE_RING = "ring-1 ring-amber-300/60"

export default function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    try {
      const saved = typeof window !== "undefined" ? localStorage.getItem("voltlink_sidebar_collapsed") : null
      if (saved) setCollapsed(saved === "1")
    } catch { /* noop */ }
  }, [])

  function toggle() {
    const next = !collapsed
    setCollapsed(next)
    try {
      localStorage.setItem("voltlink_sidebar_collapsed", next ? "1" : "0")
    } catch { /* noop */ }
  }

  // regra de “ativo”: começa com a rota do item, mas evita ativar "/dashboard" em "/"
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/")

  return (
    <aside
      className={`card-glass z-20 sticky top-0 left-2 h-screen shrink-0 overflow-hidden transition-all duration-300
      ${collapsed ? "w-[84px]" : "w-[260px]"} p-3`}
    >
      {/* Cabeçalho da sidebar */}
      <div
        className={`mb-3 flex items-center ${collapsed ? "justify-center" : "justify-between"} rounded-lg px-2 py-2`}
        style={{ background: "rgba(180, 140, 10, 0.15)" }}
      >
        {!collapsed && (
          <span className="flex items-center gap-2 font-semibold text-lg text-black">
            <span
              className="inline-block w-6 h-6 rounded-full"
              style={{ background: "rgba(180, 140, 10, 0.7)" }}
              aria-hidden
            />
            VoltLink
          </span>
        )}

        <Button
          variant="ghost"
          size="icon"
          onClick={toggle}
          aria-label={collapsed ? "Expandir barra lateral" : "Recolher barra lateral"}
        >
          <PanelLeft className="size-5 text-black" />
        </Button>
      </div>

      {/* Navegação */}
      <nav className="space-y-1">
        {items.map(({ href, icon: Icon, label }) => {
          const active = isActive(href)
          return (
            <Link key={href} href={href} aria-current={active ? "page" : undefined}>
              <div
                className={[
                  "group flex items-center gap-3 rounded-xl px-3 py-2 transition",
                  active
                    ? `${ACTIVE_BG} ${ACTIVE_RING} shadow-soft text-black`
                    : "hover:bg-white/50",
                ].join(" ")}
              >
                <Icon
                  className={[
                    "size-5 shrink-0 transition-transform",
                    active ? "scale-[1.05]" : "group-hover:scale-[1.02]",
                  ].join(" ")}
                />
                {!collapsed && (
                  <span className={`text-sm font-medium ${active ? "text-black" : ""}`}>
                    {label}
                  </span>
                )}

                {/* indicador de ativo quando colapsada */}
                {collapsed && active && (
                  <span className="ml-auto inline-block h-2 w-2 rounded-full bg-amber-300" aria-hidden />
                )}
              </div>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}