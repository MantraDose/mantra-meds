# Task Breakdown: Cap Table Data Replacement on Company Profile

## Overview

Total Tasks: 1 main group (data + optional UI) + 1 verification group. No database or API work; single source of truth is `lib/mock-data.ts`.

## Task List

### Data & UI

#### Task Group 1: Cap Table Data and Profile Title
**Dependencies:** None

- [x] 1.0 Complete cap table data replacement and optional title update
  - [x] 1.1 Update `lib/mock-data.ts` — replace `capTable` array with 2024 shareholder data
    - Six members in order: Mars (250000, 22.24), Venus (200000, 17.79), Derek (362600, 32.26), Miguel (77000, 6.85), Chris (77000, 6.85), Andrew (22500, 2)
    - Keep shape `{ member: string, shares: number, ownership: number }[]`; no type or consumer changes
    - Total shares must sum to 989,100; ownership to 100%
  - [x] 1.2 (Optional) Update Company Profile Cap Table card title
    - In `app/dashboard/profile/page.tsx`, set CardTitle to "2024 Shareholder Updated Cap Table" instead of "Cap Table", or leave as "Cap Table" per product preference
  - [x] 1.3 Verify consumers show correct data
    - Company Profile: Total Shares Outstanding shows 989,100; Number of Shareholders shows 6; table lists all six members with correct shares and ownership %
    - Dividends page: Cap Table table and pie chart reflect the same six members and percentages (no code changes required; confirm after 1.1)

**Acceptance Criteria:**
- `capTable` in `lib/mock-data.ts` contains exactly the six 2024 shareholders with correct shares and ownership values
- Company Profile page displays 989,100 total shares, 6 shareholders, and the new member list
- Dividends page cap table and pie chart show the new data without duplicate definitions

### Verification

#### Task Group 2: Manual / Automated Verification
**Dependencies:** Task Group 1

- [x] 2.0 Verify feature end-to-end
  - [x] 2.1 Confirm Company Profile page
    - Navigate to Company Profile; check key metrics (989,100; 6) and Cap Table rows match reference `planning/visuals/2024-shareholder-cap-table-source.png`
  - [x] 2.2 Confirm Dividends page
    - Navigate to Dividends; confirm Cap Table and ownership pie show Mars, Venus, Derek, Miguel, Chris, Andrew with correct percentages
  - [x] 2.3 Run relevant tests (if any exist)
    - If the project has tests that reference `capTable` or profile/dividends pages, run them and fix any failures caused by the new data (e.g. snapshot or expected-member assertions)

**Acceptance Criteria:**
- Company Profile and Dividends pages display the 2024 cap table data correctly
- Any existing tests that depend on cap table or profile/dividends still pass after updating expectations if needed

## Execution Order

Recommended implementation sequence:
1. Data & UI (Task Group 1) — update mock data, optional title, then verify both pages
2. Verification (Task Group 2) — manual check and test run

## Notes

- No database, API, or new components; no dedicated test-writing phase beyond fixing existing tests if they break.
- Reference data: `planning/visuals/2024-shareholder-cap-table-source.png`.
