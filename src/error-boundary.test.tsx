// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest"
import { render } from "@testing-library/react"
import { ErrorBoundary } from "./error-boundary"
import { _resetForTests, configure } from "./reporter"

function Boom(): never {
  throw new Error("kaboom")
}

describe("ErrorBoundary", () => {
  beforeEach(() => {
    _resetForTests()
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(null, { status: 202 })),
    )
    vi.spyOn(console, "error").mockImplementation(() => {})
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it("renders fallback and reports the error", () => {
    configure({ dsn: "test", ingestURL: "https://example/events" })
    const { container } = render(
      <ErrorBoundary fallback={<div>oops</div>}>
        <Boom />
      </ErrorBoundary>,
    )
    expect(container.textContent).toContain("oops")
    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>
    expect(fetchMock).toHaveBeenCalledTimes(1)
    const body = JSON.parse(fetchMock.mock.calls[0][1].body as string)
    expect(body.source).toBe("boundary")
    expect(body.message).toBe("kaboom")
  })

  it("invokes onError with the component stack", () => {
    configure({ dsn: "test", ingestURL: "https://example/events" })
    const onError = vi.fn()
    render(
      <ErrorBoundary fallback={null} onError={onError}>
        <Boom />
      </ErrorBoundary>,
    )
    expect(onError).toHaveBeenCalledTimes(1)
    expect(onError.mock.calls[0][0]).toBeInstanceOf(Error)
  })
})
