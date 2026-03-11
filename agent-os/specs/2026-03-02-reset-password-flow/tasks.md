# Task Breakdown: Reset Password Flow

## Overview

Total Tasks: 5 task groups (Auth & routing, Login updates, Forgot-password page, Reset-password page, Test review).

This feature adds a Forgot Password link, password visibility toggles, and two new pages (forgot-password, reset-password) using Supabase Auth. No new database or API layer.

## Task List

### Auth & Routing

#### Task Group 1: Middleware and route structure

**Dependencies:** None

- [x] 1.0 Auth routes and middleware
  - [x] 1.1 Update middleware to allow unauthenticated access to `/auth/forgot-password` and `/auth/reset-password`
    - Do not redirect these paths to `/login` when user is not logged in
    - Optionally redirect authenticated users who visit these URLs to `/dashboard`
  - [x] 1.2 Add route structure for auth flows
    - Create `app/auth/forgot-password/page.tsx` (placeholder or minimal page if building in later group)
    - Create `app/auth/reset-password/page.tsx` (placeholder or minimal page if building in later group)
    - Ensure paths match what will be set in Supabase redirect URL
  - [x] 1.3 Document Supabase redirect URL requirement
    - Add a short note in spec implementation folder or README: Supabase Dashboard → Authentication → URL Configuration must include the app’s reset page (e.g. `https://<domain>/auth/reset-password`) for production and dev

**Acceptance Criteria:**

- Unauthenticated users can reach `/auth/forgot-password` and `/auth/reset-password` without being redirected to login
- Authenticated users visiting those URLs are redirected to dashboard (or behavior is explicitly documented)
- Route files exist and do not 404

**⏸ Pause for your review** — Verify routes and middleware behavior before continuing to Task Group 2.

### Login Page Updates

#### Task Group 2: Forgot link and password toggle on login

**Dependencies:** Task Group 1

- [x] 2.0 Login page enhancements
  - [x] 2.1 Write 2–6 focused tests for login page reset flow entry points
    - Test that "Forgot password" link is present and points to `/auth/forgot-password` (or chosen path)
    - Test that password visibility toggle toggles input type and is accessible
    - Optionally test link styling (class includes `text-mantra-magenta`)
    - Skip exhaustive form or auth tests
  - [x] 2.2 Add "Forgot password" link to login page
    - Place directly under the password field, above the "Sign in" button
    - Use same style as "Contact support": `text-mantra-magenta hover:underline`
    - Link to `/auth/forgot-password` (or chosen path)
    - Reuse layout from `app/login/page.tsx`
  - [x] 2.3 Add password visibility toggle to login password input
    - Use eye / eye-off icon (e.g. Lucide) on the right side of the input
    - Toggle between `type="password"` and `type="text"`
    - Add accessible label (e.g. aria-label "Show password" / "Hide password")
    - Keep existing left-aligned lock icon and input height/layout
  - [x] 2.4 Run login-page-focused tests only
    - Run ONLY the tests written in 2.1
    - Do not run the full test suite

**Acceptance Criteria:**

- "Forgot password" link is visible between password field and Sign in button and navigates to forgot-password page
- Password can be shown/hidden via toggle; toggle is accessible
- Tests from 2.1 pass

**⏸ Pause for your review** — Check the login page (link + toggle) before continuing to Task Group 3.

### Forgot-Password Page

#### Task Group 3: Forgot-password request flow

**Dependencies:** Task Group 1, 2

- [x] 3.0 Forgot-password page
  - [x] 3.1 Write 2–6 focused tests for forgot-password flow
    - Test page renders with email field and submit CTA
    - Test submit calls Supabase `resetPasswordForEmail` with correct redirectTo (or equivalent)
    - Test generic success message is shown after submit (no "email not found" copy)
    - Test cooldown/friction after several submits (e.g. button disabled or message shown)
    - Skip full E2E email delivery
  - [x] 3.2 Build forgot-password page UI
    - Reuse login layout: centered card, MantraMeds branding (logo M, "MantraMeds", "Welcome investors!"), same Card/Input/Button/Label
    - Single email field (envelope icon, same as login) and primary CTA (e.g. "Send reset link")
    - Match `planning/visuals/reset-password-existing-login.png` styling (dark background, magenta button)
  - [x] 3.3 Implement submit and Supabase integration
    - On submit: validate email format; call `createClient().auth.resetPasswordForEmail(email, { redirectTo: <app reset URL> })`
    - redirectTo must be the app’s reset page (e.g. `${origin}/auth/reset-password` or from env)
    - Show generic success message (e.g. "If an account exists for this email, you'll receive a link to reset your password.")
    - On Supabase error (e.g. rate limit): show user-friendly message; optionally trigger cooldown
  - [x] 3.4 Add per-email cooldown or light friction
    - After N requests (e.g. 3–5) from same email or IP, apply cooldown (e.g. disable button for 60s or "Try again in X minutes")
    - Use in-memory or client-safe approach for MVP; avoid revealing whether email exists
  - [x] 3.5 Run forgot-password tests only
    - Run ONLY the tests written in 3.1
    - Do not run the full test suite

