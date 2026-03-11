# Tech Stack

Technical stack for the MantraDose investor dashboard. This aligns with the existing codebase and project standards.

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
- **Other UI:** next-themes (theming), sonner (toast), cmdk, vaul, react-day-picker, etc. as in package.json

### Database & Storage

- **Database:** Supabase (PostgreSQL). Used for auth and, when configured, for the synced products store (service role). Additional app tables may be added as needed.
- **ORM/Query Builder:** Supabase client and server utilities (`lib/supabase/`); no separate ORM.
- **Caching:** None currently; add if needed (e.g. for Zoho responses).

### Testing & Quality

- **Linting/Formatting:** ESLint
- **Test Framework:** Vitest with @testing-library/react, happy-dom/jsdom for unit and component tests.

### Deployment & Infrastructure

- **Hosting:** Vercel. Next.js is supported natively; use the default build/output settings with `pnpm install` and `pnpm run build`.
- **CI/CD:** Vercel builds on push when the repo is connected; optional branch deploys and deploy previews. Cron: daily sync of Zoho Inventory products to Supabase (`0 0 * * *`). Add status checks in the Vercel dashboard if needed.

### Third-Party Services

- **Authentication:** Supabase Auth (email/password; forgot-password and reset-password flows).
- **Email:** Supabase handles auth emails; request-access notifications to be introduced if needed.
- **Monitoring/Analytics:** Vercel Analytics (enable in Vercel dashboard; no npm package required).
- **External APIs:** Zoho Books (dashboard, performance), Zoho Inventory (products catalog and sync).

### Conventions

- **API:** RESTful design, plural resource names, query params for filter/sort/pagination (see `agent-os/standards/backend/api.md`).
- **Models:** Singular model names, timestamps, constraints, indexes on FKs (see `agent-os/standards/backend/models.md`).
