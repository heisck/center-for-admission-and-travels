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
import { hasAdminPermission } from '@/lib/admin-permissions'
import { logAdminAudit } from '@/lib/admin-audit'

// POST /api/admin/seed
export async function POST(request: NextRequest) {
  const ip = getClientIp(request)
  try {
    // Verify admin session
    const session = await verifyAdminSession(request)
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    if (!hasAdminPermission(session.role, 'system.seed')) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const { allowed, retryAfterMs } = await checkRateLimit(`admin-seed:${session.userId}:${ip}`, {
      maxRequests: 2,
      windowMs: 10 * 60_000,
    })
    if (!allowed) return rateLimitResponse(retryAfterMs)

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
      await logAdminAudit({
        request,
        session,
        action: 'system.seed.failed',
        entityType: 'system',
        metadata: {
          code: result.code,
          stderr: result.stderr || null,
        },
      })
      return NextResponse.json(
        { success: false, error: 'Failed to seed database. Check server logs for details.' },
        { status: 500 }
      )
    }

    await logAdminAudit({
      request,
      session,
      action: 'system.seed.success',
      entityType: 'system',
    })

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully',
    })
  } catch (error) {
    console.error('Error seeding database:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to seed database',
    }, { status: 500 })
  }
}

