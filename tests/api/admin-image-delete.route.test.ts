import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

const verifyAdminSessionMock = vi.fn()
const hasAdminPermissionMock = vi.fn()
const checkRateLimitMock = vi.fn()
const collectReferencedCloudinaryIdsMock = vi.fn()
const deleteImageMock = vi.fn()
const extractPublicIdMock = vi.fn()
const logAdminAuditMock = vi.fn()

vi.mock('@/lib/auth-helpers', () => ({ verifyAdminSession: verifyAdminSessionMock }))
vi.mock('@/lib/admin-permissions', () => ({ hasAdminPermission: hasAdminPermissionMock }))
vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: checkRateLimitMock,
  rateLimitResponse: vi.fn(() => new Response(null, { status: 429 })),
}))
vi.mock('@/lib/cloudinary-orphans', () => ({
  collectReferencedCloudinaryIds: collectReferencedCloudinaryIdsMock,
}))
vi.mock('@/lib/cloudinary', () => ({
  deleteImage: deleteImageMock,
  extractPublicId: extractPublicIdMock,
}))
vi.mock('@/lib/admin-audit', () => ({ logAdminAudit: logAdminAuditMock }))

describe('DELETE /api/admin/images/delete', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    verifyAdminSessionMock.mockResolvedValue({ userId: 'admin-1', role: 'SUPER_ADMIN' })
    hasAdminPermissionMock.mockReturnValue(true)
    checkRateLimitMock.mockResolvedValue({ allowed: true, retryAfterMs: 0 })
    extractPublicIdMock.mockReturnValue('site/live-image')
    logAdminAuditMock.mockResolvedValue(undefined)
  })

  it('blocks deletion while an image is referenced by CMS content', async () => {
    collectReferencedCloudinaryIdsMock.mockResolvedValue(new Set(['site/live-image']))
    const { DELETE } = await import('@/app/api/admin/images/delete/route')
    const request = new NextRequest(
      'http://localhost:3000/api/admin/images/delete?url=https%3A%2F%2Fres.cloudinary.com%2Fdemo%2Fimage%2Fupload%2Fsite%2Flive-image.jpg',
      { method: 'DELETE' }
    )

    const response = await DELETE(request)

    expect(response.status).toBe(409)
    expect(deleteImageMock).not.toHaveBeenCalled()
    expect(logAdminAuditMock).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'media.delete.blocked', entityId: 'site/live-image' })
    )
  })
})
