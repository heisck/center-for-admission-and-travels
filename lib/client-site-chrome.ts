import type { SiteChromeContent } from "@/lib/public-content"

const SITE_CHROME_CACHE_KEY = "site_chrome_payload"
const SITE_CHROME_CACHE_TTL_MS = 30_000

type SiteChromeSnapshot = {
  data: SiteChromeContent
  cachedAt: number
}

let siteChromeSnapshot: SiteChromeSnapshot | null = null
let siteChromePromise: Promise<SiteChromeContent | null> | null = null

function isFresh(snapshot: SiteChromeSnapshot | null) {
  return !!snapshot && Date.now() - snapshot.cachedAt < SITE_CHROME_CACHE_TTL_MS
}

function readStoredSnapshot(): SiteChromeSnapshot | null {
  if (typeof window === "undefined") return null

  try {
    const raw = window.sessionStorage.getItem(SITE_CHROME_CACHE_KEY)
    if (!raw) return null

    const parsed = JSON.parse(raw) as SiteChromeSnapshot
    if (!parsed?.data || typeof parsed.cachedAt !== "number") {
      window.sessionStorage.removeItem(SITE_CHROME_CACHE_KEY)
      return null
    }

    if (!isFresh(parsed)) {
      window.sessionStorage.removeItem(SITE_CHROME_CACHE_KEY)
      return null
    }

    return parsed
  } catch {
    window.sessionStorage.removeItem(SITE_CHROME_CACHE_KEY)
    return null
  }
}

function writeStoredSnapshot(snapshot: SiteChromeSnapshot) {
  if (typeof window === "undefined") return

  try {
    window.sessionStorage.setItem(SITE_CHROME_CACHE_KEY, JSON.stringify(snapshot))
  } catch {
    // Best-effort client cache only.
  }
}

export function primeClientSiteChrome(data: SiteChromeContent) {
  const snapshot = {
    data,
    cachedAt: Date.now(),
  }

  siteChromeSnapshot = snapshot
  writeStoredSnapshot(snapshot)
}

export function readClientSiteChrome(): SiteChromeContent | null {
  if (isFresh(siteChromeSnapshot)) {
    return siteChromeSnapshot!.data
  }

  const storedSnapshot = readStoredSnapshot()
  if (!storedSnapshot) {
    siteChromeSnapshot = null
    return null
  }

  siteChromeSnapshot = storedSnapshot
  return storedSnapshot.data
}

export async function getClientSiteChrome(force = false): Promise<SiteChromeContent | null> {
  const cachedChrome = !force ? readClientSiteChrome() : null
  if (cachedChrome) return cachedChrome

  if (siteChromePromise) {
    return siteChromePromise
  }

  siteChromePromise = (async () => {
    try {
      const response = await fetch("/api/site-chrome", { cache: "force-cache" })
      const result = await response.json()
      if (!result?.success || !result?.data) {
        return null
      }

      primeClientSiteChrome(result.data)
      return result.data as SiteChromeContent
    } catch {
      return null
    } finally {
      siteChromePromise = null
    }
  })()

  return siteChromePromise
}

export async function getClientWhatsAppNumber(force = false): Promise<string | null> {
  const chrome = await getClientSiteChrome(force)
  const cachedNumber = chrome?.contact?.whatsappNumber?.trim()
  if (cachedNumber) return cachedNumber

  try {
    const response = await fetch("/api/contact/whatsapp", { cache: "force-cache" })
    const result = await response.json()
    const number = typeof result?.whatsappNumber === "string" ? result.whatsappNumber.trim() : ""
    return number || null
  } catch {
    return null
  }
}
