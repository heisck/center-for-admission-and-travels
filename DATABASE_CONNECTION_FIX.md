# Database Connection Pooling Fix

## What the Error Means

**This error is NOT about limiting website visitors!** 

The error `MaxClientsInSessionMode: max clients reached` means:
- During **build time** (when deploying), Prisma is trying to create too many database connections
- Supabase has connection limits (usually 20-100 depending on your plan)
- In "Session mode", connections are limited to the pool size
- This happens during `prisma generate` or `prisma migrate deploy` in the build process

## Why It Happens

1. **Build Process**: During deployment, multiple Prisma operations run:
   - `prisma generate` - Creates Prisma Client
   - `prisma migrate deploy` - Runs migrations
   - These can create multiple connections simultaneously

2. **Session Mode**: Supabase's default connection uses "Session mode" which has stricter limits

3. **Multiple Builds**: If multiple deployments happen at once, they compete for connections

## Solutions

### Solution 1: Use Transaction Mode Pooler (Recommended)

Supabase provides a **Transaction Mode Pooler** that allows more connections. Change your `DATABASE_URL`:

**Before (Session Mode - Port 5432):**
```
postgresql://user:password@aws-1-eu-west-1.pooler.supabase.com:5432/dbname
```

**After (Transaction Mode - Port 6543):**
```
postgresql://user:password@aws-1-eu-west-1.pooler.supabase.com:6543/dbname?pgbouncer=true
```

**Note**: Transaction mode is perfect for serverless/edge functions but has some limitations:
- No prepared statements (Prisma handles this automatically)
- Some advanced PostgreSQL features may not work
- Perfect for most web applications

### Solution 2: Configure Prisma Connection Pool Size

Add connection pool configuration to your Prisma schema or environment:

**In `prisma/schema.prisma`:**
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  // Limit connection pool size
  directUrl = env("DIRECT_URL") // Optional: direct connection for migrations
}
```

**In your `.env` or deployment platform:**
```env
DATABASE_URL="postgresql://...?connection_limit=5&pool_timeout=10"
DIRECT_URL="postgresql://...:5432/..." # Direct connection for migrations
```

### Solution 3: Optimize Build Process

Modify your `package.json` to run migrations more efficiently:

```json
{
  "scripts": {
    "postbuild": "prisma migrate deploy --skip-generate && npm run db:seed"
  }
}
```

This skips regenerating Prisma Client (which happens automatically during build).

## Recommended Fix for Supabase

1. **Get your Transaction Mode connection string** from Supabase Dashboard:
   - Go to Project Settings → Database
   - Copy the "Connection Pooling" connection string (port 6543)
   - It should include `?pgbouncer=true`

2. **Update your environment variable** in Vercel/Render:
   - Use the transaction mode URL (port 6543)
   - Keep the direct connection URL (port 5432) for migrations if needed

3. **Update Prisma schema** (optional but recommended):
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL") // Transaction mode pooler
     directUrl = env("DIRECT_URL") // Direct connection for migrations
   }
   ```

## Impact on Your Website

- **Website visitors**: NOT affected - this is only a build-time issue
- **Concurrent users**: Your website can handle thousands of users simultaneously
- **Database connections**: Each API request uses a connection from the pool, then releases it
- **Build process**: Will work reliably after applying the fix

## Testing

After applying the fix:
1. Deploy again
2. Check build logs - should see successful Prisma operations
3. Test your website - should work normally
4. Monitor Supabase dashboard for connection usage
