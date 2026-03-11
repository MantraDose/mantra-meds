"use client"

import { useState } from "react"
import Link from "next/link"
import { Mail, Loader2, ArrowRight } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const COOLDOWN_REQUESTS = 5
const COOLDOWN_MS = 60_000

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [requestCountByEmail, setRequestCountByEmail] = useState<Record<string, number>>({})
  const [cooldownUntil, setCooldownUntil] = useState<number | null>(null)

  const getResetRedirectUrl = () => {
    if (typeof window === "undefined") return ""
    return `${window.location.origin}/auth/reset-password`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess(false)

    const trimmedEmail = email.trim().toLowerCase()
    if (!trimmedEmail) {
      setError("Please enter your email address")
      return
    }
    if (!EMAIL_REGEX.test(trimmedEmail)) {
      setError("Please enter a valid email address")
      return
    }

    const now = Date.now()
    if (cooldownUntil !== null && now < cooldownUntil) {
      const minutes = Math.ceil((cooldownUntil - now) / 60000)
      setError(`Too many attempts. Please try again in ${minutes} minute${minutes !== 1 ? "s" : ""}.`)
      return
    }

    const count = (requestCountByEmail[trimmedEmail] ?? 0) + 1
    setRequestCountByEmail((prev) => ({ ...prev, [trimmedEmail]: count }))

    if (count >= COOLDOWN_REQUESTS) {
      setCooldownUntil(now + COOLDOWN_MS)
      setError("Too many attempts. Please try again in about 1 minute.")
      return
    }

    setIsLoading(true)
    const redirectTo = getResetRedirectUrl()

    try {
      const supabase = createClient()
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
        redirectTo,
      })

      if (resetError) {
        if (resetError.message?.toLowerCase().includes("rate") || resetError.status === 429) {
          setError("Too many attempts. Please try again later.")
          setCooldownUntil(Date.now() + COOLDOWN_MS)
        } else {
          setError("Something went wrong. Please try again.")
        }
        setIsLoading(false)
        return
      }

      setSuccess(true)
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const now = Date.now()
  const inCooldown = cooldownUntil !== null && now < cooldownUntil
  const cooldownMinutes = cooldownUntil != null ? Math.ceil((cooldownUntil - now) / 60000) : 0

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
            <CardTitle className="text-lg">Reset your password</CardTitle>
            <CardDescription>
              Enter your email and we&apos;ll send you a link to set a new password.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    disabled={isLoading}
                    autoComplete="email"
                    aria-invalid={!!error}
                  />
                </div>
              </div>

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}

              {success && (
                <p className="text-sm text-muted-foreground">
                  If an account exists for this email, you&apos;ll receive a link to reset your password.
                </p>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || inCooldown}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending…
                  </>
                ) : inCooldown ? (
                  `Try again in ${cooldownMinutes} min`
                ) : (
                  <>
                    Send reset link
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            <p className="mt-4 text-center">
              <Link
                href="/login"
                className="text-sm text-mantra-magenta hover:underline"
              >
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
