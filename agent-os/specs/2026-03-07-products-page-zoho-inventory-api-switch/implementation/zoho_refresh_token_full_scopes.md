---
name: Zoho refresh token full scopes
overview: Step-by-step guide to generate a new Zoho refresh token that has full-access scopes for both Zoho Books and Zoho Inventory, then update `.env.local`.
todos: []
isProject: false
---

# Generate Zoho Refresh Token (Books + Inventory Full Access)

Your app uses a single refresh token (`[ZOHO_REFRESH_TOKEN](.env.local)`) with `[getZohoAccessToken()](lib/zoho/token.ts)` to call both Books and Inventory. To support the upcoming Products → Inventory switch and keep Dashboard/Performance on Books, the token must include **full-access scopes for both** APIs.

---

## Scopes to request

| API            | Full-access scope              |
| -------------- | ------------------------------ |
| Zoho Books     | `ZohoBooks.fullaccess.all`     |
| Zoho Inventory | `ZohoInventory.FullAccess.all` |

**Combined scope (use in the auth URL):**  
`ZohoBooks.fullaccess.all,ZohoInventory.FullAccess.all`

(If Zoho returns an error about an invalid scope, try `ZohoInventory.fullaccess.all` — some docs use different casing.)

---

## Prerequisites

- Your **Client ID** and **Client Secret** from [Zoho API Console](https://api-console.zoho.com/) (or your DC: [.eu](https://api-console.zoho.eu/), [.in](https://api-console.zoho.in/)).
- **Authorized Redirect URI** in that client must **exactly** match the value you use below. Ensure the redirect URI in `.env.local` (`ZOHO_REDIRECT_URI`) matches one of the **Authorized Redirect URIs** configured in your Zoho client.
- **Accounts base**: US is `https://accounts.zoho.com`. For EU use `https://accounts.zoho.eu`, for India `https://accounts.zoho.in`, etc.

---

## Step 1: Open the authorization URL in a browser

Build this URL (replace placeholders with your actual `ZOHO_CLIENT_ID` and redirect URI):

```
https://accounts.zoho.com/oauth/v2/auth?scope=ZohoBooks.fullaccess.all,ZohoInventory.FullAccess.all&client_id=YOUR_CLIENT_ID&response_type=code&redirect_uri=YOUR_REDIRECT_URI&access_type=offline&prompt=consent
```

- **YOUR_CLIENT_ID**: from API Console (e.g. the value of `ZOHO_CLIENT_ID` in `.env.local`).
- **YOUR_REDIRECT_URI**: must match **exactly** the Authorized Redirect URI in the Zoho client (e.g. `https://your-app.com/callback`). URL-encode it in the auth URL if needed (e.g. `https%3A%2F%2Fyour-app.com%2Fcallback`).
- **Data center**: If you use EU/IN, change the host to `accounts.zoho.eu` or `accounts.zoho.in`.

Open this URL in a browser, sign in to Zoho if asked, and grant access. Zoho will redirect to your `redirect_uri` with a query parameter **`code=...`**. Copy the full `code` value (single-use, short-lived).

---

## Step 2: Exchange the code for tokens

Run this in a terminal (replace placeholders with the code from Step 1 and your client id/secret/redirect_uri):

```bash
curl -X POST "https://accounts.zoho.com/oauth/v2/token" \
  -d "code=PASTE_CODE_FROM_REDIRECT_URL" \
  -d "client_id=YOUR_CLIENT_ID" \
  -d "client_secret=YOUR_CLIENT_SECRET" \
  -d "redirect_uri=YOUR_REDIRECT_URI" \
  -d "grant_type=authorization_code"
```

- Use the **exact** same `redirect_uri` as in Step 1 (and in your Zoho client).
- For EU/IN, use `https://accounts.zoho.eu/oauth/v2/token` or `https://accounts.zoho.in/oauth/v2/token`.

The JSON response will include **`refresh_token`**. Copy that value.

---

## Step 3: Update `.env.local`

Set:

```env
ZOHO_REFRESH_TOKEN=the_new_refresh_token_from_step_2
```

Keep `ZOHO_CLIENT_ID`, `ZOHO_CLIENT_SECRET`, and `ZOHO_REDIRECT_URI` unchanged. Do not commit `.env.local`.

---

## Optional: Document scopes for the team

Your spec asks to document that the refresh token must include Books and Inventory scopes (e.g. in [README](README.md) or under [agent-os/specs/2026-03-07-products-page-zoho-inventory-api-switch/implementation/](agent-os/specs/2026-03-07-products-page-zoho-inventory-api-switch/)). You could add a short note that the token was generated with `ZohoBooks.fullaccess.all,ZohoInventory.FullAccess.all` so future setups are clear.

---

## References

- Existing setup doc: [agent-os/specs/2026-02-27-products-page-zoho-data/ZOHO-SETUP.md](agent-os/specs/2026-02-27-products-page-zoho-data/ZOHO-SETUP.md) (Inventory-only scopes; same OAuth flow).
- Zoho OAuth: [accounts protocol](https://www.zoho.com/accounts/protocol/oauth/scope.html), [Books OAuth](https://www.zoho.com/books/api/v3/oauth/), [Inventory OAuth](https://www.zoho.com/inventory/api/v1/oauth/).
