import axios, { AxiosError, InternalAxiosRequestConfig } from "axios"

const baseURL =
  (process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api").replace(/\/+$/, "")

const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
})

/** Adiciona Authorization: Bearer <access> em toda request */
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("voltlink_access")
    if (token) {
      config.headers = config.headers || {}
      ;(config.headers as any).Authorization = `Bearer ${token}`
    }
  }
  return config
})

/** Refresh automático do access quando tomar 401 */
let refreshing = false
let waiters: Array<(t: string) => void> = []

function notifyAll(newToken: string) {
  waiters.forEach((cb) => cb(newToken))
  waiters = []
}

api.interceptors.response.use(
  (r) => r,
  async (error: AxiosError) => {
    const status = error.response?.status
    const original = error.config as any

    if (status === 401 && !original?._retry) {
      original._retry = true

      if (refreshing) {
        return new Promise((resolve) => {
          waiters.push((token) => {
            original.headers = original.headers || {}
            original.headers.Authorization = `Bearer ${token}`
            resolve(api(original))
          })
        })
      }

      refreshing = true
      try {
        const refresh = localStorage.getItem("voltlink_refresh")
        if (!refresh) throw new Error("no-refresh")

        const resp = await axios.post(
          `${baseURL}/token/refresh/`,
          { refresh },
          { headers: { "Content-Type": "application/json" } }
        )

        const newAccess = (resp.data as any)?.access
        if (!newAccess) throw new Error("no-access")

        localStorage.setItem("voltlink_access", newAccess)
        notifyAll(newAccess)

        original.headers = original.headers || {}
        original.headers.Authorization = `Bearer ${newAccess}`
        return api(original)
      } catch (e) {
        localStorage.removeItem("voltlink_access")
        localStorage.removeItem("voltlink_refresh")
        if (typeof window !== "undefined") window.location.href = "/login"
        throw error
      } finally {
        refreshing = false
      }
    }

    throw error
  }
)

export default api