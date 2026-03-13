import { NextResponse } from "next/server"

import { getCachedSiteChromeEnvelopeJson } from "@/lib/public-content"

const CHROME_EDGE_CACHE_SECONDS = 30
const CHROME_EDGE_STALE_SECONDS = 60
const CHROME_BROWSER_CACHE_SECONDS = 15

export async function GET() {
  try {
    const body = await getCachedSiteChromeEnvelopeJson()

    return new NextResponse(body, {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": `public, max-age=${CHROME_BROWSER_CACHE_SECONDS}, s-maxage=${CHROME_EDGE_CACHE_SECONDS}, stale-while-revalidate=${CHROME_EDGE_STALE_SECONDS}`,
      },
    })
  } catch (error) {
    console.error("Error fetching site chrome:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch site chrome" }, { status: 500 })
  }
}
