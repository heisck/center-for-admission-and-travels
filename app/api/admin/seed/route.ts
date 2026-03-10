/**
 * API Route: /api/admin/seed
 *
 * Seed the database with initial content.
 * This should be called manually after deployment or via a cron job.
 *
 * Usage: POST /api/admin/seed
 */

import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminSession } from '@/lib/auth-helpers'
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit'
import { getClientIp } from '@/lib/security'
import { spawn } from 'child_process'

// POST /api/admin/seed
export async function POST(request: NextRequest) {
  const ip = getClientIp(request)
  const { allowed, retryAfterMs } = await checkRateLimit(`admin-seed:${ip}`, {
    maxRequests: 2,
    windowMs: 10 * 60_000,
  })
  if (!allowed) return rateLimitResponse(retryAfterMs)

  try {
    const seedEnabled =
      process.env.NODE_ENV !== 'production' || process.env.ENABLE_ADMIN_SEED_ENDPOINT === 'true'
    if (!seedEnabled) {
      return NextResponse.json(
        {
          success: false,
          error: 'Seed endpoint is disabled in production. Set ENABLE_ADMIN_SEED_ENDPOINT=true to enable.',
        },
        { status: 403 }
      )
    }

    if (process.env.ALLOW_DATABASE_SEED !== 'true') {
      return NextResponse.json(
        {
          success: false,
          error: 'Set ALLOW_DATABASE_SEED=true to allow controlled seeding.',
        },
        { status: 403 }
      )
    }

    if (process.env.NODE_ENV === 'production' && process.env.ALLOW_PRODUCTION_SEED !== 'true') {
      return NextResponse.json(
        {
          success: false,
          error: 'Set ALLOW_PRODUCTION_SEED=true for one-off production seeding.',
        },
        { status: 403 }
      )
    }

    // Verify admin session
    const session = await verifyAdminSession(request)
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const command = process.platform === 'win32' ? 'npx.cmd' : 'npx'
    const args = ['tsx', 'prisma/seed.ts']

    const result = await new Promise<{ code: number | null; stderr: string }>((resolve, reject) => {
      const child = spawn(command, args, {
        cwd: process.cwd(),
        env: process.env,
        stdio: ['ignore', 'pipe', 'pipe'],
      })

      let stderr = ''
      const stderrLimit = 2000
      child.stderr.on('data', (chunk: Buffer | string) => {
        if (stderr.length >= stderrLimit) return
        stderr += String(chunk).slice(0, stderrLimit - stderr.length)
      })

      const timeout = setTimeout(() => {
        child.kill()
        reject(new Error('Seed timeout after 120 seconds'))
      }, 120_000)

      child.on('error', (error) => {
        clearTimeout(timeout)
        reject(error)
      })

      child.on('close', (code) => {
        clearTimeout(timeout)
        resolve({ code, stderr })
      })
    })

    if (result.code !== 0) {
      console.error('Error seeding database:', result.stderr || `Process exited with code ${result.code}`)
      return NextResponse.json(
        { success: false, error: 'Failed to seed database. Check server logs for details.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully',
    })
  } catch (error: any) {
    console.error('Error seeding database:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to seed database',
    }, { status: 500 })
  }
}

