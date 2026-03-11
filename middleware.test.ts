import { describe, it, expect, vi, beforeEach } from "vitest"
import { NextRequest } from "next/server"

vi.mock("@supabase/ssr", () => ({
  createServerClient: vi.fn(),
}))

const mockGetUser = vi.fn()
const createServerClient = vi.mocked(
  (await import("@supabase/ssr")).createServerClient
)

async function loadMiddleware() {
  const { middleware } = await import("@/middleware")
  return middleware
}

describe("Auth middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    createServerClient.mockReturnValue({
      auth: {
        getUser: mockGetUser,
      },
    } as any)
  })

  it("redirects unauthenticated request to /dashboard to /login with redirectTo", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null })
    const middleware = await loadMiddleware()
    const request = new NextRequest(new URL("http://localhost:3000/dashboard"))
    const response = await middleware(request)
    expect(response.status).toBe(307)
    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/login?redirectTo=%2Fdashboard"
    )
  })

  it("redirects unauthenticated request to /dashboard/performance to /login with redirectTo", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null })
    const middleware = await loadMiddleware()
    const request = new NextRequest(
      new URL("http://localhost:3000/dashboard/performance")
    )
    const response = await middleware(request)
    expect(response.status).toBe(307)
    expect(response.headers.get("location")).toContain("/login")
    expect(response.headers.get("location")).toContain(
      "redirectTo=%2Fdashboard%2Fperformance"
    )
  })

  it("redirects authenticated request from /login to /dashboard", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-1" } },
      error: null,
    })
    const middleware = await loadMiddleware()
    const request = new NextRequest(new URL("http://localhost:3000/login"))
    const response = await middleware(request)
    expect(response.status).toBe(307)
    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/dashboard"
    )
  })

  it("allows unauthenticated request to /login to proceed", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null })
    const middleware = await loadMiddleware()
    const request = new NextRequest(new URL("http://localhost:3000/login"))
    const response = await middleware(request)
    expect(response.status).toBe(200)
  })

  it("allows unauthenticated request to /auth/forgot-password to proceed", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null })
    const middleware = await loadMiddleware()
    const request = new NextRequest(
      new URL("http://localhost:3000/auth/forgot-password")
    )
    const response = await middleware(request)
    expect(response.status).toBe(200)
  })

  it("allows unauthenticated request to /auth/reset-password to proceed", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null })
    const middleware = await loadMiddleware()
    const request = new NextRequest(
      new URL("http://localhost:3000/auth/reset-password")
    )
    const response = await middleware(request)
    expect(response.status).toBe(200)
  })

  it("redirects authenticated user from /auth/forgot-password to /dashboard", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-1" } },
      error: null,
    })
    const middleware = await loadMiddleware()
    const request = new NextRequest(
      new URL("http://localhost:3000/auth/forgot-password")
    )
    const response = await middleware(request)
    expect(response.status).toBe(307)
    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/dashboard"
    )
  })

  it("redirects authenticated user from /auth/reset-password to /dashboard", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-1" } },
      error: null,
    })
    const middleware = await loadMiddleware()
    const request = new NextRequest(
      new URL("http://localhost:3000/auth/reset-password")
    )
    const response = await middleware(request)
    expect(response.status).toBe(307)
    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/dashboard"
    )
  })
})
