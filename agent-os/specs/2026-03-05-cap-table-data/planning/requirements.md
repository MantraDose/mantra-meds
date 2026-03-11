# Spec Requirements: Cap Table Data Replacement on Company Profile

## Initial Description

Replace the existing Cap Table data on the Company Profile page with the data from the "2024 Shareholder Updated Cap Table" (white background reference). The dashboard currently shows placeholder shareholders (e.g. Alex Rivera, Jordan Patel); the new data set has six members with updated names, share counts, and ownership percentages.

## Requirements Summary

### Source Data (2024 Shareholder Updated Cap Table)

- **Table title:** 2024 Shareholder Updated Cap Table
- **Columns:** MEMBER, SHARES OF COMMON STOCK, % OF OUTSTANDING STOCK
- **Rows:**
  - Mars: 250,000 shares, 22.24%
  - Venus: 200,000 shares, 17.79%
  - Derek: 362,600 shares, 32.26%
  - Miguel: 77,000 shares, 6.85%
  - Chris: 77,000 shares, 6.85%
  - Andrew: 22,500 shares, 2%
- **Total:** 989,100 shares, 100%

### Functional Requirements

- Update the single source of cap table data (e.g. `lib/mock-data.ts` `capTable`) so that the Company Profile page and any other consumers (e.g. Dividends page) display the 2024 shareholder data.
- Company Profile page: Cap Table block shows the six members above with correct shares and ownership %; key metrics "Total Shares Outstanding" (989,100) and "Number of Shareholders" (6) remain derived from the same data.
- Column labels in the UI may stay as "Member", "Shares", "Ownership %" (or align with source: "Member", "Shares of Common Stock", "% of Outstanding Stock") per design decision; data values must match the source table.
- Optional: Use the table title "2024 Shareholder Updated Cap Table" as the Cap Table card title on the Company Profile page instead of "Cap Table".

### Scope Boundaries

**In scope:** Replacing cap table dataset in mock (or single source); ensuring Company Profile and Dividends (and any other cap table consumers) show the new data; optionally updating the Cap Table card title.

**Out of scope:** Backend/API or database persistence for cap table; editing or adding shareholders in the UI; restyling the table to match the white-background screenshot’s exact colors (pink header, purple total row); any change to dividend calculation logic beyond what naturally follows from updated ownership percentages.

### Visual Reference

- **current-cap-table-ui.png:** Current Company Profile Cap Table block (dark theme) with placeholder members and metrics.
- **2024-shareholder-cap-table-source.png:** Target data source (white bg) with title, column headers, six members, and total row to be applied to the app data.

## Technical Considerations

- Cap table is currently in `lib/mock-data.ts` as `capTable` array of `{ member, shares, ownership }`. Update the array contents; keep the same shape so existing components (profile page, dividends page) need no structural changes.
- Total shares and shareholder count are computed from the array on the profile page; they will update automatically when the data is replaced.
