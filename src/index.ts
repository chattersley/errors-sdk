export {
  configure,
  reportError,
  getConfig,
  _resetForTests,
} from "./reporter"
export { installGlobalHandlers } from "./install"
export { attachAxiosInterceptor } from "./axios"
export { ErrorBoundary } from "./error-boundary"
export type { ErrorBoundaryProps } from "./error-boundary"
export type {
  ReporterEvent,
  ReporterConfig,
  ReporterSource,
  ReporterSeverity,
  ReportErrorInput,
} from "./types"
