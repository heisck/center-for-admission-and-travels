import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdminSession } from '@/lib/auth-helpers'
import { hasAdminPermission } from '@/lib/admin-permissions'
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit'
import { getClientIp } from '@/lib/security'

export async function GET(request: NextRequest) {
  const ip = getClientIp(request)
  try {
    const session = await verifyAdminSession(request)
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    if (!hasAdminPermission(session.role, 'payments.read')) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const { allowed, retryAfterMs } = await checkRateLimit(`admin-payments:${session.userId}:${ip}`, {
      maxRequests: 60,
      windowMs: 60_000,
    })
    if (!allowed) return rateLimitResponse(retryAfterMs)

    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')))
    const status = searchParams.get('status') || undefined
    const search = searchParams.get('search') || undefined

    const where: any = {}
    const validStatuses = new Set(['pending', 'processing', 'success', 'failed', 'cancelled'])

    if (status && status !== 'all') {
      if (!validStatuses.has(status)) {
        return NextResponse.json({ success: false, error: 'Invalid payment status filter' }, { status: 400 })
      }
      where.status = status
    }

    if (search) {
      where.OR = [
        { customerName: { contains: search, mode: 'insensitive' } },
        { customerEmail: { contains: search, mode: 'insensitive' } },
        { reference: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        include: {
          user: {
            select: { id: true, username: true, email: true, displayName: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.payment.count({ where }),
    ])

    const emailsToCheck = [...new Set(payments.map((p) => p.user?.email || p.customerEmail).filter(Boolean))] as string[]
    const newsletterEmails = emailsToCheck.length
      ? await prisma.newsletterSubscriber.findMany({
          where: { email: { in: emailsToCheck } },
          select: { email: true },
        })
      : []
    const newsletterSet = new Set(newsletterEmails.map((n) => n.email.toLowerCase()))

    const paymentsWithNewsletter = payments.map((p) => {
      const email = p.user?.email || p.customerEmail
      return {
        ...p,
        newsletterSubscribed: email ? newsletterSet.has(email.toLowerCase()) : null,
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        payments: paymentsWithNewsletter,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    })
  } catch (error) {
    console.error('Error fetching payments:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch payments' }, { status: 500 })
  }
}
