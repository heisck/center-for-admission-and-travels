import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NextRequest } from 'next/server'

const checkRateLimitMock = vi.fn()
const rateLimitResponseMock = vi.fn()
const adminUserFindFirstMock = vi.fn()
const adminSessionCreateMock = vi.fn()
const compareMock = vi.fn()
const pruneAdminSessionsMock = vi.fn()

vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: checkRateLimitMock,
  rateLimitResponse: rateLimitResponseMock,
}))

vi.mock('@/lib/prisma', () => ({
  prisma: {
    adminUser: {
      findFirst: adminUserFindFirstMock,
    },
    adminSession: {
      create: adminSessionCreateMock,
    },
  },
}))

vi.mock('bcryptjs', () => ({
  compare: compareMock,
}))

vi.mock('@/lib/auth-helpers', () => ({
  pruneAdminSessions: pruneAdminSessionsMock,
}))

describe('POST /api/admin/auth/login', () => {
  beforeEach(() => {
    checkRateLimitMock.mockResolvedValue({ allowed: true, retryAfterMs: 0 })
    rateLimitResponseMock.mockReturnValue(
      new Response(JSON.stringify({ success: false, error: 'Too many requests' }), { status: 429 })
    )
    adminUserFindFirstMock.mockReset()
    adminSessionCreateMock.mockReset()
    compareMock.mockReset()
    pruneAdminSessionsMock.mockResolvedValue(undefined)
  })

  it('returns 400 when required fields are missing', async () => {
    const { POST } = await import('@/app/api/admin/auth/login/route')

    const request = new NextRequest('http://localhost:3000/api/admin/auth/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: '' }),
    })

    const response = await POST(request)
    const payload = await response.json()

    expect(response.status).toBe(400)
    expect(payload.success).toBe(false)
    expect(payload.error).toMatch(/required/i)
  })

  it('returns 401 for invalid credentials', async () => {
    adminUserFindFirstMock.mockResolvedValue(null)
    const { POST } = await import('@/app/api/admin/auth/login/route')

    const request = new NextRequest('http://localhost:3000/api/admin/auth/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'admin@example.com', password: 'bad-password' }),
    })

    const response = await POST(request)
    const payload = await response.json()

    expect(response.status).toBe(401)
    expect(payload.success).toBe(false)
    expect(payload.error).toMatch(/invalid credentials/i)
  })

  it('creates a session and sets secure cookie for valid credentials', async () => {
    adminUserFindFirstMock.mockResolvedValue({
      id: 'admin-1',
      username: 'admin',
      email: 'admin@example.com',
      password: 'hashed-password',
    })
    compareMock.mockResolvedValue(true)
    adminSessionCreateMock.mockResolvedValue({ id: 'session-1' })

    const { POST } = await import('@/app/api/admin/auth/login/route')

    const request = new NextRequest('http://localhost:3000/api/admin/auth/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'admin@example.com', password: 'correct-password' }),
    })

    const response = await POST(request)
    const payload = await response.json()
    const setCookie = response.headers.get('set-cookie') || ''

    expect(response.status).toBe(200)
    expect(payload.success).toBe(true)
    expect(adminSessionCreateMock).toHaveBeenCalledTimes(1)
    expect(setCookie).toContain('admin_session=')
    expect(setCookie.toLowerCase()).toContain('httponly')
    expect(setCookie.toLowerCase()).toContain('samesite=strict')
  })
})
