# Task Breakdown: Authentication with Supabase (Email & Password)

## Overview

Total task groups: 6. After each group, **pause so you can check** before continuing.

Operator (you) tasks are clearly marked; complete them when indicated so the next group can proceed.

---

## Task List

### Task Group 1: Setup & operator (you)

**Dependencies:** None

- [x] 1.0 Complete setup and operator checklist
  - [x] 1.1 Install Supabase packages
    - Add `@supabase/supabase-js` and `@supabase/ssr` (Next.js App Router / SSR support)
    - Use project package manager (pnpm)
  - [x] 1.2 Document environment variables
    - Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to `.env.example` (create if missing) with short comments
    - In README, add a short “Environment variables” or “Supabase” subsection describing these two vars and where to get them (Supabase project → Settings → API)
    - Do not commit real secrets
  - [x] 1.3 **Operator (you):** Add Supabase credentials to `.env.local`
    - Set `NEXT_PUBLIC_SUPABASE_URL` to your Project URL (Supabase Dashboard → Project Settings → API)
    - Set `NEXT_PUBLIC_SUPABASE_ANON_KEY` to your project’s anon/public key
    - Verify app can read env (e.g. run dev and confirm no missing-env errors when Supabase client is used later)
  - [x] 1.4 **Operator (you):** Configure Supabase Dashboard for email/password
    - Authentication → Providers → Email: enable Email provider
    - If you want to sign in without email confirmation in dev: turn off “Confirm email” (or create a confirmed test user via Dashboard)
    - Create at least one test user (Authentication → Users → Add user) with email and password for testing

**Acceptance criteria**

- Supabase packages are installed and listed in `package.json`
- `.env.example` and README document the two env vars
- `.env.local` contains both vars (you complete this)
- Email provider is enabled in Supabase; at least one test user exists (you complete this)

**⏸ Pause for your review** — Confirm env vars and Supabase config, then continue to Task Group 2.

---

### Task Group 2: Supabase client & session plumbing

**Dependencies:** Task Group 1

- [x] 2.0 Complete Supabase client and session utilities
  - [x] 2.1 Create server-side Supabase client helper
  - [x] 2.2 Create client-side Supabase client helper
  - [x] 2.3 Add middleware Supabase session refresh (optional but recommended)

**Acceptance criteria**

- Server and client Supabase clients exist and use the same env vars
- Middleware refreshes session and updates cookies when present
- No redirect logic in this group; only client creation and session refresh

**⏸ Pause for your review** — Confirm Supabase clients and middleware refresh work, then continue to Task Group 3.

---

### Task Group 3: Login page (email + password)

**Dependencies:** Task Group 2

- [x] 3.0 Complete login page with Supabase sign-in
  - [x] 3.1 Update login form UI
    - Keep existing layout: Card, branding (logo “M”, MantraMeds, “Welcome investors!”), “Contact support” link
    - Change CardDescription to: “Enter your email and password to sign in.” (or equivalent)
    - Add password field: Label “Password”, type `password`, reuse `Input` and styling (e.g. icon optional)
    - Change primary button label to “Sign in” or “Sign in →”; remove “Send login link”
    - Remove the “We sent a login link to…” / “Use a different email” success state entirely
    - Match visual design in `planning/visuals/login-page.png` (centered card, dark theme, magenta primary button)
  - [x] 3.2 Implement sign-in flow
    - On submit: validate email format and non-empty password client-side; show a single error message for validation failures
    - Call Supabase `signInWithPassword({ email, password })` via the client-side Supabase client
    - On success: ensure session is stored (cookies set via SSR pattern, e.g. in a server action that uses server client to set cookie, or by redirecting to an route that sets cookie); redirect to `/dashboard` or to `redirectTo` from query if present
    - On error: show a single, generic message (e.g. “Invalid email or password”) for invalid credentials; do not reveal whether email exists or password was wrong; show a user-friendly message for network or server errors
  - [x] 3.3 Add loading and error state
    - Disable submit button and show spinner + “Signing in…” while request is in progress
    - Display error message below form or near submit button; clear on next submit

**Acceptance criteria**

- Login form has email and password fields and “Sign in” CTA; no magic-link success screen
- Valid credentials sign in and redirect to dashboard (or redirectTo)
- Invalid credentials and errors show a single, generic/user-friendly message
- Loading state works during sign-in

**⏸ Pause for your review** — Test sign-in with your test user, then continue to Task Group 4.

---

### Task Group 4: Route protection & redirects

**Dependencies:** Task Group 2

- [x] 4.0 Protect dashboard and handle redirects
  - [x] 4.1 Redirect unauthenticated users from protected routes
  - [x] 4.2 Redirect authenticated users away from login
  - [x] 4.3 Ensure dashboard layout or pages do not rely solely on client-side auth

**Acceptance criteria**

- Visiting `/dashboard` (or any dashboard sub-route) while logged out redirects to `/login`
- Visiting `/login` while logged in redirects to `/dashboard`
- `/request-access` stays public

**⏸ Pause for your review** — Verify redirect behavior when logged in and out, then continue to Task Group 5.

---

### Task Group 5: Sign-out

**Dependencies:** Task Group 2, 4

- [x] 5.0 Wire sign-out in sidebar
  - [x] 5.1 Implement sign-out and redirect
    - In `components/layout/app-sidebar.tsx`, find the existing “Log out” control
    - On click: call Supabase `signOut()` (client-side client), then redirect to `/login` (e.g. `router.push('/login')` or `window.location.href = '/login'`)
    - Ensure cookie/session is cleared by Supabase signOut so middleware will see no session on next request

**Acceptance criteria**

- Clicking “Log out” in the sidebar signs the user out and redirects to `/login`
- After sign-out, navigating to `/dashboard` again redirects to `/login`

**⏸ Pause for your review** — Test full flow: sign in → dashboard → sign out → confirm redirect and protection.

---

### Task Group 6: Focused testing (optional)

**Dependencies:** Task Groups 1–5

- [x] 6.0 Add and run focused auth tests only
  - [x] 6.1 Add 2–8 focused tests for critical auth behavior
  - [x] 6.2 Run only the new auth tests

**Acceptance criteria**

- A small set of focused auth tests exists and passes
- No requirement to run the entire application test suite

**⏸ Pause for your review** — Run the auth tests and confirm they pass.

---

## Operator (you) checklist

Do these yourself; they are not implemented by code:

- [x] Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to `.env.local` (see Task 1.3)
- [x] In Supabase Dashboard: enable Email provider; configure “Confirm email” as needed; create at least one test user (see Task 1.4)

---

## Execution order

1. **Task Group 1** — Setup & operator (you) → ⏸ pause
2. **Task Group 2** — Supabase client & session → ⏸ pause
3. **Task Group 3** — Login page (email + password) → ⏸ pause
4. **Task Group 4** — Route protection & redirects → ⏸ pause
5. **Task Group 5** — Sign-out → ⏸ pause
6. **Task Group 6** — Focused testing (optional) → ⏸ pause

After each group, pause and check the behavior before starting the next group.
