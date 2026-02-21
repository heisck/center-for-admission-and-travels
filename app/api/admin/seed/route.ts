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

// POST /api/admin/seed
export async function POST(request: NextRequest) {
  try {
    // Verify admin session
    const session = await verifyAdminSession(request)
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    // Dynamically import and execute seed function
    // This avoids loading Prisma Client twice
    const seedModule = await import('@/prisma/seed')
    
    // The seed.ts file exports a main function, but we need to call it
    // Since seed.ts doesn't export main, we'll use a different approach
    const { exec } = require('child_process')
    const { promisify } = require('util')
    const execAsync = promisify(exec)

    // Run seed script with timeout
    const { stdout, stderr } = await Promise.race([
      execAsync('npx tsx prisma/seed.ts'),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Seed timeout after 60 seconds')), 60000)
      )
    ]) as any
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database seeded successfully',
      output: stdout 
    })
  } catch (error: any) {
    console.error('Error seeding database:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Failed to seed database' 
    }, { status: 500 })
  }
}
