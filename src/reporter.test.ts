import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import { configure, reportError, _resetForTests } from "./reporter"

const fetchMock = vi.fn<typeof fetch>()

beforeEach(() => {
  _resetForTests()
  fetchMock.mockReset()
  fetchMock.mockResolvedValue(new Response(null, { status: 202 }))
  vi.stubGlobal("fetch", fetchMock)
  configure({
    dsn: "test-dsn",
    ingestURL: "http://ingest.test/events",
    environment: "test",
    release: "r1",
    getSessionID: () => "sess-1",
  })
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe("reportError", () => {
  it("POSTs with X-DSN header and the event body", async () => {
    await reportError({ source: "manual", message: "boom" })
    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe("http://ingest.test/events")
    expect(init?.method).toBe("POST")
    const headers = init?.headers as Record<string, string>
    expect(headers["X-DSN"]).toBe("test-dsn")
    const body = JSON.parse(init?.body as string) as { message: string; release?: string }
    expect(body.message).toBe("boom")
    expect(body.release).toBe("r1")
  })

  it("dedupes identical events within 5s", async () => {
    await reportError({ source: "manual", message: "same" })
    await reportError({ source: "manual", message: "same" })
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it("normalizes uuids/numbers so near-identical events collapse", async () => {
    await reportError({
      source: "api",
      message: "user 123e4567-e89b-12d3-a456-426614174000 failed after 42 retries",
    })
    await reportError({
      source: "api",
      message: "user 987fcdeb-aaaa-bbbb-cccc-dddddddddddd failed after 7 retries",
    })
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it("is a no-op when unconfigured", async () => {
    _resetForTests()
    await reportError({ source: "manual", message: "dropped" })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("does not throw when the network fails", async () => {
    fetchMock.mockRejectedValueOnce(new Error("offline"))
    await expect(reportError({ source: "manual", message: "x" })).resolves.toBeUndefined()
  })
})
