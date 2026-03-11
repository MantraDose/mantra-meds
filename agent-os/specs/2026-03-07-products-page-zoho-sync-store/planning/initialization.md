# Spec Initialization: Products Page Zoho Sync Store

## Raw Idea (user description)

We want to stop building Products page data on every request from Zoho. Instead, introduce a server-side dataset that we own: a background job runs on a schedule (e.g. hourly or daily), fetches Zoho Inventory items and invoices, aggregates sales by item (quantity sold and amount), and writes/updates rows in our own store (DB table or cache). The Products page (and GET /api/inventory/products) should then read from this store only—no Zoho calls on page load. Scope is: design and implement the store, the scheduled sync job, and the API + UI integration so the existing Products page keeps the same behavior but is backed by the synced dataset. Out of scope for this spec: changing how often we sync or adding more Zoho sources; we can expand later.
