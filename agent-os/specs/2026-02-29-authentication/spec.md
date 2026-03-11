# Specification: Authentication with Supabase (Email & Password)

## Goal
Connect the MantraMeds login page to Supabase Auth so users sign in with email and password, with protected dashboard routes and session persistence. Operator tasks (env vars and Supabase dashboard config) are documented so they can be done alongside implementation.

## User Stories
- As an investor, I want to enter my email and password and sign in so that I can access the dashboard.
- As an investor, I want to be redirected to the dashboard after signing in successfully so that I can use the app.
- As an unauthenticated visitor, I want to be redirected to the login page when I try to open the dashboard so that only allowed users access it.

## Specific Requirements

**Supabase client and environment**
- Add `@supabase/supabase-js` and, for Next.js App Router, `@supabase/ssr` (or recommended Supabase + Next.js pattern). Use one Supabase client for server (e.g. cookies) and one for client where needed.
- Require two env vars: `NEXT_PUBLIC_SUPABASE_URL` (Project URL) and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (publishable anon key). Document them in README or `.env.example`; do not commit secrets.
- Operator: add Project URL and anon key from Supabase dashboard to `.env.local` before running the app.

**Email/password sign-in on login page**
- Login form must collect email and password. Use Supabase Auth `signInWithPassword({ email, password })`. On success, set session (cookies via Supabase SSR helpers) and redirect to `/dashboard` (or `redirectTo` from query if present).
- Validate email format and non-empty password client-side before calling Supabase. Show a single, clear error message for validation or Supabase errors (e.g. “Invalid email or password”, “Too many attempts”, “Something went wrong”). Do not expose whether email exists or password was wrong; use a generic message for invalid credentials.
- Keep loading state on the submit button (e.g. spinner + “Signing in…”) while the sign-in request is in progress. No separate “success” screen; success is redirect to dashboard.

**Route protection**
- Protect all routes under `/dashboard` (and any other authenticated routes). Unauthenticated requests should redirect to `/login`, with optional `?redirectTo=` for post-login redirect. Use middleware or server layout/layout-level auth check consistent with Next.js App Router and Supabase SSR (e.g. refresh session in middleware and redirect if no session).
- Allow public access to `/login` and `/request-access`. If the user is already authenticated and visits `/login`, redirect them to `/dashboard`.

**Session persistence and sign-out**
- Use Supabase’s recommended cookie-based session for Next.js (server and client) so that refresh works and the dashboard sees the same user. Ensure middleware or server components can read the session for protection and optional UI (e.g. user email in sidebar).
- Sidebar already has a “Log out” control; wire it to Supabase sign-out and redirect to `/login` after clearing session.

**Error handling**
- Handle invalid credentials, network errors, and Supabase API errors on the login page with a user-friendly message. Respect project validation/error-handling standards: server-side checks where applicable, clear messages, no exposure of internal errors.

**Operator: Supabase Dashboard**
- Operator must enable Email provider (Authentication → Providers → Email) and ensure “Confirm email” is configured per need (e.g. disable for dev so password sign-in works without verification). Users must exist in Supabase (created via Dashboard, API, or a future sign-up flow out of scope).

## Visual Design

**`planning/visuals/login-page.png`**
- Centered card on dark background with “Sign in to your account.” Update copy from “Enter your email and we'll send you a login link” to something like “Enter your email and password to sign in.”
- Email address label and input (envelope icon, placeholder e.g. you@example.com). Add password field: label “Password”, type password, appropriate placeholder or none.
- Single primary submit button: “Sign in” or “Sign in →” (magenta), no “Send login link.” No success state screen; success is redirect.
- “Contact support” link below card (magenta); keep as-is (e.g. mailto or existing href).
- Preserve existing layout, typography, and MantraMeds branding (logo “M”, “MantraMeds”, “Welcome investors!”).

**`planning/visuals/supabase-dashboard.png`**
- Reference for where to obtain Project URL and Publishable (anon) API key (Connect to your project).
- Confirms Authentication product; operator uses this to enable Email provider (email + password) and optional URL Configuration if needed.

## Existing Code to Leverage

**`app/login/page.tsx`**
- Reuse layout: Card/CardHeader/CardContent, form, loading/error states, “Contact support” link, branding. Replace current flow: add password state and input, remove “link sent” success state, call `signInWithPassword` and on success redirect to dashboard (server-side cookie set may happen in a server action or after client sign-in via SSR helpers).

**`components/ui/card`, `components/ui/input`, `components/ui/button`, `components/ui/label`**
- Continue using these for the login form and any auth-related UI for consistency.

**`components/layout/app-sidebar.tsx`**
- Use existing “Log out” control; add Supabase sign-out and redirect to `/login` without changing layout or nav structure.

**`app/dashboard/layout.tsx`**
- Keep layout as-is; add auth check (middleware or layout-level) so that unauthenticated users never reach this layout and are redirected to `/login`.

**`lib/utils.ts`**
- Use `cn()` for any new auth UI class merging if needed; follow existing styling patterns.

## Out of Scope
- Magic link / OTP / passwordless email sign-in.
- Sign-up or self-registration form (users created via Supabase Dashboard, API, or a separate future flow).
- Social or OAuth providers (Google, GitHub, etc.).
- Multi-factor authentication (MFA).
- Forgot-password or reset-password flow.
- Custom Supabase email templates or SMTP (beyond defaults).
- Integrating the request-access form with Supabase; remains standalone.
- Invite-only or allowlist enforcement in Supabase; can be added later.
- Session timeout or “remember me” beyond Supabase default behavior.
