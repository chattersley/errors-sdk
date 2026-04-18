import type { ReportErrorInput, ReporterConfig, ReporterEvent } from "./types"

let config: ReporterConfig | null = null

const DEDUP_WINDOW_MS = 5000
const recent = new Map<string, number>()

export function configure(cfg: ReporterConfig): void {
  config = cfg
}

export function getConfig(): ReporterConfig | null {
  return config
}

export async function reportError(input: ReportErrorInput): Promise<void> {
  if (!config) return

  const occurred_at = input.occurred_at ?? new Date().toISOString()
  const event: ReporterEvent = {
    ...input,
    occurred_at,
    release: input.release ?? config.release,
    session_id: input.session_id ?? config.getSessionID?.(),
    url: input.url ?? (typeof window !== "undefined" ? window.location.href : undefined),
    user_agent:
      input.user_agent ?? (typeof navigator !== "undefined" ? navigator.userAgent : undefined),
  }

  const key = clientFingerprint(event)
  const now = Date.now()
  const last = recent.get(key)
  if (last && now - last < DEDUP_WINDOW_MS) return
  recent.set(key, now)
  pruneDedup(now)

  try {
    await fetch(config.ingestURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-DSN": config.dsn,
      },
      body: JSON.stringify(event),
      keepalive: true,
    })
  } catch {
    // Swallow — an unreachable ingestion endpoint must not cascade into
    // another reported error.
  }
}

function clientFingerprint(evt: ReporterEvent): string {
  const top =
    evt.stack?.split("\n").find((l) => l.trim() && !/^(Error|TypeError):/.test(l.trim())) ?? ""
  const normalized = evt.message
    .replace(
      /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/g,
      "<uuid>",
    )
    .replace(/\b\d+\b/g, "<n>")
    .toLowerCase()
    .trim()
  return `${evt.source}|${normalized}|${top.trim()}`
}

function pruneDedup(now: number): void {
  for (const [key, ts] of recent.entries()) {
    if (now - ts > DEDUP_WINDOW_MS) recent.delete(key)
  }
}

export function _resetForTests(): void {
  config = null
  recent.clear()
}
