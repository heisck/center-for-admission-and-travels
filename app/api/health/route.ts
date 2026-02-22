/**
 * Health check endpoint for uptime monitoring
 * GET /api/health - Returns 200 if app is running
 * Use with external monitoring (UptimeRobot, Pingdom, etc.)
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    // Quick DB ping to ensure database is reachable
    await prisma.$queryRaw`SELECT 1`
    return NextResponse.json(
      { status: 'ok', timestamp: new Date().toISOString(), database: 'connected' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Health check failed:', error)
    return NextResponse.json(
      { status: 'error', timestamp: new Date().toISOString(), database: 'disconnected' },
      { status: 503 }
    )
  }
}
