/**
 * API Route: /api/admin/content/service-pages/[serviceId]
 * 
 * Update individual service page
 */

import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminSession } from '@/lib/auth-helpers'
import { updateServicePage } from '@/lib/prisma-content-helpers'

// PUT /api/admin/content/service-pages/[serviceId]
export async function PUT(
  request: NextRequest,
  { params }: { params: { serviceId: string } }
) {
  try {
    const session = await verifyAdminSession(request)
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { serviceId } = params
    const body = await request.json()

    // Transform frontend format to database format
    const updateData: any = {
      title: body.title,
      description: body.description,
      icon: body.icon,
      route: body.route,
      heroImageUrl: body.heroImage,
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
    }

    await updateServicePage(serviceId, updateData)

    return NextResponse.json({ success: true, message: `Service page ${serviceId} updated` })
  } catch (error: any) {
    console.error(`Error updating service page ${params.serviceId}:`, error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
