//lib/api.ts
import axios from "axios"

const baseURL = process.env.NEXT_PUBLIC_API_URL
if (!baseURL) {
  // ajuda a detectar .env ausente
  // eslint-disable-next-line no-console
  console.warn("⚠️ NEXT_PUBLIC_API_URL não definido – requests vão falhar")
}

export const api = axios.create({
  baseURL, // ex.: http://127.0.0.1:8000/api
  withCredentials: false, // estamos usando Authorization: Bearer, não cookies
})

// Anexa o token em TODAS as chamadas
// lib/api.ts
api.interceptors.request.use((config) => {
  const key = process.env.NEXT_PUBLIC_ACCESS_TOKEN_KEY || "access"
  const token = typeof window !== "undefined" ? localStorage.getItem(key) : null

  if (token) {
    config.headers = config.headers ?? {}
    // log TEMPORÁRIO para conferir
    // eslint-disable-next-line no-console
    console.log("[api] adding bearer to", config.url)

    if (!String(config.headers.Authorization || "").toLowerCase().startsWith("bearer")) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})
