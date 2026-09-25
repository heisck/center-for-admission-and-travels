import { describe, expect, it } from 'vitest'
import { NextRequest } from 'next/server'
import { getClientIp } from '@/lib/security'
import { hasAdminPermission } from '@/lib/admin-permissions'
import { GET as paymentVerifyGet } from '@/app/api/payments/verify/route'
import { POST as paymentWebhookPost } from '@/app/api/payments/webhook/route'

describe('Security & Architecture Hardening Tests', () => {
  describe('getClientIp spoofing resistance', () => {
    it('prioritizes trusted edge headers (cf-connecting-ip) over x-forwarded-for', () => {
      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          'cf-connecting-ip': '203.0.113.195',
          'x-forwarded-for': '10.0.0.1, 10.0.0.2',
        },
      })
      expect(getClientIp(request)).toBe('203.0.113.195')
    })

    it('prioritizes x-real-ip when cf-connecting-ip is absent', () => {
      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          'x-real-ip': '198.51.100.42',
          'x-forwarded-for': '10.0.0.1, 10.0.0.2',
        },
      })
      expect(getClientIp(request)).toBe('198.51.100.42')
    })

    it('uses the closest proxy IP (rightmost) from x-forwarded-for when edge headers are absent', () => {
      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          'x-forwarded-for': 'spoofed.attacker.ip, 198.51.100.99',
        },
      })
      expect(getClientIp(request)).toBe('198.51.100.99')
    })
  })

  describe('RBAC support permissions', () => {
    it('allows support.manage for SUPPORT, ADMIN, and SUPER_ADMIN roles', () => {
      expect(hasAdminPermission('SUPPORT', 'support.manage')).toBe(true)
      expect(hasAdminPermission('ADMIN', 'support.manage')).toBe(true)
      expect(hasAdminPermission('SUPER_ADMIN', 'support.manage')).toBe(true)
    })

    it('denies support.manage for VIEWER and EDITOR roles', () => {
      expect(hasAdminPermission('VIEWER', 'support.manage')).toBe(false)
      expect(hasAdminPermission('EDITOR', 'support.manage')).toBe(false)
    })
  })

  describe('Payment API alias routes', () => {
    it('exports canonical GET handler from /api/payments/verify', () => {
      expect(typeof paymentVerifyGet).toBe('function')
    })

    it('exports canonical POST handler from /api/payments/webhook', () => {
      expect(typeof paymentWebhookPost).toBe('function')
    })
  })

  describe('OAuth redirect sanitization', () => {
    it('blocks internal /api routes from OAuth redirect', async () => {
      const { sanitizeAuthRedirect } = await import('@/lib/google-oauth')
      expect(sanitizeAuthRedirect('/api/cron/cleanup')).toBe('/')
      expect(sanitizeAuthRedirect('/api/user/profile')).toBe('/')
      expect(sanitizeAuthRedirect('/api/admin/payments')).toBe('/')
      expect(sanitizeAuthRedirect('/api')).toBe('/')
      expect(sanitizeAuthRedirect('/profile')).toBe('/profile')
      expect(sanitizeAuthRedirect('/my-payments?page=2')).toBe('/my-payments?page=2')
    })
  })

  describe('File upload and media security', () => {
    it('rejects files with invalid extensions or spoofed MIME types', async () => {
      const { validateImageFile, validateImageFileBytes } = await import('@/lib/cloudinary')
      
      // Fake JPEG with .exe extension
      const exeFile = new File([new Uint8Array([0xff, 0xd8, 0xff, 0xe0])], 'malware.exe', { type: 'image/jpeg' })
      expect(validateImageFile(exeFile).valid).toBe(false)
      expect(validateImageFile(exeFile).error).toMatch(/extension/i)

      // Fake JPEG extension with text content (spoofed magic bytes)
      const fakeJpg = new File([Buffer.from('not an image header')], 'photo.jpg', { type: 'image/jpeg' })
      expect(validateImageFile(fakeJpg).valid).toBe(true)
      const byteCheck = await validateImageFileBytes(fakeJpg)
      expect(byteCheck.valid).toBe(false)
      expect(byteCheck.error).toMatch(/signature|format/i)

      // Valid PNG header with .png extension
      const validPngBytes = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0, 0, 0, 0, 0])
      const validPng = new File([validPngBytes], 'diagram.png', { type: 'image/png' })
      expect(validateImageFile(validPng).valid).toBe(true)
      const validPngCheck = await validateImageFileBytes(validPng)
      expect(validPngCheck.valid).toBe(true)
    })
  })

  describe('Email header and body injection defenses', () => {
    it('escapes HTML in contact notifications and cleans CRLF in email subjects', async () => {
      const { contactNotificationEmail } = await import('@/lib/email-templates')
      const result = contactNotificationEmail({
        name: 'Attacker <script>alert(1)</script>',
        email: 'attacker@example.com',
        phone: '+123456789',
        subject: 'Inquiry\r\nBcc: victim@example.com',
        message: '<b>Hello</b><iframe src="evil.com"></iframe>',
      })

      // Subject has CRLF stripped
      expect(result.subject).not.toContain('\r')
      expect(result.subject).not.toContain('\n')
      expect(result.subject).toBe('New Contact: Inquiry Bcc: victim@example.com')

      // HTML body escapes tags in name and message
      expect(result.html).not.toContain('<script>')
      expect(result.html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;')
      expect(result.html).not.toContain('<iframe')
      expect(result.html).toContain('&lt;iframe')
    })
  })

  describe('DoS and Payload Limiting protections', () => {
    it('blocks unauthenticated access to cron cleanup', async () => {
      const { GET: cronGet } = await import('@/app/api/cron/cleanup/route')
      const req = new NextRequest('http://localhost:3000/api/cron/cleanup', {
        headers: { authorization: 'Bearer invalid-secret' },
      })
      const res = await cronGet(req)
      expect(res.status).toBe(401)
    })

    it('rejects oversize payloads with HTTP 413 in payment webhook', async () => {
      const { POST: webhookPost } = await import('@/app/api/payment/webhook/route')
      process.env.PAYSTACK_SECRET_KEY = 'sk_test_1234567890'
      const req = new NextRequest('http://localhost:3000/api/payment/webhook', {
        method: 'POST',
        headers: {
          'content-length': '2000000',
        },
      })
      const res = await webhookPost(req)
      expect(res.status).toBe(413)
    })
  })
})

