/**
 * API Route: /api/admin/content/service-pages/[serviceId]
 * 
 * Update individual service page
 */

import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath, revalidateTag } from 'next/cache'
import { verifyAdminSession } from '@/lib/auth-helpers'
import { updateServicePage } from '@/lib/prisma-content-helpers'
import { hasAdminPermission } from '@/lib/admin-permissions'
import { logAdminAudit } from '@/lib/admin-audit'
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit'
import { getClientIp } from '@/lib/security'

const SERVICE_IDS = new Set(['study-abroad', 'work-abroad', 'global-network'])

// PUT /api/admin/content/service-pages/[serviceId]
export async function PUT(
  request: NextRequest,
  // Handle both Promise and direct params (Next.js 15+ vs 14/16)
  { params }: { params: Promise<{ serviceId: string }> | { serviceId: string } }
) {
  try {
    const session = await verifyAdminSession(request)
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    if (!hasAdminPermission(session.role, 'content.write')) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }
    const { allowed, retryAfterMs } = await checkRateLimit(
      `admin-service-page-write:${session.userId}:${getClientIp(request)}`,
      { maxRequests: 60, windowMs: 60_000 }
    )
    if (!allowed) return rateLimitResponse(retryAfterMs)

    // Resolve params in case it's a Promise (framework version differences)
    const resolvedParams = await Promise.resolve(params)
    const { serviceId } = resolvedParams

    if (!SERVICE_IDS.has(serviceId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid service page ID' },
        { status: 400 }
      )
    }
    const body = await request.json().catch(() => null)
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 })
    }
    if (JSON.stringify(body).length > 1_000_000) {
      return NextResponse.json({ success: false, error: 'Content payload is too large' }, { status: 413 })
    }

    // Transform frontend format to database format
    const updateData: any = {
      title: body.title,
      description: body.description,
      icon: body.icon,
      route: body.route,
      heroImageUrl: body.heroImage,
      heroImagePositionX: body.heroImagePosition?.x,
      heroImagePositionY: body.heroImagePosition?.y,
      bannerTitle: body.bannerTitle,
      bannerSubtitle: body.bannerSubtitle,
      overview: body.overview,
      visaGuidance: body.visaGuidance,
      benefits: body.benefits,
      requirements: body.requirements,
      countries: body.countries?.map((c: any) => ({
        name: c.name,
        description: c.description,
        image: c.image,
      })),
      successStories: body.successStories,
      scholarships: body.scholarships,
      whyStudyOutsideThisCountry: body.whyStudyOutsideThisCountry,
    }

    await updateServicePage(serviceId, updateData)

    revalidatePath('/api/content')
    revalidatePath('/', 'layout')
    revalidatePath('/') // home service cards use service-page hero images
    // Public service pages that use destinations carousel
    revalidatePath('/study-abroad')
    revalidatePath('/work-abroad')
    revalidatePath('/global-network')
    revalidatePath('/travel-tours')
    if (body.route) revalidatePath(String(body.route))
    revalidateTag('public-content', 'max')

    await logAdminAudit({
      request,
      session,
      action: 'service_page.update',
      entityType: 'service_page',
      entityId: serviceId,
      metadata: { title: body.title },
    })

    return NextResponse.json({ success: true, message: `Service page ${serviceId} updated` })
  } catch (error: any) {
    const resolvedParams = await Promise.resolve(params as any)
    console.error(`Error updating service page ${resolvedParams.serviceId}:`, error)
    return NextResponse.json({ success: false, error: 'Failed to update service page' }, { status: 500 })
  }
}
