export type ReporterSource = "api" | "boundary" | "unhandled" | "rejection" | "manual"
export type ReporterSeverity = "debug" | "info" | "warning" | "error" | "fatal"

export interface ReporterEvent {
  occurred_at: string
  source: ReporterSource
  severity?: ReporterSeverity
  message: string
  stack?: string
  url?: string
  endpoint?: string
  status_code?: number
  user_agent?: string
  session_id?: string
  release?: string
  context?: Record<string, unknown>
}

export interface ReporterConfig {
  dsn: string
  ingestURL: string
  environment?: string
  release?: string
  getSessionID?: () => string
}

export type ReportErrorInput = Omit<ReporterEvent, "occurred_at"> & {
  occurred_at?: string
}
