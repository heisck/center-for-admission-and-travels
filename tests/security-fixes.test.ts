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
})
