"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CheckCircle2 } from "lucide-react"

export default function RequestAccessPage() {
  const [submitted, setSubmitted] = useState(false)

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md border-border bg-card">
          <CardContent className="flex flex-col items-center py-16 text-center">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/15">
              <CheckCircle2 className="h-8 w-8 text-emerald-400" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Request Submitted</h2>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              {"Your request has been sent to the admin team. You'll hear from us soon."}
            </p>
            <Link href="/login" className="mt-6">
              <Button variant="outline" className="border-border text-foreground">
                Back to Login
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md border-border bg-card">
        <CardHeader className="items-center pb-2 pt-8">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-mantra-magenta">
            <span className="text-lg font-bold text-primary-foreground">M</span>
          </div>
          <h1 className="text-xl font-bold text-foreground">Request Access</h1>
          <p className="text-sm text-muted-foreground">
            Fill out the form to request dashboard access
          </p>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 px-8 pb-8">
          <div className="flex flex-col gap-2">
            <Label className="text-muted-foreground">Full Name</Label>
            <Input
              placeholder="Your full name"
              className="bg-muted/50 text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-muted-foreground">Email</Label>
            <Input
              type="email"
              placeholder="you@example.com"
              className="bg-muted/50 text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-muted-foreground">Relationship</Label>
            <Select>
              <SelectTrigger className="border-border bg-muted/50 text-foreground">
                <SelectValue placeholder="Select relationship" />
              </SelectTrigger>
              <SelectContent className="border-border bg-popover">
                <SelectItem value="investor">Investor</SelectItem>
                <SelectItem value="partner">Partner</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-muted-foreground">Message</Label>
            <Textarea
              placeholder="Tell us why you need access..."
              className="bg-muted/50 text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <Button
            className="mt-2 w-full bg-mantra-magenta text-primary-foreground hover:bg-mantra-magenta/90"
            onClick={() => setSubmitted(true)}
          >
            Submit Request
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-mantra-magenta hover:underline">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
