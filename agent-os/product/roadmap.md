# Product Roadmap

1. [ ] **Authentication (magic link + session)** — Implement real magic-link sign-in (e.g. email send, token verification) and session management so users can sign in and stay signed in; protect dashboard routes and redirect unauthenticated users to login. `M`
2. [ ] **Request access workflow** — Persist access requests (name, email, relationship, message), add an admin view to list and approve/deny requests, and optionally notify applicants by email when access is granted. `S`
3. [ ] **Backend and data layer** — Introduce a backend (e.g. Next.js API routes or external API), database, and ORM/query layer so dashboard data can be stored and served instead of mock data. `L`
4. [ ] **Dashboard and performance data** — Wire dashboard overview and performance pages to real revenue, orders, and channel data from the backend; ensure YTD/monthly metrics, charts, and orders table reflect live or imported data. `M`
5. [ ] **Products and company profile data** — Connect products list (with search, sort, filter, detail) and company profile (and cap table) to the backend so both investors and founders see accurate, editable company and product data. `M`
6. [ ] **Dividends and cap table** — Source dividend history and cap table from the data layer; keep calculator logic (e.g. wholesale/retail rates) and ensure dividends view shows accurate, auditable payout and cap-table data. `M`
7. [ ] **Accounts payable (founder-only)** — Persist payables (vendor, amount, due date, category, status, notes), restrict access to founders, and support add/edit/status updates so founder-only operations are fully functional. `S`
8. [ ] **Role-based access control** — Enforce investor vs founder roles (e.g. hide payables and any admin/request-access management from investors); ensure sidebar and routes respect role. `S`
9. [ ] **Social media metrics (optional)** — When data source exists, replace social placeholder with Instagram (or other) engagement metrics and analytics; otherwise keep as coming-soon. `S`

> Notes
> - Order follows technical dependencies: auth and request-access first, then backend and data, then feature wiring and roles.
> - Each item is an end-to-end (frontend + backend where applicable) testable feature.
> - Effort: XS = 1 day, S = 2–3 days, M = 1 week, L = 2 weeks, XL = 3+ weeks.
