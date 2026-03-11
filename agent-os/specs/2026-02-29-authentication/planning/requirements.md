# Authentication (Supabase) – Planning Requirements

## Feature description
Build out authentication capability using Supabase so the login page signs users in with email and password and only authenticated users can access the dashboard.

## Goals
- Replace simulated login with Supabase Auth (email + password sign-in).
- Protect dashboard routes; unauthenticated users redirect to `/login`.
- Persist session and support sign-out.

## Context
- **Login page**: Exists at `/login` (currently email-only, “Send login link” mock). Will be updated to email + password form and real Supabase sign-in.
- **Supabase**: User has created a MantraMEDS project. Project URL and publishable (anon) API key are available in the Supabase dashboard.
- **App**: Next.js 16 App Router, React 19, TypeScript. No Supabase client or auth middleware yet.

## Requirements (from spec-shaper / user)
- Username/password (email + password) sign-in via Supabase Auth only; no magic link in scope.
- Use Supabase Auth; connect app via Project URL and anon key.
- Redirect to dashboard after successful sign-in; redirect to login when unauthenticated for protected routes.
- Show clear errors for invalid credentials or API failures; generic message for wrong email/password.
- “Contact support” link remains (e.g. mailto or existing href).

## Visual references
- **login-page.png**: Sign-in card, dark theme, magenta accent. Update to email + password fields and “Sign in” button; remove “Send login link” and “link sent” success state.
- **supabase-dashboard.png**: MantraMEDS project, Authentication, Project URL, Publishable API key; enable Email provider for password sign-in.

## Out of scope (for this spec)
- Magic link; social/OAuth; MFA; sign-up/self-registration form; forgot-password; request-access integration with Supabase.

## Operator / user tasks (alongside implementation)
- Add Supabase Project URL and anon key to `.env.local` (and document in README or `.env.example`).
- In Supabase Dashboard: Authentication → Providers → Email, enable and configure (e.g. disable “Confirm email” for dev if desired). Create test users via Dashboard or API until a sign-up flow exists.
