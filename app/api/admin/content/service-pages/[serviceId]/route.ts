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

    // Resolve params in case it's a Promise (framework version differences)
    const resolvedParams = await Promise.resolve(params)
    const { serviceId } = resolvedParams

    if (!serviceId) {
      return NextResponse.json(
        { success: false, error: 'Missing serviceId in route params' },
        { status: 400 }
      )
    }
    const body = await request.json()

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
