import Sidebar from "@/components/sidebar"
import Topbar from "@/components/topbar"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    // Tela inteira em flex: sidebar à esquerda, conteúdo no resto
    <div className="min-h-screen w-full flex">
      {/* Sidebar fora do container central => encosta na borda esquerda */}
      <Sidebar />

      {/* Conteúdo ocupa o restante e pode ter largura máxima centralizada */}
      <div className="flex-1">
        <div className="mx-auto max-w-[2000px] px-5 py-3">
          <Topbar />
          <main className="mt-4">{children}</main>
        </div>
      </div>
    </div>
  )
}