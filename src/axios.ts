import type { AxiosError, AxiosInstance } from "axios"
import { reportError } from "./reporter"

// attachAxiosInterceptor reports every non-2xx as a source=api event and
// re-rejects so page-level .catch() still runs.
export function attachAxiosInterceptor(instance: AxiosInstance): void {
  instance.interceptors.response.use(
    (r) => r,
    (err: AxiosError) => {
      const endpoint = err.config?.url ?? ""
      const statusCode = err.response?.status ?? 0
      const message = err.message || `request failed: ${statusCode || "network"}`
      void reportError({
        source: "api",
        message,
        endpoint,
        status_code: statusCode,
        stack: err.stack,
      })
      return Promise.reject(err)
    },
  )
}
