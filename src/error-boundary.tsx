import { Component, type ErrorInfo, type ReactNode } from "react"
import { reportError } from "./reporter"

export interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode | ((error: Error) => ReactNode)
  onError?: (error: Error, info: ErrorInfo) => void
}

interface ErrorBoundaryState {
  error: Error | null
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { error: null }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    void reportError({
      source: "boundary",
      message: error.message,
      stack: error.stack,
      context: { componentStack: info.componentStack ?? "" },
    })
    this.props.onError?.(error, info)
  }

  render(): ReactNode {
    const { error } = this.state
    if (!error) return this.props.children
    const { fallback } = this.props
    if (typeof fallback === "function") return fallback(error)
    if (fallback !== undefined) return fallback
    return null
  }
}
