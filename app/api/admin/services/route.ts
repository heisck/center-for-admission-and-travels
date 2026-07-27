import { revalidatePath, revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

import { logAdminAudit } from '@/lib/admin-audit'
import { hasAdminPermission } from '@/lib/admin-permissions'
import { verifyAdminSession } from '@/lib/auth-helpers'
import { ensureUniqueBlogSlug } from '@/lib/blog-slug'
import { normalizeCurrency } from '@/lib/currency'
import { prisma } from '@/lib/prisma'
import { contentToSafeHtml } from '@/lib/safe-html'

function revalidateServiceSurfaces() {
  revalidatePath('/')
  revalidatePath('/global-network')
  revalidatePath('/api/services')
  revalidateTag('public-content', 'max')
}

function serializeService(service: any) {
  return {
    ...service,
    plans: (service.plans || []).map((plan: any) => ({
      ...plan,
      price: Number(plan.price),
    })),
  }
}

function normalizePlans(value: unknown) {
  if (!Array.isArray(value)) return []

  return value
    .map((plan, index) => {
      const price = Number(plan?.price)
      return {
        name: String(plan?.name || '').trim().slice(0, 120),
        description: String(plan?.description || '').trim().slice(0, 500),
        duration: String(plan?.duration || '').trim().slice(0, 120),
        price,
        currency: normalizeCurrency(plan?.currency),
        published: plan?.published !== false,
        order: index,
      }
    })
    .filter((plan) => plan.name && Number.isFinite(plan.price) && plan.price > 0)
}

export async function GET(request: NextRequest) {
  try {
    const session = await verifyAdminSession(request)
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    if (!hasAdminPermission(session.role, 'dashboard.read')) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const services = await prisma.professionalService.findMany({
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
      include: {
        plans: { orderBy: [{ order: 'asc' }, { createdAt: 'asc' }] },
      },
    })

    return NextResponse.json({
      success: true,
      data: services.map(serializeService),
    })
  } catch (error) {
    console.error('[Admin Services] Failed to list services:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to load services' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await verifyAdminSession(request)
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    if (!hasAdminPermission(session.role, 'content.write')) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const name = String(body?.name || '').trim().slice(0, 160)
    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Service name is required' },
        { status: 400 }
      )
    }

    const slug = await ensureUniqueBlogSlug(body?.slug || name, async (candidate) => {
      const existing = await prisma.professionalService.findUnique({
        where: { slug: candidate },
        select: { id: true },
      })
      return Boolean(existing)
    })

    const order = await prisma.professionalService.count()
    const plans = normalizePlans(body?.plans)
    const imageUrl = String(body?.imageUrl || '').trim().slice(0, 2000)
    const published = body?.published !== false
    if (published && !imageUrl) {
      return NextResponse.json(
        { success: false, error: 'Published services require an image' },
        { status: 400 }
      )
    }
    if (published && plans.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Published services require at least one valid plan' },
        { status: 400 }
      )
    }

    const service = await prisma.professionalService.create({
      data: {
        slug,
        name,
        summary: String(body?.summary || '').trim().slice(0, 600),
        descriptionHtml: contentToSafeHtml(String(body?.descriptionHtml || '').slice(0, 50_000)),
        imageUrl,
        published,
        order,
        plans: plans.length > 0 ? { create: plans } : undefined,
      },
      include: {
        plans: { orderBy: [{ order: 'asc' }, { createdAt: 'asc' }] },
      },
    })

    revalidateServiceSurfaces()
    await logAdminAudit({
      request,
      session,
      action: 'professional-service.create',
      entityType: 'professional_service',
      entityId: service.id,
      metadata: { slug: service.slug, planCount: service.plans.length },
    })

    return NextResponse.json({ success: true, data: serializeService(service) })
  } catch (error) {
    console.error('[Admin Services] Failed to create service:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create service' },
      { status: 500 }
    )
  }
}
