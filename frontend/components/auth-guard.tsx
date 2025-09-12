"use client"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem("voltlink_access")
    if (!token) router.push("/login")
    else setReady(true)
  }, [router])

  if (!ready) return null
  return <>{children}</>
}