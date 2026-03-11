# Zoho Inventory Setup (Products Page)

This doc describes how to configure Zoho Inventory so the dashboard can fetch the product list. All Zoho API calls run on the server; credentials never go to the browser.

## 1. Create a Server-based Application in Zoho

1. Open [Zoho API Console](https://api-console.zoho.com/) (or your data center: [.eu](https://api-console.zoho.eu/), [.in](https://api-console.zoho.in/), etc.).
2. Click **Add Client** → choose **Server-based Applications**.
3. Fill in:
   - **Client Name:** e.g. "MantraDose Dashboard"
   - **Homepage URL:** e.g. `http://localhost:3000`
   - **Authorized Redirect URIs:** add the exact URL your app will use (e.g. `http://localhost:3000` or `http://localhost:3000/login`). You must use this **exact** same value in the OAuth auth URL, in the code exchange, and in `ZOHO_REDIRECT_URI` in `.env.local`.
4. After creation, note the **Client ID** and **Client Secret**. Do not share them or commit them to git.

## 2. Generate a Refresh Token

The dashboard uses a **refresh token** to obtain short-lived access tokens. You need to run the OAuth flow once to get that refresh token.

1. **Authorization URL** (open in browser; replace `YOUR_CLIENT_ID` and `YOUR_REDIRECT_URI`):
  ```
   https://accounts.zoho.com/oauth/v2/auth?scope=ZohoInventory.items.READ,ZohoInventory.settings.READ&client_id=YOUR_CLIENT_ID&response_type=code&redirect_uri=YOUR_REDIRECT_URI&access_type=offline&prompt=consent
  ```
  - Use your data center if not US: `accounts.zoho.eu`, `accounts.zoho.in`, etc.
  - `redirect_uri` must match **exactly** the value in your Zoho client’s **Authorized Redirect URIs** (e.g. `http://localhost:3000` or `http://localhost:3000/login`).
  - After consent, Zoho redirects to `redirect_uri?code=...`. Copy the `code` from the URL (it is single-use and short-lived).
2. **Exchange code for tokens** (run once, e.g. with curl; replace placeholders):
  ```bash
   curl -X POST "https://accounts.zoho.com/oauth/v2/token" \
     -d "code=PASTE_CODE_FROM_REDIRECT" \
     -d "client_id=YOUR_CLIENT_ID" \
     -d "client_secret=YOUR_CLIENT_SECRET" \
     -d "redirect_uri=YOUR_REDIRECT_URI" \
     -d "grant_type=authorization_code"
  ```
   The response includes `refresh_token`. Save it; you will put it in `.env.local`.

## 3. Set Environment Variables

In `.env.local` (never commit this file), set:

```env
ZOHO_CLIENT_ID=your_client_id
ZOHO_CLIENT_SECRET=your_client_secret
ZOHO_REFRESH_TOKEN=your_refresh_token
ZOHO_REDIRECT_URI=http://localhost:3000
```

Use the **exact** value from your Zoho client’s **Authorized Redirect URIs** (e.g. `http://localhost:3000/login` if that’s what you configured).

- `ZOHO_REDIRECT_URI` must match **exactly** the **Authorized Redirect URIs** value in your Zoho client (e.g. `http://localhost:3000` or `http://localhost:3000/login`). If they differ, token refresh will fail.
- If your Zoho account is in another data center (EU, India, etc.), set:
  - `ZOHO_ACCOUNTS_BASE=https://accounts.zoho.eu` (or `.in`, `.com.au`, etc.)
  - `ZOHO_INVENTORY_BASE=https://www.zohoapis.eu` (or `www.zohoapis.in`, `www.zohoapis.com.au`, etc. — use the **zohoapis** domain for Inventory API, not inventory.zoho.*).
- If you have multiple organizations, set `ZOHO_INVENTORY_ORGANIZATION_ID` to the organization ID (from Zoho Inventory URL or [List organizations](https://www.zoho.com/inventory/api/v1/organizations/#list-organizations) API).

## 4. References

- [Zoho Inventory API – OAuth](https://www.zoho.com/inventory/api/v1/oauth/)
- [Zoho Inventory API – List all the items](https://www.zoho.com/inventory/api/v1/items/#list-all-the-items)

