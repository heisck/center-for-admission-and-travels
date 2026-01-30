/**
 * Prisma Client Singleton
 * 
 * Use this file to import Prisma client throughout the app.
 * This ensures we only create one instance of PrismaClient.
 * 
 * For Prisma 7, the connection URL is read from DATABASE_URL env variable
 * automatically, or you can pass it via adapter.
 */

import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Prisma 7 automatically reads DATABASE_URL from environment
// No need to pass it explicitly unless using Accelerate
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    // Connection URL is automatically read from process.env.DATABASE_URL
    // For Prisma Accelerate, use: { accelerateUrl: process.env.PRISMA_ACCELERATE_URL }
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
