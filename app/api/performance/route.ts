import { unstable_cache } from "next/cache"
import { fetchZohoPerformanceSummary } from "@/lib/zoho/performance"

const ERROR_MESSAGE = "Performance data unavailable. Please try again later."

/** Cache performance summary for 60s so repeat requests don’t re-hit Zoho (saves ~10 sequential API calls). */
const getCachedPerformance = unstable_cache(
  async () => fetchZohoPerformanceSummary(),
  ["performance-summary"],
  { revalidate: 60 }
)

export async function GET() {
  const result = await getCachedPerformance()

  if (!result.ok) {
    const isConfig =
      result.message === "Zoho credentials not configured" ||
      result.message.includes("not set")
    const status = isConfig ? 503 : 502
    return Response.json({ error: ERROR_MESSAGE }, { status })
  }

  return Response.json(result.data, {
    status: 200,
    headers: { "Content-Type": "application/json" },
  })
}
