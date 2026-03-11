# Specification: Cap Table Data Replacement on Company Profile

## Goal

Replace the Cap Table data shown on the Company Profile page (and anywhere else it is consumed) with the 2024 Shareholder Updated Cap Table dataset so that the dashboard displays the correct six shareholders, share counts, and ownership percentages from the reference source.

## User Stories

- As an investor or founder, I want the Company Profile Cap Table to show the current 2024 shareholder list (Mars, Venus, Derek, Miguel, Chris, Andrew) with accurate shares and ownership % so that company ownership is correctly represented.
- As a user, I want Total Shares Outstanding and Number of Shareholders on the profile to reflect the updated cap table (989,100 shares, 6 shareholders) so that summary metrics are consistent with the table.

## Specific Requirements

**Single source of cap table data**

- Cap table data is defined in one place (e.g. `lib/mock-data.ts` as `capTable`). Update that source with the 2024 shareholder data; do not duplicate the dataset.
- Data shape remains `{ member: string, shares: number, ownership: number }[]` so existing consumers (Company Profile page, Dividends page) require no structural changes.

**2024 shareholder dataset**

- Replace current rows with exactly six members: Mars (250,000 shares, 22.24%), Venus (200,000, 17.79%), Derek (362,600, 32.26%), Miguel (77,000, 6.85%), Chris (77,000, 6.85%), Andrew (22,500, 2%). Total shares 989,100; total ownership 100%.
- Percentages are stored as numbers (e.g. 22.24) and displayed with existing formatting (e.g. toFixed(2) + "%").

**Company Profile page**

- Cap Table block displays the new six members with correct shares and ownership %. Total row shows 989,100 and 100.00%.
- Key metrics "Total Shares Outstanding" and "Number of Shareholders" are derived from the same cap table source; they will show 989,100 and 6 after the data update.
- Optionally use the card title "2024 Shareholder Updated Cap Table" instead of "Cap Table" to match the reference; otherwise keep "Cap Table".

**Other consumers**

- Any other UI that reads from the same cap table source (e.g. Dividends page cap table and pie chart) must automatically reflect the new data with no duplicate data definitions.

**Column labels**

- Keep existing column labels "Member", "Shares", "Ownership %" unless product prefers the reference labels ("Shares of Common Stock", "% of Outstanding Stock"); implementation may keep current labels for consistency with the rest of the app.

## Visual Design

**`planning/visuals/current-cap-table-ui.png`**

- Dark-themed Company Profile section with key metrics (Total Shares Outstanding, Number of Shareholders) and Cap Table card.
- Table columns: Member, Shares, Ownership %. Data rows plus Total row. Reuse this layout; only the data (rows) change.

**`planning/visuals/2024-shareholder-cap-table-source.png`**

- Reference data source: title "2024 Shareholder Updated Cap Table", columns MEMBER / SHARES OF COMMON STOCK / % OF OUTSTANDING STOCK.
- Six members (Mars, Venus, Derek, Miguel, Chris, Andrew) with shares and percentages as specified; total 989,100 and 100%. Use this as the single source of truth for the replacement dataset; exact replication of pink header / purple total row styling from the image is out of scope.

## Existing Code to Leverage

**`lib/mock-data.ts`**

- `capTable` is the single export used for cap table data. Replace the array contents with the 2024 shareholder rows; keep the same `{ member, shares, ownership }` shape so no consumer type changes are required.

**`app/dashboard/profile/page.tsx`**

- Imports `capTable` from mock-data; computes `totalShares` via reduce and uses `capTable.length` for shareholder count; renders Table with Member, Shares, Ownership %. No layout or component changes needed beyond ensuring data is updated and optionally updating the CardTitle to "2024 Shareholder Updated Cap Table".

**`app/dashboard/dividends/page.tsx`**

- Imports `capTable` for the Cap Table table and pie chart. Will automatically show the new data once mock-data is updated; no code changes required unless column or title changes are desired.

**`components/ui/table.tsx`**

- Existing Table, TableHeader, TableBody, TableRow, TableHead, TableCell are used for the Cap Table; no changes required.

## Out of Scope

- Backend API or database persistence for the cap table; data remains in frontend mock/source for this spec.
- UI to add, edit, or remove shareholders; read-only display only.
- Replicating the exact visual styling of the white-background reference (e.g. pink header row, purple total row); keep existing app theme and table styling.
- Changes to dividend calculation logic beyond what naturally follows from updated ownership percentages (no explicit dividend formula changes in this spec).
- Date-range or versioning of cap tables (e.g. "as of" date or multiple cap table versions).
