import { revalidatePath, revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

import { logAdminAudit } from '@/lib/admin-audit'
import { hasAdminPermission } from '@/lib/admin-permissions'
import { verifyAdminSession } from '@/lib/auth-helpers'
import { ensureUniqueBlogSlug } from '@/lib/blog-slug'
import { deleteUnreferencedCloudinaryUrls } from '@/lib/cloudinary-orphans'
import { normalizeCurrency } from '@/lib/currency'
import { prisma } from '@/lib/prisma'
import { contentToSafeHtml } from '@/lib/safe-html'
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit'
import { getClientIp } from '@/lib/security'

function isValidImageUrl(value: string) {
  return value.startsWith('/') || /^https:\/\/[^\s]+$/i.test(value)
}

async function enforceServiceWriteLimit(request: NextRequest, userId: string) {
  const { allowed, retryAfterMs } = await checkRateLimit(
    `admin-services-write:${userId}:${getClientIp(request)}`,
    { maxRequests: 30, windowMs: 60_000 }
  )
  return allowed ? null : rateLimitResponse(retryAfterMs)
}

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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await verifyAdminSession(request)
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    if (!hasAdminPermission(session.role, 'content.write')) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }
    const limited = await enforceServiceWriteLimit(request, session.userId)
    if (limited) return limited

    const { id } = await params
    if (!/^[A-Za-z0-9_-]{1,128}$/.test(id)) {
      return NextResponse.json({ success: false, error: 'Invalid service ID' }, { status: 400 })
    }
    const body = await request.json().catch(() => null)
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 })
    }
    const existing = await prisma.professionalService.findUnique({
      where: { id },
      include: { plans: true },
    })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Service not found' }, { status: 404 })
    }

    const name = String(body?.name || '').trim().slice(0, 160)
    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Service name is required' },
        { status: 400 }
      )
    }

    const slug = await ensureUniqueBlogSlug(body?.slug || name, async (candidate) => {
      const hit = await prisma.professionalService.findFirst({
        where: { slug: candidate, NOT: { id } },
        select: { id: true },
      })
      return Boolean(hit)
    })

    const incomingPlans = Array.isArray(body?.plans) ? body.plans : []
    if (incomingPlans.length > 50) {
      return NextResponse.json(
        { success: false, error: 'A service cannot contain more than 50 plans' },
        { status: 400 }
      )
    }
    const imageUrl = String(body?.imageUrl || '').trim().slice(0, 2000)
    const published = body?.published !== false
    if (imageUrl && !isValidImageUrl(imageUrl)) {
      return NextResponse.json(
        { success: false, error: 'Image must use an HTTPS URL or a local /public path' },
        { status: 400 }
      )
    }
    const validPlanCount = incomingPlans.filter((plan: any) => {
      const planName = String(plan?.name || '').trim()
      const price = Number(plan?.price)
      return planName && Number.isFinite(price) && price > 0 && plan?.published !== false
    }).length
    if (published && !imageUrl) {
      return NextResponse.json(
        { success: false, error: 'Published services require an image' },
        { status: 400 }
      )
    }
    if (published && validPlanCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Published services require at least one valid plan' },
        { status: 400 }
      )
    }
    const retainedPlanIds = incomingPlans
      .map((plan: any) => String(plan?.id || '').trim())
      .filter((planId: string) => existing.plans.some((plan) => plan.id === planId))

    const service = await prisma.$transaction(async (tx) => {
      await tx.professionalService.update({
        where: { id },
        data: {
          slug,
          name,
          summary: String(body?.summary || '').trim().slice(0, 600),
          descriptionHtml: contentToSafeHtml(String(body?.descriptionHtml || '').slice(0, 50_000)),
          imageUrl,
          published,
        },
      })

      await tx.professionalServicePlan.deleteMany({
        where: {
          serviceId: id,
          ...(retainedPlanIds.length > 0 ? { id: { notIn: retainedPlanIds } } : {}),
        },
      })

      for (const [index, rawPlan] of incomingPlans.entries()) {
        const planName = String(rawPlan?.name || '').trim().slice(0, 120)
        const price = Number(rawPlan?.price)
        if (!planName || !Number.isFinite(price) || price <= 0) continue

        const data = {
          name: planName,
          description: String(rawPlan?.description || '').trim().slice(0, 500),
          duration: String(rawPlan?.duration || '').trim().slice(0, 120),
          price,
          currency: normalizeCurrency(rawPlan?.currency),
          published: rawPlan?.published !== false,
          order: index,
        }
        const planId = String(rawPlan?.id || '').trim()
        if (planId && retainedPlanIds.includes(planId)) {
          await tx.professionalServicePlan.update({
            where: { id: planId },
            data,
          })
        } else {
          await tx.professionalServicePlan.create({
            data: { ...data, serviceId: id },
          })
        }
      }

      return tx.professionalService.findUniqueOrThrow({
        where: { id },
        include: {
          plans: { orderBy: [{ order: 'asc' }, { createdAt: 'asc' }] },
        },
      })
    })

    if (existing.imageUrl && existing.imageUrl !== service.imageUrl) {
      void deleteUnreferencedCloudinaryUrls([existing.imageUrl])
    }

    revalidateServiceSurfaces()
    await logAdminAudit({
      request,
      session,
      action: 'professional-service.update',
      entityType: 'professional_service',
      entityId: service.id,
      metadata: { slug: service.slug, planCount: service.plans.length },
    })

    return NextResponse.json({ success: true, data: serializeService(service) })
  } catch (error) {
    console.error('[Admin Services] Failed to update service:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update service' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await verifyAdminSession(request)
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    if (!hasAdminPermission(session.role, 'content.write')) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }
    const limited = await enforceServiceWriteLimit(request, session.userId)
    if (limited) return limited

    const { id } = await params
    if (!/^[A-Za-z0-9_-]{1,128}$/.test(id)) {
      return NextResponse.json({ success: false, error: 'Invalid service ID' }, { status: 400 })
    }
    const existing = await prisma.professionalService.findUnique({
      where: { id },
      select: { id: true, slug: true, imageUrl: true },
    })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Service not found' }, { status: 404 })
    }

    await prisma.professionalService.delete({ where: { id } })
    if (existing.imageUrl) {
      void deleteUnreferencedCloudinaryUrls([existing.imageUrl])
    }

    revalidateServiceSurfaces()
    await logAdminAudit({
      request,
      session,
      action: 'professional-service.delete',
      entityType: 'professional_service',
      entityId: id,
      metadata: { slug: existing.slug },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Admin Services] Failed to delete service:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete service' },
      { status: 500 }
    )
  }
}
