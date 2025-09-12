"use client"
import { QueryClientProvider } from "@tanstack/react-query"
import { queryClient } from "@/lib/queryClient"
import { ReactNode, useEffect, useState } from "react"

export default function Providers({ children }: { children: ReactNode }) {
  // evita hydration mismatch
  const [ready, setReady] = useState(false)
  useEffect(() => setReady(true), [])
  if (!ready) return null
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
