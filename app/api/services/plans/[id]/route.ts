import { NextRequest, NextResponse } from 'next/server'

import { normalizeCurrency } from '@/lib/currency'
import { prisma } from '@/lib/prisma'

export const revalidate = 60

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const planId = String(id || '').trim()
    if (!planId || !/^[A-Za-z0-9_-]{1,128}$/.test(planId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid or missing service plan ID' },
        { status: 400 }
      )
    }

    const plan = await prisma.professionalServicePlan.findFirst({
      where: {
        id: planId,
        published: true,
        service: { published: true },
      },
      include: {
        service: {
          select: {
            id: true,
            name: true,
            summary: true,
            imageUrl: true,
          },
        },
      },
    })

    if (!plan) {
      return NextResponse.json(
        { success: false, error: 'Service plan not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        id: plan.id,
        name: `${plan.service.name} — ${plan.name}`,
        description: plan.description || plan.service.summary,
        price: Number(plan.price),
        currency: normalizeCurrency(plan.currency),
        duration: plan.duration,
        category: 'service',
        highlights: [plan.name, plan.duration, plan.description].filter(Boolean),
        images: plan.service.imageUrl ? [plan.service.imageUrl] : [],
        serviceId: plan.service.id,
        serviceName: plan.service.name,
        planName: plan.name,
      },
    })
  } catch (error) {
    console.error('[Services] Failed to fetch service plan:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to load service plan' },
      { status: 500 }
    )
  }
}
