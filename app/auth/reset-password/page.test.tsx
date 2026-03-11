import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import ResetPasswordPage from "@/app/auth/reset-password/page"

const mockReplace = vi.fn()
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: mockReplace }),
}))

const mockUpdateUser = vi.fn()
const mockGetSession = vi.fn()

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      getSession: mockGetSession,
      updateUser: mockUpdateUser,
    },
  }),
}))

describe("Reset password page", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetSession.mockResolvedValue({
      data: { session: { user: {} } },
      error: null,
    })
    mockUpdateUser.mockResolvedValue({ data: { user: {} }, error: null })
  })

  it("shows new password and confirm password fields and Update password CTA", async () => {
    render(<ResetPasswordPage />)
    await vi.waitFor(() => {
      expect(screen.getByLabelText(/new password/i)).toBeInTheDocument()
    })
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /update password/i })).toBeInTheDocument()
  })

  it("shows client-side validation when passwords do not match", async () => {
    const user = userEvent.setup()
    render(<ResetPasswordPage />)
    await vi.waitFor(() => {
      expect(screen.getByLabelText(/new password/i)).toBeInTheDocument()
    })
    await user.type(screen.getByLabelText(/new password/i), "password123")
    await user.type(screen.getByLabelText(/confirm password/i), "password456")
    await user.click(screen.getByRole("button", { name: /update password/i }))
    expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument()
  })

  it("shows Resend reset email link when session is invalid", async () => {
    mockGetSession.mockResolvedValueOnce({
      data: { session: null },
      error: null,
    })
    render(<ResetPasswordPage />)
    await vi.waitFor(() => {
      expect(screen.getByRole("link", { name: /resend reset email/i })).toBeInTheDocument()
    })
  })

  it("calls updateUser and redirects to login on successful submit", async () => {
    const user = userEvent.setup()
    render(<ResetPasswordPage />)
    await vi.waitFor(() => {
      expect(screen.getByLabelText(/new password/i)).toBeInTheDocument()
    })
    await user.type(screen.getByLabelText(/new password/i), "newpassword123")
    await user.type(screen.getByLabelText(/confirm password/i), "newpassword123")
    await user.click(screen.getByRole("button", { name: /update password/i }))

    await vi.waitFor(() => {
      expect(mockUpdateUser).toHaveBeenCalledWith({ password: "newpassword123" })
    })
    expect(mockReplace).toHaveBeenCalledWith(
      expect.stringMatching(/\/login(\?.*)?$/)
    )
  })

  it("has Resend reset email link on form that points to /auth/forgot-password", async () => {
    render(<ResetPasswordPage />)
    await vi.waitFor(() => {
      expect(screen.getByLabelText(/new password/i)).toBeInTheDocument()
    })
    const link = screen.getByRole("link", { name: /resend reset email/i })
    expect(link).toHaveAttribute("href", "/auth/forgot-password")
  })
})
