# Product Mission

## Pitch
MantraDose is an investor dashboard that helps investors, founders, and admins stay informed on company performance and operations by providing a single place to view revenue, products, dividends, and financial obligations.

## Users

### Primary Customers
- **Investors:** Shareholders and partners who want transparent access to revenue, performance, product metrics, dividend calculations, and company profile.
- **Founders:** Company operators who need the same investor view plus internal tools such as accounts payable.
- **Admins:** Developer and system administrator with full access to the dashboard and platform—deploy, configure, manage access requests, and maintain the system.

### User Personas
**Investor** (any age)
- **Role:** Shareholder or partner in MantraDose (wellness/functional mushroom company).
- **Context:** Wants to monitor investment without asking for spreadsheets or ad-hoc reports.
- **Pain Points:** Lack of real-time visibility; manual updates; unclear dividend math.
- **Goals:** See YTD and monthly performance at a glance, understand product and channel mix, and track dividend eligibility and history.

**Founder** (any age)
- **Role:** Operator with access to investor dashboard plus internal operations.
- **Context:** Needs to share metrics with investors while managing payables and company info.
- **Pain Points:** Duplicating work between internal tools and investor updates.
- **Goals:** One dashboard for both investor communication and founder-only operations (e.g. payables).

**Admin** (developer / sys admin)
- **Role:** Developer and system administrator for the MantraDose dashboard.
- **Context:** Builds, deploys, and maintains the app; needs full access to all features and system configuration.
- **Pain Points:** Need to verify all roles work correctly, debug issues, manage environment and config, deploy and monitor the platform.
- **Goals:** Full access to dashboard and backend; manage access requests and approvals; deploy, monitor, and maintain the platform.

## The Problem

### Fragmented investor updates
Investors often receive performance data via email, spreadsheets, or one-off reports. This is time-consuming for founders and gives investors a delayed, incomplete picture.

**Our Solution:** A dedicated dashboard where investors log in to see revenue, performance, products, dividends, and company profile—and founders use the same app plus accounts payable.

### Opaque dividend and cap-table visibility
Understanding how dividends are calculated and how they tie to revenue and the cap table is difficult when everything lives in separate documents.

**Our Solution:** A Dividends view with clear rates (e.g. wholesale vs retail), cap table, and dividend history so investors can see how payouts are derived.

## Differentiators

### Investor-first, product-native
Unlike generic BI or spreadsheets, the dashboard is built for this company’s model: wholesale vs retail revenue, product-level metrics, and dividend rules in one place.

### Role-based access
Investors see performance and dividends; founders get the same plus accounts payable and company profile, without maintaining separate tools. Admins have full access to the dashboard and platform for development, deployment, and system administration.

## Key Features

### Core Features
- **Dashboard overview:** High-level snapshot of YTD and current-month revenue, units sold, revenue chart, category performance, and top products so users get the big picture quickly.
- **Performance deep-dive:** Revenue, orders, and channel mix (wholesale vs retail) with filters and an orders table for detailed analysis.
- **Products catalog:** Searchable, sortable product list with revenue, units sold, category, status, and expandable product detail for per-SKU visibility.
- **Dividends:** Dividend calculator (e.g. wholesale 5%, retail 10%), cap table, and dividend history so investors see how payouts are calculated and trend over time.
- **Company profile:** Static company information (name, structure, contact) and shareholder/cap table details in one place.

### Collaboration Features
- **Request access:** Prospective users can request dashboard access with name, email, relationship, and message; admins can approve and onboard.
- **Login (magic link):** Email-based sign-in with a login link to reduce password friction and improve security.

### Advanced Features
- **Accounts payable (founder-only):** List of payables (pending, overdue, paid), add payables with vendor, amount, due date, category, and notes for founder-only financial operations.
- **Social media (planned):** Placeholder for Instagram engagement metrics and analytics to support marketing and growth visibility.
