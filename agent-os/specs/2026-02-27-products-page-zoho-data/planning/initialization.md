# Spec Initialization: Products Page — Zoho Data

## Raw Idea (user description)

I'd like to begin populating the 'Products' page first with a list of products from the real zoho data.

## Spec Metadata

- **Spec name (kebab-case):** products-page-zoho-data
- **Dated folder:** 2026-02-27-products-page-zoho-data
- **Initialized:** 2026-02-27

## First-Round Answers (from user)

1. Yes, we'll use Zoho Inventory as our data source.
2. Server-side layer (Next.js API) assumption is correct.
3. For the first iteration, show product master data only; keep it simple. Sales data later.
4. Use Zoho Inventory for (chart/sales) data as well; sales data is visible at bottom-right of the attached Zoho screenshot.
5. Remove the category and status filters for the first list; keep search. Add filters when we add more columns.
6. Credentials in .env.local is correct; user needs help creating the Zoho client and tokens (API console was empty in first prompt).
7. Read only — yes.
8. No category/status filters, minimal product data for now; use project standards.
