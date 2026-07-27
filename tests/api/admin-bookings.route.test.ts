import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

const verifyAdminSessionMock = vi.fn()
const hasAdminPermissionMock = vi.fn()
const checkRateLimitMock = vi.fn()
const paymentFindManyMock = vi.fn()
const paymentCountMock = vi.fn()
const paymentFindUniqueMock = vi.fn()
const paymentUpdateMock = vi.fn()

vi.mock('@/lib/auth-helpers', () => ({ verifyAdminSession: verifyAdminSessionMock }))
vi.mock('@/lib/admin-permissions', () => ({ hasAdminPermission: hasAdminPermissionMock }))
vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: checkRateLimitMock,
  rateLimitResponse: vi.fn(() => new Response(null, { status: 429 })),
}))
vi.mock('@/lib/admin-audit', () => ({ logAdminAudit: vi.fn() }))
vi.mock('@/lib/prisma', () => ({
  prisma: {
    payment: {
      findMany: paymentFindManyMock,
      count: paymentCountMock,
      findUnique: paymentFindUniqueMock,
      update: paymentUpdateMock,
    },
  },
}))

describe('/api/admin/bookings', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    verifyAdminSessionMock.mockResolvedValue({ userId: 'admin-1', role: 'SUPER_ADMIN' })
    hasAdminPermissionMock.mockReturnValue(true)
    checkRateLimitMock.mockResolvedValue({ allowed: true, retryAfterMs: 0 })
    paymentFindManyMock.mockResolvedValue([])
    paymentCountMock.mockResolvedValue(0)
  })

  it('lists only manual booking requests', async () => {
    const { GET } = await import('@/app/api/admin/bookings/route')
    const response = await GET(new NextRequest('http://localhost:3000/api/admin/bookings'))

    expect(response.status).toBe(200)
    expect(paymentFindManyMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { metadata: { path: ['type'], equals: 'booking_request' } },
      })
    )
  })

  it('does not allow admins to overwrite an online Paystack payment status', async () => {
    paymentFindUniqueMock.mockResolvedValue({
      id: 'payment-1',
      metadata: { itemType: 'package' },
    })
    const { PATCH } = await import('@/app/api/admin/bookings/route')
    const response = await PATCH(
      new NextRequest('http://localhost:3000/api/admin/bookings', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ id: 'payment-1', status: 'success' }),
      })
    )

    expect(response.status).toBe(400)
    expect((await response.json()).error).toMatch(/Paystack/i)
    expect(paymentUpdateMock).not.toHaveBeenCalled()
  })
})
