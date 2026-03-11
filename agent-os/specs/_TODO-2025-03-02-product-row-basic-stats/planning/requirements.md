# Spec Requirements: Product Row Basic Stats

## Initial Description

Let's add some basic stats to the product rows like they appear in the zoho product rows.

## Requirements Discussion

### First Round Questions

**Q1:** From the Zoho reference, I'm assuming we add at least Quantity Sold, Amount (revenue), and Average Price per product row. Should we use exactly these three, or also include things like Category or % of total (e.g. % of total revenue)?

**Answer:** Let's stick to the first 3. We can add the % of total revenue later.

**Q2:** Should these stats come from real backend data (once the backend/performance data from the roadmap exists), mock/placeholder values for now, or do you already have an API or dataset we should wire to first?

**Answer:** Let's grab the data from Zoho. I was able to find this data in the 'Reports' area of Zoho's Inventory app.

**Q3:** Should we match Zoho-style formatting (e.g. numbers right-aligned, commas for thousands, two decimals; currency with $; optional blue for numeric columns), or follow the dashboard's existing table styling and only add the columns?

**Answer:** Yes, match Zoho's text formatting, but use the dashboard's styles for color and size.

**Q4:** Do you want Quantity Sold and Amount to be sortable (click column header to sort), and optionally filterable (e.g. "only products with amount > $X")?

**Answer:** Yes, let's be able to sort by Qty sold and amount.

**Q5:** Should these stats appear only on the main Products table (the list with Product, SKU, Price, Status), or also in any expandable product detail or other product tables elsewhere in the app?

**Answer:** Let's work on the product table on the products page for now.

**Q6:** Is there anything you explicitly don't want in this iteration (e.g. no charts in the row, no trend arrows, no export, or no new filters)?

**Answer:** No charts in the row, no trend arrows, no export, or no new filters.

### Existing Code to Reference

No similar existing features identified for reference.

### Follow-up Questions

**Follow-up 1:** You mentioned grabbing data from Zoho (Reports area of Zoho Inventory). How should we plan for getting that data into the dashboard? (A) Zoho API integration to pull report data on a schedule or on load, (B) Manual process for now (e.g. export from Zoho then import), (C) Other.

**Answer:** Option A — Zoho API integration to pull the "Sales by Item" report data (e.g. from Zoho Books/Inventory API) on a schedule or on load.

## Visual Assets

### Files Provided:

- `zoho-sales-by-item.png`: Zoho "Sales by Item" report showing table with columns ITEM NAME, SKU, QUANTITY SOLD, AMOUNT, AVERAGE PRICE. Numeric values right-aligned, comma-separated, two decimals; currency with $; blue numeric columns. Date range and filters at top; Table View / Chart View tabs.
- `mantra-products-current.png`: MantraDose Products page (dark theme) with table columns Product, SKU, Price, Status. No quantity sold, amount, or average price; status pills (Active/Inactive). Search above table.

### Visual Insights:

- Zoho reference defines the three stats (Quantity Sold, Amount, Average Price) and number/currency formatting to replicate.
- Current Products table is the target: add three new columns without changing existing column order/styling beyond dashboard conventions.
- Fidelity: high-fidelity reference (Zoho) and current UI (Mantra); use Zoho for data/formatting, Mantra for layout and theme.

## Requirements Summary

### Functional Requirements

- Add three columns to the product table on the Products page: **Quantity Sold**, **Amount** (revenue), **Average Price**.
- Source data from Zoho via API: pull "Sales by Item" report data from Zoho Inventory (Reports area) on load or on a schedule.
- Format numbers like Zoho: right-aligned, commas for thousands, two decimals; currency with $; use dashboard styles for color and size.
- Support sortable columns for Quantity Sold and Amount (click header to sort).
- Scope limited to the main product table on the Products page; no expandable row stats in this iteration.
- Out of scope for this iteration: % of total revenue, charts in row, trend arrows, export, new filters.

### Reusability Opportunities

- Reuse existing Products page table component and any shared number/currency formatters if present.
- Backend: new or extended API for Zoho report data; patterns to be defined during implementation.

### Scope Boundaries

**In Scope:**

- Quantity Sold, Amount, Average Price columns on Products table.
- Zoho API integration to fetch Sales-by-Item report data (on load or scheduled).
- Zoho-like number/currency formatting; dashboard styling.
- Sort by Quantity Sold and Amount.

**Out of Scope:**

- % of total revenue (later).
- Charts in row, trend arrows, export, new filters.
- Stats in expandable product detail or other product tables.

### Technical Considerations

- Zoho API integration (Books/Inventory) for Reports / "Sales by Item" data; exact endpoint and auth to be determined.
- Data can be pulled on page load or on a schedule (e.g. background job); decision left to implementation.
- Frontend: Products page table only; align with existing table and theming (e.g. dark theme).
- No new filters or export; sorting only for Qty Sold and Amount.
