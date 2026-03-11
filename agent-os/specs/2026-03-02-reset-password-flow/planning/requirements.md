# Spec Requirements: Reset Password Flow

## Initial Description

let's add a 'Forgot Password' link and design/build out the 'reset password' user flows. Supabase already sends out the 'reset password' email so we need a flow to handle that functionality.

## Requirements Discussion

### First Round Questions

**Q1:** I'm assuming the "Forgot password?" link should live on the existing login screen (e.g. the MantraMeds sign-in UI you have), directly under the password field and above the primary "Sign in" button. Is that correct, or would you prefer it elsewhere (e.g. under the button or in the page footer)?

**Answer:** Your first assumption is correct. Under the password field and above the Sign In button.

**Q2:** For the Supabase reset email, I'm assuming we'll configure it to deep-link into a Next.js route in this app (e.g. `/auth/reset-password`), where the user sets a new password using Supabase's token. Is that the desired approach, or should the app instead rely on Supabase's hosted reset page?

**Answer:** Your first assumption is correct.

**Q3:** On the reset page itself, I'm thinking a two-field "New password / Confirm password" form with inline validation (min length, strength hint, match check) and a single "Update password" CTA. Do you want any specific password rules (length, symbols, etc.) or strength UI beyond basic validation?

**Answer:** Yes please. Let's indicate the requirements of the password so that they match Supabase's requirements.

**Q4:** After a successful reset, I'm assuming we should auto-log the user in and redirect them to the main dashboard, with a toast like "Password updated successfully." Should we do that, or would you prefer sending them back to the login page to sign in manually?

**Answer:** Let's send them back to the login page. Just to make sure they've saved the password somewhere and can retrieve it.

**Q5:** For failure states (expired/invalid token, user not found, password too weak, Supabase error), should we surface inline error messaging on the reset form and offer a "Resend reset email" action, or is a simple message plus link back to login/forgot-password enough?

**Answer:** Yes, let's offer a resend email link along with the inline error messaging.

**Q6:** Do you want any rate limiting or friction on the "Forgot password" request (e.g. cooldown per email, generic success message that doesn't reveal whether the email exists) to avoid account enumeration and abuse, or keep it minimal for now?

**Answer:** Let's use generic success messaging and add a bit of friction after a few login attempts.

**Q7:** Should this flow behave identically for all roles (investor, founder, admin), or are there any role-specific UX or copy differences you'd like (e.g. different confirmation text for admins)?

**Answer:** This flow should behave identically for all roles.

**Q8:** Is there anything explicitly out of scope for this iteration (e.g. changing email address, MFA setup, security questions, audit logging) that we should avoid including in the reset-password spec?

**Answer:** Not specified.

### Existing Code to Reference

We've got the login form component to draw from.

### Follow-up Questions

None asked.

## Visual Assets

### Files Provided:

- `reset-password-existing-login.png`: Current MantraMeds login screen. Dark theme; pink/white branding with logo and "Welcome investors!"; dark grey rounded card with "Sign in to your account" form. Email and password inputs (white, rounded, envelope and lock icons). Password field shows masked input; no visibility toggle. Pink "Sign In" button below password. Reddish-pink "Contact support" link at bottom. No "Forgot Password" link; placement for it is between password field and Sign In button. Establishes styling for new link and reset pages (dark background, white inputs, magenta primary button, link-style secondary actions).

### Visual Insights:

- Forgot Password link should sit in the gap between the password input and the Sign In button, using the same link style as "Contact support" (reddish-pink text).
- Password fields should gain a show/hide toggle (e.g. eye icon) on both login and reset forms.
- Reset and forgot-password pages should reuse: dark background, white rounded inputs with left icons, magenta primary CTA, same card and typography.
- High-fidelity screenshot of existing UI; new flows should match this design system.

## Requirements Summary

### Functional Requirements

- Add a "Forgot Password" link on the login page: under the password field, above the Sign In button.
- Forgot-password flow: user enters email; app triggers Supabase password reset; show generic success message; apply friction after several attempts (e.g. rate limiting / cooldown).
- Reset-password flow: Supabase email links to an in-app route (e.g. `/auth/reset-password`); page shows New password + Confirm password with inline validation matching Supabase requirements; display those requirements in UI; single "Update password" CTA.
- After successful reset: redirect to login page (no auto-login); user signs in with new password.
- On reset errors (expired/invalid token, weak password, etc.): inline error messaging plus "Resend reset email" link.
- Password visibility toggle on all password fields (login and reset).
- Flow and copy identical for all roles (investor, founder, admin).

### Reusability Opportunities

- Reuse existing login form components, input styling, and card layout for forgot-password and reset-password pages.
- Follow existing link styling (e.g. "Contact support") for "Forgot Password" and "Resend reset email".
- Supabase auth client and env already in use; extend for `resetPasswordForEmail` and `updateUser` (or equivalent) for the new flows.

### Scope Boundaries

**In Scope:**

- Forgot Password link placement and email-based reset request (Supabase).
- In-app reset-password page with token handling, two-field form, Supabase-aligned validation and requirement text, success redirect to login, inline errors and resend link.
- Password show/hide toggle on login and reset password fields.
- Generic success messaging and friction after multiple forgot-password attempts (e.g. rate limiting).

**Out of Scope:**

- Changing email address, MFA, security questions, audit logging (unless explicitly added later).
- Supabase hosted reset page (we use in-app route).

### Technical Considerations

- Next.js App Router; add route(s) for forgot-password (and possibly request form) and `/auth/reset-password` (or similar) with token in URL.
- Supabase: `auth.resetPasswordForEmail()`, and on reset page `auth.updateUser({ password })` (or equivalent) using token from URL; ensure redirect URL in Supabase dashboard points to this app’s reset route.
- Surface Supabase password rules in UI (length, complexity if any); validate on client and rely on Supabase validation on submit.
- Rate limiting / friction for forgot-password: implement per-email cooldown or similar; avoid revealing whether email exists (generic success message).
- Reuse existing stack: React Hook Form, Zod, Tailwind, existing form/input/button components for consistency.
