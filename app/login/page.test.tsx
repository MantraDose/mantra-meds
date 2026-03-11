import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import LoginPage from "@/app/login/page"

const mockPush = vi.fn()
const mockRefresh = vi.fn()
const mockGetSearchParam = vi.fn((key: string) =>
  key === "redirectTo" ? null : null
)

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, refresh: mockRefresh }),
  useSearchParams: () => ({ get: mockGetSearchParam }),
}))

const mockSignInWithPassword = vi.fn()
vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      signInWithPassword: mockSignInWithPassword,
    },
  }),
}))

describe("Login page", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetSearchParam.mockImplementation((key: string) =>
      key === "redirectTo" ? null : null
    )
  })

  it("shows validation error when email is empty", async () => {
    const user = userEvent.setup()
    render(<LoginPage />)
    const submit = screen.getByRole("button", { name: /sign in/i })
    await user.click(submit)
    expect(screen.getByText(/please enter your email address/i)).toBeInTheDocument()
  })

  it("shows validation error when password is empty", async () => {
    const user = userEvent.setup()
    render(<LoginPage />)
    await user.type(screen.getByLabelText(/email address/i), "test@example.com")
    const submit = screen.getByRole("button", { name: /sign in/i })
    await user.click(submit)
    expect(screen.getByText(/please enter your password/i)).toBeInTheDocument()
  })

  it("shows generic error when signInWithPassword fails with invalid credentials", async () => {
    mockSignInWithPassword.mockResolvedValueOnce({
      data: { user: null, session: null },
      error: { message: "Invalid login credentials", status: 400 },
    })
    const user = userEvent.setup()
    render(<LoginPage />)
    await user.type(screen.getByLabelText(/email address/i), "user@example.com")
    await user.type(screen.getByLabelText(/^password$/i), "wrongpassword")
    const submit = screen.getByRole("button", { name: /sign in/i })
    await user.click(submit)
    await screen.findByText(/invalid email or password/i)
    expect(mockSignInWithPassword).toHaveBeenCalledWith({
      email: "user@example.com",
      password: "wrongpassword",
    })
  })

  it("redirects to dashboard on successful sign-in", async () => {
    mockSignInWithPassword.mockResolvedValueOnce({
      data: { user: {}, session: {} },
      error: null,
    })
    const user = userEvent.setup()
    render(<LoginPage />)
    await user.type(screen.getByLabelText(/email address/i), "user@example.com")
    await user.type(screen.getByLabelText(/^password$/i), "correctpassword")
    const submit = screen.getByRole("button", { name: /sign in/i })
    await user.click(submit)
    expect(mockPush).toHaveBeenCalledWith("/dashboard")
    expect(mockRefresh).toHaveBeenCalled()
  })

  describe("reset password flow entry points", () => {
    it("shows Forgot password link that points to /auth/forgot-password", () => {
      render(<LoginPage />)
      const link = screen.getByRole("link", { name: /forgot password/i })
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute("href", "/auth/forgot-password")
    })

    it("styles Forgot password link with text-mantra-magenta", () => {
      render(<LoginPage />)
      const link = screen.getByRole("link", { name: /forgot password/i })
      expect(link).toHaveClass("text-mantra-magenta")
    })

    it("has a password visibility toggle with accessible label", () => {
      render(<LoginPage />)
      const toggle = screen.getByRole("button", {
        name: /show password/i,
      })
      expect(toggle).toBeInTheDocument()
    })

    it("toggles password visibility when show/hide button is clicked", async () => {
      const user = userEvent.setup()
      render(<LoginPage />)
      const passwordInput = screen.getByLabelText(/^password$/i)
      expect(passwordInput).toHaveAttribute("type", "password")

      const showButton = screen.getByRole("button", { name: /show password/i })
      await user.click(showButton)
      expect(passwordInput).toHaveAttribute("type", "text")

      const hideButton = screen.getByRole("button", { name: /hide password/i })
      await user.click(hideButton)
      expect(passwordInput).toHaveAttribute("type", "password")
    })
  })

  it("shows success message when message query param is present (e.g. after reset)", () => {
    mockGetSearchParam.mockImplementation((key: string) =>
      key === "message"
        ? "Password updated. Sign in with your new password."
        : key === "redirectTo"
          ? null
          : null
    )
    render(<LoginPage />)
    expect(
      screen.getByText(/password updated.*sign in with your new password/i)
    ).toBeInTheDocument()
  })
})
