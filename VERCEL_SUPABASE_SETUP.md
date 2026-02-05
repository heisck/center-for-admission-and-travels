# Vercel + Supabase Deployment Guide

## Issue: Build Hanging on `prisma db push`

The build is hanging because `prisma db push` doesn't work well with Supabase's connection pooler. Here's how to fix it.

---

## ✅ Solution: Use Migrations Instead

### Step 1: Update `package.json`

Change the `postbuild` script to use migrations:

```json
{
  "scripts": {
    "postbuild": "prisma migrate deploy"
  }
}
```

### Step 2: Create Initial Migration

Before deploying, create your migration locally:

```bash
# Make sure DATABASE_URL points to your Supabase database
npx prisma migrate dev --name init
```

This creates migration files in `prisma/migrations/` that will be applied during deployment.

### Step 3: Use Direct Connection String (Not Pooler)

**Important:** For migrations, use Supabase's **direct connection** (port 5432), not the pooler (port 6543).

**In Supabase Dashboard:**
1. Go to Project Settings → Database
2. Find "Connection string" section
3. Select "Direct connection" (not "Connection pooling")
4. Copy the connection string (should have port 5432)
5. Use this in Vercel environment variables

**Connection String Format:**
```
postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

**NOT this (pooler):**
```
postgresql://postgres:[YOUR-PASSWORD]@aws-1-eu-west-1.pooler.supabase.com:6543/postgres
```

---

## Alternative: Skip Postbuild Entirely

If migrations are causing issues, you can:

### Option A: Run Migrations Manually After First Deploy

1. Remove `postbuild` script temporarily
2. Deploy to Vercel (build will succeed)
3. After deployment, run migrations manually:
   ```bash
   npx prisma migrate deploy
   ```
   Or use Vercel CLI:
   ```bash
   vercel env pull .env.local
   npx prisma migrate deploy
   ```

### Option B: Use Vercel Build Command

Update Vercel build settings to include migration:

**Build Command:**
```bash
npm ci && npx prisma generate && npx prisma migrate deploy && npm run build
```

**Install Command:**
```bash
npm ci
```

**Output Directory:**
```
.next
```

---

## Environment Variables in Vercel

Make sure these are set in Vercel Dashboard → Settings → Environment Variables:

1. **DATABASE_URL** - Supabase direct connection string (port 5432)
2. **CLOUDINARY_CLOUD_NAME** - Your Cloudinary cloud name
3. **CLOUDINARY_API_KEY** - Your Cloudinary API key
4. **CLOUDINARY_API_SECRET** - Your Cloudinary API secret
5. **NEXTAUTH_SECRET** (if using auth) - Random string

---

## Quick Fix for Current Deployment

If your build is currently hanging:

1. **Cancel the current deployment**

2. **Update `package.json`:**
   ```json
   {
     "scripts": {
       "postbuild": "prisma migrate deploy"
     }
   }
   ```

3. **Create migration locally first:**
   ```bash
   # Set DATABASE_URL to your Supabase direct connection
   export DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres"
   
   # Create migration
   npx prisma migrate dev --name init
   
   # Commit and push
   git add prisma/migrations
   git commit -m "Add initial migration"
   git push
   ```

4. **Update Vercel environment variable:**
   - Use direct connection string (port 5432) instead of pooler (port 6543)

5. **Redeploy**

---

## Why This Happens

- **Connection Pooler (port 6543):** For application queries (fast, handles many connections)
- **Direct Connection (port 5432):** For migrations and admin operations (slower but more reliable)

Prisma migrations need the direct connection because they:
- Create/modify database schema
- Need exclusive locks
- Can't use connection pooling

---

## Testing Locally

Before deploying, test the migration locally:

```bash
# Use direct connection string
export DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres"

# Test migration
npx prisma migrate deploy

# Should complete successfully
```

---

## Troubleshooting

### Build Still Hanging?

1. **Check connection string format:**
   - Must use port 5432 (direct)
   - Must include password
   - Must use correct project reference

2. **Check Supabase firewall:**
   - Go to Supabase Dashboard → Settings → Database
   - Make sure "Allow connections from anywhere" is enabled (for Vercel IPs)

3. **Add timeout to postbuild:**
   ```json
   {
     "scripts": {
       "postbuild": "timeout 60 prisma migrate deploy || echo 'Migration timeout'"
     }
   }
   ```

4. **Skip postbuild temporarily:**
   - Remove `postbuild` script
   - Deploy successfully
   - Run migrations manually after deployment

---

## Recommended Setup

**Best Practice:**

1. **Development:** Use `prisma migrate dev` (creates migrations)
2. **Production:** Use `prisma migrate deploy` (applies migrations)
3. **Never use `prisma db push` in production** (can cause data loss)

**Migration Workflow:**

```bash
# 1. Make schema changes locally
# Edit prisma/schema.prisma

# 2. Create migration
npx prisma migrate dev --name add_new_feature

# 3. Commit migration files
git add prisma/migrations
git commit -m "Add migration for new feature"
git push

# 4. Vercel automatically runs `prisma migrate deploy` during build
```

---

## Summary

✅ **Fixed:** Changed `postbuild` to use `prisma migrate deploy`  
✅ **Next:** Create initial migration locally  
✅ **Important:** Use direct connection string (port 5432) in Vercel  
✅ **Deploy:** Push changes and redeploy

Your build should now complete successfully! 🚀
