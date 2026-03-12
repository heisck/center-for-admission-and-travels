import { NextResponse } from "next/server"

import { getSiteChromeContent } from "@/lib/public-content"

const CHROME_EDGE_CACHE_SECONDS = 30
const CHROME_EDGE_STALE_SECONDS = 60

export async function GET() {
  try {
    const chrome = await getSiteChromeContent()

    return NextResponse.json(
      { success: true, data: chrome },
      {
        headers: {
          "Cache-Control": `public, max-age=0, s-maxage=${CHROME_EDGE_CACHE_SECONDS}, stale-while-revalidate=${CHROME_EDGE_STALE_SECONDS}`,
        },
      }
    )
  } catch (error) {
    console.error("Error fetching site chrome:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch site chrome" }, { status: 500 })
  }
}
