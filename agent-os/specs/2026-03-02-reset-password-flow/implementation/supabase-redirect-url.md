# Supabase redirect URL for reset password

For the in-app reset-password flow to work, Supabase must send users to this app’s reset page.

**Configure in Supabase Dashboard:**

1. Go to **Authentication** → **URL Configuration** (or **Project Settings** → **Authentication**).
2. Add your app’s reset-password URL to **Redirect URLs** (and/or **Site URL** if required):
   - **Production:** `https://<your-production-domain>/auth/reset-password`
   - **Local:** `http://localhost:3000/auth/reset-password` (or your dev port)

Supabase’s password-reset email will then link to this app’s `/auth/reset-password` route so users can set a new password in-app.
