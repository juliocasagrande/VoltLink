// app/layout.tsx
import "./globals.css"
import Providers from "@/components/providers"

export const metadata = {
  title: "VoltLink",
  description: "Sistema de controle de equipes e atividades",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}