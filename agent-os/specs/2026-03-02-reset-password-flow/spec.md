# Specification: Reset Password Flow

## Goal

Add a "Forgot Password" link on the login page and implement the full reset-password user flow: request reset via email (Supabase), land on an in-app reset page from the email link, set a new password with validation matching Supabase rules, then redirect to login. Include password visibility toggles and generic success messaging with light friction to reduce abuse.

## User Stories

- As an investor, founder, or admin, I want to request a password reset by email so that I can regain access when I forget my password.
- As a user who clicked the reset link in email, I want to set a new password on a clear in-app page and then sign in on the login page so that I know my new password works and I've saved it.

## Specific Requirements

**Forgot Password link on login**
- Place a "Forgot password" (or "Forgot Password?") link on the existing login page, directly under the password field and above the "Sign in" button.
- Style the link like the existing "Contact support" link: `text-mantra-magenta hover:underline` so it matches the design system.
- Link to a forgot-password route (e.g. `/auth/forgot-password` or `/login/forgot-password`) where the user can request a reset email.

**Password visibility toggle**
- Add a show/hide toggle (e.g. eye / eye-off icon from Lucide) to the password input on the login page and to all password inputs on the reset-password page.
- Toggle between `type="password"` and `type="text"`; keep the control accessible (e.g. aria-label) and visually consistent with the existing input-with-icon layout (e.g. icon on the right side of the input).

**Forgot-password request page**
- Provide a single route (e.g. `/auth/forgot-password`) with a form: one email field and a primary CTA (e.g. "Send reset link" or "Email reset link").
- Reuse the same layout and styling as login: centered card on dark background, MantraMeds branding, same Card/Input/Button/Label patterns, primary magenta button.
- On submit, call Supabase `auth.resetPasswordForEmail(email, { redirectTo: <app reset URL> })`. Configure Supabase so the email links to the app’s reset page (e.g. `https://<domain>/auth/reset-password` with token in fragment or query).
- Show a generic success message after submit (e.g. "If an account exists for this email, you’ll receive a link to reset your password.") so we do not reveal whether the email exists. Do not show different copy for "email not found."
- Apply light friction after several attempts (e.g. per-email cooldown or rate limit) to reduce abuse; keep UX simple (e.g. disable button for N seconds or show "Try again in X minutes" after a threshold).

**Reset-password page (from email link)**
- Add a route that Supabase’s reset email links to (e.g. `/auth/reset-password`). Read the token from the URL (Supabase typically uses hash fragment for the recovery link).
- Page shows a form: "New password", "Confirm password", and a single primary CTA "Update password." Reuse the same card, input, and button styling as login/forgot-password.
- Display Supabase’s password requirements in the UI (e.g. min length; check Supabase Auth settings and document in copy or helper text). Validate on the client (length, match) and surface Supabase’s server-side validation on submit.
- On success: do not auto-log the user in; redirect to the login page and show a short success message (e.g. toast or inline) like "Password updated. Sign in with your new password."
- On error (expired/invalid link, weak password, network): show inline error message and a "Resend reset email" link (same style as "Forgot password" / "Contact support"). Resend can navigate to forgot-password or trigger a new reset for the same user if identifiable from context; prefer not exposing email in URL.

**Auth routes and middleware**
- Allow unauthenticated access to `/auth/forgot-password` and `/auth/reset-password` (or chosen paths). Update middleware so these paths are not redirected to login when the user is logged out; optionally redirect authenticated users who visit these URLs to dashboard.
- Ensure Supabase project redirect URL (or "Site URL" / "Redirect URLs") includes the app’s reset page URL (e.g. production and dev origins).

**Consistency and roles**
- Use the same copy, layout, and behavior for all roles (investor, founder, admin). No role-specific messaging on forgot or reset flows.

**Error and edge handling**
- Forgot-password: generic success message; handle Supabase errors (e.g. rate limit) with a user-friendly message and optional cooldown.
- Reset-password: map common Supabase errors (expired link, invalid token, password too weak) to short inline messages; always offer "Resend reset email" where it makes sense.

## Visual Design

**`planning/visuals/reset-password-existing-login.png`**
- Dark background; centered card with "Sign in to your account" and "Enter your email and password to sign in."
- Email and password inputs: white/light, rounded, left-aligned envelope and lock icons; password masked. Place "Forgot password" link between the password field and the "Sign in" button.
- Primary CTA: magenta button ("Sign in"); use same style for "Send reset link" and "Update password" on the new pages.
- "Contact support" link below card: reddish-pink (`text-mantra-magenta`), underline on hover. Reuse this style for "Forgot password", "Resend reset email", and any secondary auth links.
- Add a password visibility toggle (e.g. eye icon) on the right side of the password input without changing the overall input height or layout.
- Forgot-password and reset-password pages: reuse the same logo block (M, MantraMeds, "Welcome investors!"), card width, spacing, and typography so the flows feel part of the same experience.

## Existing Code to Leverage

**`app/login/page.tsx`**
- Reuse the full layout: `min-h-screen` centering, logo + "MantraMeds" + "Welcome investors!", Card with CardHeader/CardContent, form with `space-y-4`, Label + relative div with left icon + Input, error paragraph, Button. Insert "Forgot password" link between the password field block and the submit button; add password visibility toggle to the password Input.
- Reuse "Contact support" link markup and classes (`text-mantra-magenta hover:underline`) for the new link styling.

**`lib/supabase/client.ts`**
- Use the existing `createClient()` for browser-side calls: `auth.resetPasswordForEmail()` on the forgot-password page, and on the reset page exchange the token from the URL and call `auth.updateUser({ password })` (or the Supabase recovery API as per current docs) to set the new password.

**`components/ui/card`, `components/ui/input`, `components/ui/button`, `components/ui/label`**
- Build forgot-password and reset-password pages with the same Card, Input, Button, and Label components so styling and behavior stay consistent with login.

**`middleware.ts`**
- Extend the matcher or path logic so `/auth/forgot-password` and `/auth/reset-password` are allowed for unauthenticated users; do not redirect them to `/login`. Optionally redirect authenticated users from these paths to `/dashboard`.

**`components/ui/form.tsx` (optional)**
- If using React Hook Form + Zod for the reset form (new password + confirm), use Form, FormField, FormItem, FormLabel, FormControl, FormMessage for validation and error display to match the rest of the app.

## Out of Scope

- Using Supabase’s hosted reset page instead of an in-app reset page.
- Auto-logging the user in after a successful password reset (we redirect to login).
- Changing the user’s email address as part of this flow.
- MFA, security questions, or extra verification steps.
- Audit logging or security event logging for password resets.
- Role-specific copy or behavior on forgot/reset flows.
- Custom email templates or branding for the Supabase-sent reset email (configurable in Supabase dashboard only).
- Rate limiting or friction on the main login form (only on forgot-password requests).
- Adding "Remember me" or persistent session options.
