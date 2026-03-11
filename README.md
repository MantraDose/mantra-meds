# MantraDose Dashboard

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000000?style=flat&logo=vercel)](https://mantra-meds.vercel.app)

An investor dashboard that helps investors, founders, and admins stay informed on company performance and operations. It provides a single place to view revenue, products, dividends, and financial obligations for **MantraDose** (wellness/functional mushroom company).

## Overview

- **Investors:** Transparent access to revenue, performance, product metrics, dividend calculations, and company profile.
- **Founders:** Same investor view plus internal tools such as accounts payable.
- **Admins:** Developer and system administrator with full access to the dashboard and platform: deploy, configure, manage access requests, and maintain the system.

## Features

| Area                                  | Description                                                                                          |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| **Dashboard**                         | YTD and monthly revenue, units sold, revenue chart, category performance, top products.              |
| **Performance**                       | Revenue, orders, channel mix (wholesale vs retail), filters, orders table.                           |
| **Products**                          | Searchable product catalog with revenue, units, category, status, expandable SKU detail.             |
| **Dividends**                         | Calculator (e.g. wholesale/retail rates), cap table, dividend history.                               |
| **Company Profile**                   | Company info, structure, contact, shareholder/cap table details.                                     |
| **Request Access**                    | Form for prospective users to request dashboard access (name, email, relationship, message).         |
| **Login**                             | Email/password sign-in via Supabase Auth.                                                            |
| **Accounts Payable** _(founder-only)_ | List payables (pending, overdue, paid), add payables with vendor, amount, due date, category, notes. |
| **Social Media** _(planned)_          | Placeholder for Instagram engagement metrics.                                                        |

## Tech Stack

| Layer               | Stack                                                                                   |
| ------------------- | --------------------------------------------------------------------------------------- |
| **Framework**       | Next.js 16 (App Router), TypeScript, Node.js                                            |
| **Package manager** | pnpm                                                                                    |
| **Frontend**        | React 19, Tailwind CSS 4 (PostCSS, tw-animate-css)                                      |
| **UI**              | Radix UI, shadcn-style components (CVA, tailwind-merge, clsx), Lucide React             |
| **Charts**          | Recharts                                                                                |
| **Forms**           | React Hook Form, Zod, @hookform/resolvers                                               |
| **Other**           | next-themes, sonner (toast), cmdk, vaul, react-day-picker                               |
| **Backend / Data**  | Supabase (auth + optional synced product store), Zoho Books & Zoho Inventory APIs       |
| **Analytics**       | Vercel Analytics (optional; enable in [Vercel dashboard](https://vercel.com/dashboard))   |

Auth is handled by Supabase (email/password). The **Products** page is backed by **Zoho Inventory** (items and sales-by-item). **Dashboard** and **Performance** use **Zoho Books**. A single refresh token with both Books and Inventory scopes is used when `ZOHO_CLIENT_ID`, `ZOHO_CLIENT_SECRET`, and `ZOHO_REFRESH_TOKEN` are set. Other dashboard content may use mock data until further integrations are added.

## Project Structure

```
mantra-dashboard/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Root layout (MantraDose branding)
│   ├── page.tsx            # Redirects to /dashboard
│   ├── login/              # Email/password login (Supabase Auth)
│   ├── request-access/     # Access request form
│   └── dashboard/          # Authenticated dashboard
│       ├── layout.tsx      # Sidebar + main content
│       ├── page.tsx        # Dashboard overview
│       ├── performance/    # Performance deep-dive
│       ├── products/       # Products catalog
│       ├── dividends/      # Dividends & cap table
│       ├── profile/        # Company profile
│       ├── payables/       # Accounts payable (founder)
│       └── social/         # Social media (placeholder)
├── components/
│   ├── layout/             # app-sidebar (nav, founder-only items)
│   ├── ui/                 # Shared UI (shadcn-style)
│   ├── charts/             # Revenue, category, channel, metric cards
│   └── tables/             # Orders, top products, product detail
├── lib/
│   ├── utils.ts            # cn() and helpers
│   ├── mock-data.ts        # Mock data for development
│   ├── types/              # Shared types (e.g. product)
│   ├── supabase/           # Supabase client, server, and service (auth + DB)
│   ├── zoho/               # Zoho Books & Inventory API clients
│   └── inventory/          # Product store (Zoho → Supabase sync, build-products-from-zoho)
├── agent-os/               # Product mission, tech stack, standards
└── .claude/skills/         # Project-specific skills
```

## Prerequisites

- **Node.js** (compatible with Next.js 16)
- **pnpm** (recommended; or use npm/yarn with lockfile)

## Getting Started

### 1. Clone and install

```bash
git clone <repository-url>
cd mantra-dashboard
pnpm install
```

### 2. Environment variables

Create a `.env.local` in the project root. Copy from `.env.example` and fill in values.

**Supabase (required for login)**  
Used for email/password authentication. In [Supabase Dashboard](https://supabase.com/dashboard) → your project → **Project Settings** → **API**:

- `NEXT_PUBLIC_SUPABASE_URL` — Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Project API key (anon/public, safe for client-side; use with RLS)

Do not commit `.env.local` or real keys.

**Optional: Zoho (Books + Inventory)**  
Dashboard and Performance use **Zoho Books**; the Products page uses **Zoho Inventory**. One OAuth client and one refresh token with **both** scopes. Set these in `.env.local` when using Zoho integrations:

- `ZOHO_CLIENT_ID` — From [Zoho API Console](https://api-console.zoho.com/) (Server-based Applications).
- `ZOHO_CLIENT_SECRET` — Client secret for the same client.
- `ZOHO_REFRESH_TOKEN` — Refresh token generated with **both** Zoho Books and Zoho Inventory scopes (e.g. `ZohoBooks.fullaccess.all,ZohoInventory.FullAccess.all`). Use the same client and redirect URI as in the console. See [Zoho refresh token (Books + Inventory full access)](agent-os/specs/2026-03-07-products-page-zoho-inventory-api-switch/implementation/zoho_refresh_token_full_scopes.md) for step-by-step token generation.
- `ZOHO_REDIRECT_URI` — Must match the **Authorized Redirect URIs** in your Zoho client (e.g. your app URL for production).
- `ZOHO_ORGANIZATION_ID` — Optional; for multi-organization Books accounts.
- `ZOHO_INVENTORY_BASE` — Optional; override Inventory API base (default `https://www.zohoapis.com/inventory/v1`; use `https://www.zohoapis.eu`, etc. for other data centers).

Do not commit `.env.local` or real keys.

### 3. Run development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). The root path redirects to `/dashboard`. Use `/login` to sign in (requires Supabase env vars and a configured Supabase project) and `/request-access` to request access.

### 4. Build and run production

```bash
pnpm build
pnpm start
```

## Scripts

| Script          | Description                                                                                          |
| --------------- | ---------------------------------------------------------------------------------------------------- |
| `pnpm dev`      | Start Next.js dev server                                                                             |
| `pnpm build`    | Production build                                                                                     |
| `pnpm start`    | Start production server                                                                              |
| `pnpm lint`     | Run ESLint                                                                                           |
| `pnpm test`     | Run Vitest (watch mode)                                                                              |
| `pnpm test:run` | Run Vitest once (e.g. CI). Auth tests: `pnpm test:run -- app/login/page.test.tsx middleware.test.ts` |

## Conventions & Standards

- **API:** REST-style, plural resource names, query params for filter/sort/pagination (see `agent-os/standards/backend/api.md` when backend exists).
- **Models:** Singular names, timestamps, constraints, indexes on FKs (see `agent-os/standards/backend/models.md`).
- **Frontend:** See `agent-os/standards/` and `.claude/skills/` for CSS, components, accessibility, and validation.

## Deployment

The project is deployed on **Vercel**:

- **Connect the repo:** Import your Git repository in the [Vercel dashboard](https://vercel.com/new); Vercel detects Next.js and sets build/output automatically.
- **Build settings:** Use **Install Command** `pnpm install` and **Build Command** `pnpm run build`. Set **Output Directory** to the Next.js default (no override needed).
- **Environment variables:** In **Project Settings → Environment Variables**, add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` for auth. For Zoho (Books + Inventory), add `ZOHO_CLIENT_ID`, `ZOHO_CLIENT_SECRET`, `ZOHO_REFRESH_TOKEN`, and set `ZOHO_REDIRECT_URI` to your Vercel app URL. The refresh token must include both Zoho Books and Zoho Inventory scopes (e.g. `ZohoBooks.fullaccess.all,ZohoInventory.FullAccess.all`). See [Zoho refresh token (Books + Inventory full access)](agent-os/specs/2026-03-07-products-page-zoho-inventory-api-switch/implementation/zoho_refresh_token_full_scopes.md). For the **synced products store**, add `SUPABASE_SERVICE_ROLE_KEY` (Supabase → Project Settings → API → service_role). For **cron**: add `CRON_SECRET` (a random string, e.g. `openssl rand -hex 32`); Vercel sends it as `Authorization: Bearer <CRON_SECRET>` when invoking the sync cron.
- **Cron (sync inventory products):** The repo includes `vercel.json` with a cron that calls `/api/cron/sync-inventory-products` daily at midnight UTC (`0 0 * * *`). Cron runs only in Production. Ensure `CRON_SECRET` is set in Vercel so the route can verify the request.
- **Custom domain:** Add your domain in **Project Settings → Domains** and follow the DNS instructions.
- **Analytics:** Enable [Vercel Analytics](https://vercel.com/docs/analytics) in the project if you want traffic insights.

## License

Private. All rights reserved.
