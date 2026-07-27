import { afterEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

import { getBaseUrl } from '@/lib/url'

describe('canonical base URL', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('does not trust a hostile request host in production', () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('NEXT_PUBLIC_BASE_URL', '')
    vi.stubEnv('VERCEL_PROJECT_PRODUCTION_URL', '')
    vi.stubEnv('VERCEL_URL', '')

    const request = new NextRequest('https://attacker.example/reset-password')
    expect(getBaseUrl(request)).toBe('https://catravels.com')
  })

  it('prefers the configured HTTPS deployment origin', () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('NEXT_PUBLIC_BASE_URL', 'https://www.catravels.com/path')

    expect(getBaseUrl()).toBe('https://www.catravels.com')
  })

  it('permits a local HTTP request origin only outside production', () => {
    vi.stubEnv('NODE_ENV', 'test')
    vi.stubEnv('NEXT_PUBLIC_BASE_URL', '')
    vi.stubEnv('VERCEL_PROJECT_PRODUCTION_URL', '')
    vi.stubEnv('VERCEL_URL', '')

    const request = new NextRequest('http://localhost:4173/example')
    expect(getBaseUrl(request)).toBe('http://localhost:4173')
  })
})
