/**
 * Zoho OAuth token refresh. Server-only; never import in client code.
 * @see https://www.zoho.com/books/api/v3/oauth/
 */

import { getZohoConfig } from "./config"

const TOKEN_URL_PATH = "/oauth/v2/token"

export interface ZohoTokenResponse {
  access_token: string
  expires_in_sec: number
  api_domain: string
  token_type: string
}

/**
 * Obtain a fresh access token using the refresh token.
 * Fails clearly if env vars are missing (no credential values in the error).
 */
export async function getZohoAccessToken(): Promise<string> {
  const config = getZohoConfig()
  const url = `${config.accountsBase}${TOKEN_URL_PATH}`
  const params = new URLSearchParams({
    refresh_token: config.refreshToken,
    client_id: config.clientId,
    client_secret: config.clientSecret,
    redirect_uri: config.redirectUri,
    grant_type: "refresh_token",
  })
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    if (process.env.NODE_ENV === "development") {
      console.error("[Zoho OAuth] token refresh failed:", res.status, data)
    }
    const message = data?.error ?? data?.message ?? "Token refresh failed"
    throw new Error(`Zoho auth failed: ${message}`)
  }
  const accessToken = data.access_token
  if (!accessToken || typeof accessToken !== "string") {
    throw new Error("Zoho auth failed: no access token in response")
  }
  return accessToken
}
