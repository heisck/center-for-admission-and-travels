import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import type { AdminSession } from '@/lib/auth-helpers'
import { getClientIp } from '@/lib/security'

interface AdminAuditInput {
  request: NextRequest
  session: AdminSession
  action: string
  entityType: string
  entityId?: string | null
  metadata?: unknown
}

export async function logAdminAudit(input: AdminAuditInput): Promise<void> {
  try {
    await prisma.adminAuditLog.create({
      data: {
        adminUserId: input.session.userId,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId || null,
        metadata: input.metadata === undefined ? null : (input.metadata as any),
        ipAddress: getClientIp(input.request),
        userAgent: input.request.headers.get('user-agent')?.slice(0, 500) || null,
      },
    })
  } catch (error) {
    console.error('[Audit] Failed to write admin audit log:', error)
  }
}
