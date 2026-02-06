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

// Prisma Client with connection pooling configuration
// Connection URL is automatically read from process.env.DATABASE_URL
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    // Connection pooling is handled by the DATABASE_URL connection string
    // For Supabase, use transaction mode pooler (port 6543) for better connection limits
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
