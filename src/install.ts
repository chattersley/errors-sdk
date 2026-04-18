import { reportError } from "./reporter"

let installed = false

export function installGlobalHandlers(): void {
  if (installed || typeof window === "undefined") return
  installed = true

  window.addEventListener("error", (ev) => {
    const err = ev.error as Error | undefined
    void reportError({
      source: "unhandled",
      message: err?.message ?? ev.message ?? "unknown error",
      stack: err?.stack,
    })
  })

  window.addEventListener("unhandledrejection", (ev) => {
    const reason = ev.reason
    const message =
      reason instanceof Error
        ? reason.message
        : typeof reason === "string"
          ? reason
          : "unhandled promise rejection"
    const stack = reason instanceof Error ? reason.stack : undefined
    void reportError({
      source: "rejection",
      message,
      stack,
    })
  })
}

export function _resetInstallForTests(): void {
  installed = false
}
