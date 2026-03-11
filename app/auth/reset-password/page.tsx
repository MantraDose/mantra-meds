"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Lock, Loader2, ArrowRight, Eye, EyeOff } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"

const MIN_PASSWORD_LENGTH = 6

export default function ResetPasswordPage() {
  const router = useRouter()
  const [ready, setReady] = useState<boolean | null>(null)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    let cancelled = false
    const supabase = createClient()
    const check = () => {
      supabase.auth.getSession().then(({ data }) => {
        if (cancelled) return
        if (data.session) {
          setReady(true)
          return
        }
        const hasHash = typeof window !== "undefined" && window.location.hash?.includes("type=recovery")
        if (hasHash) {
          setTimeout(() => {
            if (cancelled) return
            supabase.auth.getSession().then(({ data: retry }) => {
              if (cancelled) return
              setReady(!!retry.session)
            })
          }, 300)
        } else {
          setReady(false)
        }
      })
    }
    check()
    return () => {
      cancelled = true
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`)
      return
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    setIsLoading(true)
    try {
      const supabase = createClient()
      const { error: updateError } = await supabase.auth.updateUser({ password })

      if (updateError) {
        const msg = updateError.message?.toLowerCase() ?? ""
        if (msg.includes("expired") || msg.includes("invalid") || msg.includes("link")) {
          setError("This link has expired or is invalid. Request a new one below.")
        } else if (msg.includes("password") || msg.includes("weak")) {
          setError("Password does not meet requirements. Use at least 6 characters.")
        } else {
          setError("Something went wrong. Please try again.")
        }
        setIsLoading(false)
        return
      }

      router.replace("/login?message=Password+updated.+Sign+in+with+your+new+password.")
    } catch {
      setError("Something went wrong. Please try again.")
      setIsLoading(false)
    }
  }

  if (ready === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-sm flex flex-col items-center justify-center gap-4">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-2xl font-bold text-primary-foreground">
            M
          </div>
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading…</p>
        </div>
      </div>
    )
  }

  if (ready === false) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-2xl font-bold text-primary-foreground">
              M
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">MantraMeds</h1>
            <p className="mt-1 text-sm text-muted-foreground">Welcome investors!</p>
          </div>
          <Card className="border-border/50">
            <CardHeader className="text-center">
              <CardTitle className="text-lg">Invalid or expired link</CardTitle>
              <CardDescription>
                This password reset link has expired or is invalid. Request a new one below.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-center text-sm">
                <Link
                  href="/auth/forgot-password"
                  className="text-mantra-magenta hover:underline"
                >
                  Resend reset email
                </Link>
              </p>
              <p className="text-center text-sm">
                <Link href="/login" className="text-mantra-magenta hover:underline">
                  Back to sign in
                </Link>
              </p>
            </CardContent>
          </Card>
          <p className="mt-6 text-center text-xs text-muted-foreground">
            <a href="mailto:team@mantradose.com" className="text-mantra-magenta hover:underline">
              Contact support
            </a>{" "}
            if you need assistance.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-2xl font-bold text-primary-foreground">
            M
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">MantraMeds</h1>
          <p className="mt-1 text-sm text-muted-foreground">Welcome investors!</p>
        </div>

        <Card className="border-border/50">
          <CardHeader className="text-center">
            <CardTitle className="text-lg">Set new password</CardTitle>
            <CardDescription>
              Enter your new password below. Use at least {MIN_PASSWORD_LENGTH} characters.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">New password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    disabled={isLoading}
                    autoComplete="new-password"
                    aria-invalid={!!error}
                    minLength={MIN_PASSWORD_LENGTH}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:text-foreground focus:outline-none rounded"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    tabIndex={0}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" aria-hidden />
                    ) : (
                      <Eye className="h-4 w-4" aria-hidden />
                    )}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">
                  At least {MIN_PASSWORD_LENGTH} characters
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 pr-10"
                    disabled={isLoading}
                    autoComplete="new-password"
                    aria-invalid={!!error}
                    minLength={MIN_PASSWORD_LENGTH}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:text-foreground focus:outline-none rounded"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    tabIndex={0}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" aria-hidden />
                    ) : (
                      <Eye className="h-4 w-4" aria-hidden />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Updating…
                  </>
                ) : (
                  <>
                    Update password
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            <p className="mt-4 text-center text-sm">
              <Link
                href="/auth/forgot-password"
                className="text-mantra-magenta hover:underline"
              >
                Resend reset email
              </Link>
            </p>
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          <a href="mailto:team@mantradose.com" className="text-mantra-magenta hover:underline">
            Contact support
          </a>{" "}
          if you need assistance.
        </p>
      </div>
    </div>
  )
}
