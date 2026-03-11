"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Instagram, Users, Heart, Eye, TrendingUp, CheckCircle2 } from "lucide-react"

export default function SocialMediaPage() {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Social Media</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Instagram engagement metrics and analytics
        </p>
      </div>

      {/* Coming Soon Hero */}
      <Card className="border-mantra-magenta/20 bg-card">
        <CardContent className="flex flex-col items-center py-16 text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-mantra-magenta/10">
            <Instagram className="h-10 w-10 text-mantra-magenta" />
          </div>
          <h2 className="text-xl font-bold text-foreground">
            Instagram Analytics Coming Soon
          </h2>
          <p className="mt-2 max-w-md text-sm text-muted-foreground leading-relaxed">
            {"We're building a comprehensive Instagram analytics dashboard to track follower growth, engagement, reach, and top-performing content."}
          </p>

          {/* Email Signup */}
          <div className="mt-8 w-full max-w-sm">
            {submitted ? (
              <div className="flex items-center justify-center gap-2 text-emerald-400">
                <CheckCircle2 className="h-5 w-5" />
                <span className="text-sm font-medium">
                  {"You'll be notified when this goes live!"}
                </span>
              </div>
            ) : (
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-muted/50 text-foreground placeholder:text-muted-foreground"
                />
                <Button
                  onClick={() => email && setSubmitted(true)}
                  className="bg-mantra-magenta text-primary-foreground hover:bg-mantra-magenta/90"
                >
                  Notify Me
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Wireframe Preview */}
      <div>
        <h3 className="mb-4 text-sm font-medium uppercase tracking-wider text-muted-foreground">
          Preview of Upcoming Features
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Follower Count", icon: Users, value: "--" },
            { label: "Engagement Rate", icon: Heart, value: "--" },
            { label: "Reach", icon: Eye, value: "--" },
            { label: "Impressions", icon: TrendingUp, value: "--" },
          ].map((item) => (
            <Card key={item.label} className="border-dashed border-border bg-card/50">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <item.icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{item.label}</p>
                  <p className="text-2xl font-bold text-muted-foreground/50">{item.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Wireframe Charts */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card className="border-dashed border-border bg-card/50">
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              Reach & Impressions Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground/50">
              Chart coming soon
            </div>
          </CardContent>
        </Card>
        <Card className="border-dashed border-border bg-card/50">
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Top Posts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground/50">
              Top posts feed coming soon
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