**Acceptance Criteria:**

- Forgot-password page matches login visual style; submit sends reset email via Supabase
- Generic success message always shown; no email-existence disclosure
- Cooldown/friction applies after several attempts; tests from 3.1 pass

**⏸ Pause for your review** — Test the forgot-password flow (submit, success message, cooldown) before continuing to Task Group 4.

### Reset-Password Page

#### Task Group 4: Reset-password form and token handling

**Dependencies:** Task Group 1

- [x] 4.0 Reset-password page
  - [x] 4.1 Write 2–6 focused tests for reset-password flow
    - Test page reads token from URL (hash fragment or query as per Supabase)
    - Test form has new password and confirm password fields and "Update password" CTA
    - Test client-side validation (min length, match); test error state shows "Resend reset email" link
    - Test success redirects to login with success message (no auto-login)
    - Skip full token exchange with Supabase in unit tests if complex; mock if needed
  - [x] 4.2 Implement token reading and session recovery
    - On load, read recovery token from URL (Supabase uses hash fragment; use `window.location.hash` or Supabase client recovery helpers if available)
    - Ensure Supabase client can use the token for the update password call (e.g. `updateUser` after recovery session is established per Supabase docs)
  - [x] 4.3 Build reset-password form
    - Reuse same card and layout as login/forgot-password; MantraMeds branding
    - Fields: "New password", "Confirm password"; both with password visibility toggle (right-side eye icon)
    - Display Supabase password requirements (e.g. min length) as helper text; validate length and match on client
    - Primary CTA: "Update password"
  - [x] 4.4 Implement submit and success/error handling
    - On submit: call Supabase to update password (e.g. `auth.updateUser({ password })` after recovery); on success redirect to `/login` with success message (e.g. query param or toast "Password updated. Sign in with your new password.")
    - On error (expired/invalid token, weak password): show inline error message; show "Resend reset email" link (same style as "Forgot password" / "Contact support") linking to `/auth/forgot-password`
  - [x] 4.5 Run reset-password tests only
    - Run ONLY the tests written in 4.1
    - Do not run the full test suite

**Acceptance Criteria:**

- Reset page accepts token from email link; form validates and submits to Supabase
- Success: redirect to login with message; no auto-login
- Error: inline message + "Resend reset email" link; tests from 4.1 pass

**⏸ Pause for your review** — Test the full reset flow (email link → set password → login) before continuing to Task Group 5.

### Testing

#### Task Group 5: Test review and gap analysis

**Dependencies:** Task Groups 2, 3, 4

- [x] 5.0 Review tests and add critical E2E coverage
  - [x] 5.1 Review tests from Task Groups 2–4
    - Review tests from 2.1 (login link + toggle)
    - Review tests from 3.1 (forgot-password submit + success + cooldown)
    - Review tests from 4.1 (reset form, validation, redirect)
    - Total existing: approximately 6–18 tests
  - [x] 5.2 Identify critical workflow gaps for this feature only
    - e.g. Full flow: login → Forgot password → email (mocked) → reset page → update password → redirect to login
    - Focus on integration between login, forgot-password, and reset-password routes
  - [x] 5.3 Add up to 10 additional strategic tests
    - Integration or E2E tests for the reset flow (mock Supabase or use test client if available)
    - Do not add exhaustive edge-case or accessibility tests unless critical
  - [x] 5.4 Run feature-specific tests only
    - Run ONLY tests related to this spec (2.1, 3.1, 4.1, 5.3)
    - Expected total: approximately 16–28 tests
    - Do not run the entire application test suite

**Acceptance Criteria:**

- All feature-specific tests pass
- Critical user workflows (forgot → reset → login) have coverage
- No more than 10 additional tests added in 5.3

**⏸ Pause for your review** — Run the feature test suite and confirm everything passes before considering the spec complete.

## Execution Order

Recommended sequence (pause after each group to verify work before continuing):

1. **Auth & routing** (Task Group 1) – middleware and route structure first
2. **Login page updates** (Task Group 2) – Forgot link and password toggle
3. **Forgot-password page** (Task Group 3) – can start once routes exist; parallel with 4 if desired
4. **Reset-password page** (Task Group 4) – token handling and form
5. **Test review** (Task Group 5) – after 2, 3, 4 are implemented

Task Groups 3 and 4 can be implemented in parallel after Group 1 and 2.

## Reference

- **Spec:** `agent-os/specs/2026-03-02-reset-password-flow/spec.md`
- **Visual:** `agent-os/specs/2026-03-02-reset-password-flow/planning/visuals/reset-password-existing-login.png`
