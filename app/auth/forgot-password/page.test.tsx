import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import ForgotPasswordPage from "@/app/auth/forgot-password/page"

const mockResetPasswordForEmail = vi.fn()

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      resetPasswordForEmail: mockResetPasswordForEmail,
    },
  }),
}))

describe("Forgot password page", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockResetPasswordForEmail.mockResolvedValue({ data: {}, error: null })
  })

  it("renders email field and submit CTA", () => {
    render(<ForgotPasswordPage />)
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /send reset link/i })).toBeInTheDocument()
  })

  it("calls resetPasswordForEmail with email and redirectTo to app reset page", async () => {
    const user = userEvent.setup()
    const origin = "https://example.com"
    Object.defineProperty(window, "location", {
      value: { origin },
      writable: true,
    })
    render(<ForgotPasswordPage />)
    await user.type(screen.getByLabelText(/email address/i), "user@example.com")
    await user.click(screen.getByRole("button", { name: /send reset link/i }))
    await vi.waitFor(() => {
      expect(mockResetPasswordForEmail).toHaveBeenCalledWith(
        "user@example.com",
        expect.objectContaining({
          redirectTo: `${origin}/auth/reset-password`,
        })
      )
    })
  })

  it("shows generic success message after submit", async () => {
    const user = userEvent.setup()
    render(<ForgotPasswordPage />)
    await user.type(screen.getByLabelText(/email address/i), "user@example.com")
    await user.click(screen.getByRole("button", { name: /send reset link/i }))
    expect(
      await screen.findByText(/if an account exists for this email/i)
    ).toBeInTheDocument()
  })

  it("applies cooldown after several submits and shows try-again message", async () => {
    const user = userEvent.setup()
    render(<ForgotPasswordPage />)
    const emailInput = screen.getByLabelText(/email address/i)
    const submit = screen.getByRole("button", { name: /send reset link/i })

    await user.type(emailInput, "same@example.com")
    for (let i = 0; i < 4; i++) {
      await user.click(submit)
      await screen.findByText(/if an account exists for this email/i)
    }
    await user.click(submit)

    expect(screen.getByText(/too many attempts/i)).toBeInTheDocument()
    expect(submit).toBeDisabled()
  })

  it("has Back to sign in link that points to /login", () => {
    render(<ForgotPasswordPage />)
    const link = screen.getByRole("link", { name: /back to sign in/i })
    expect(link).toHaveAttribute("href", "/login")
  })
})
