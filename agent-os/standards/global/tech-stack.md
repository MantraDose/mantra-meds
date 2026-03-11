## Tech stack

Define your technical stack below. This serves as a reference for all team members and helps maintain consistency across the project. For the MantraDose dashboard, the following is current.

### Framework & Runtime

- **Application Framework:** Next.js 16 (App Router)
- **Language/Runtime:** TypeScript, Node.js
- **Package Manager:** pnpm

### Frontend

- **JavaScript Framework:** React 19
- **CSS Framework:** Tailwind CSS 4 (PostCSS, tw-animate-css)
- **UI Components:** Radix UI primitives, shadcn-style components (class-variance-authority, tailwind-merge, clsx), Lucide React icons
- **Charts:** Recharts
- **Forms:** React Hook Form, Zod, @hookform/resolvers
- **Other UI:** next-themes, sonner, cmdk, vaul, react-day-picker (see package.json)

### Database & Storage

- **Database:** Supabase (PostgreSQL) for auth and optional synced product store
- **ORM/Query Builder:** Supabase client/server utilities; no separate ORM
- **Caching:** None by default; add if needed

### Testing & Quality

- **Test Framework:** Vitest with @testing-library/react (happy-dom/jsdom)
- **Linting/Formatting:** ESLint

### Deployment & Infrastructure

- **Hosting:** Vercel (default Next.js build; pnpm)
- **CI/CD:** Vercel on push; cron for daily inventory sync (see vercel.json)

### Third-Party Services

- **Authentication:** Supabase Auth (email/password; forgot/reset flows)
- **Email:** Supabase for auth emails
- **Monitoring:** Vercel Analytics (optional)
- **External APIs:** Zoho Books, Zoho Inventory
