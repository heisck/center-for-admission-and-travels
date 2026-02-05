# Quick Fix: Vercel Build Hanging

## Problem
Your build is hanging at `prisma db push` because Supabase's connection pooler (port 6543) doesn't work well with schema operations.

## ✅ Immediate Fix

### Step 1: Update package.json (Already Done)
Changed `postbuild` to use `prisma migrate deploy` instead of `db push`.

### Step 2: Create Migrations Locally First

**Before deploying, you MUST create migrations:**

```bash
# 1. Set your Supabase DIRECT connection string (port 5432, not 6543)
# Get this from Supabase Dashboard → Settings → Database → Connection string → Direct connection
export DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"

# 2. Create initial migration
npx prisma migrate dev --name init

# 3. Commit the migration files
git add prisma/migrations
git commit -m "Add initial database migration"
git push
```

### Step 3: Update Vercel Environment Variable

**CRITICAL:** In Vercel Dashboard → Settings → Environment Variables:

1. Find `DATABASE_URL`
2. Make sure it uses **DIRECT connection** (port 5432), NOT pooler (port 6543)

**Correct format:**
```
postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

**Wrong format (will hang):**
```
postgresql://postgres:[PASSWORD]@aws-1-eu-west-1.pooler.supabase.com:6543/postgres
```

### Step 4: Redeploy

After pushing migrations and updating the env var, redeploy in Vercel.

---

## Alternative: Skip Postbuild Temporarily

If you need to deploy NOW without migrations:

1. **Remove postbuild temporarily:**
   ```json
   {
     "scripts": {
       "postbuild": ""
     }
   }
   ```

2. **Deploy successfully**

3. **Run migrations manually after deployment:**
   ```bash
   # Pull env vars from Vercel
   vercel env pull .env.local
   
   # Run migrations
   npx prisma migrate deploy
   ```

---

## Why This Happens

- **Connection Pooler (6543):** Fast for queries, but can timeout on schema operations
- **Direct Connection (5432):** Slower but reliable for migrations

Prisma migrations need direct connection because they:
- Modify database schema
- Need exclusive locks
- Can't use connection pooling

---

## Get Your Direct Connection String

1. Go to Supabase Dashboard
2. Project Settings → Database
3. Scroll to "Connection string"
4. Select "Direct connection" (not "Connection pooling")
5. Copy the connection string
6. Use this in Vercel `DATABASE_URL`

---

## Summary

✅ Updated `postbuild` script  
⏭️ Next: Create migrations locally  
⏭️ Next: Update Vercel `DATABASE_URL` to direct connection (5432)  
⏭️ Next: Push migrations and redeploy

Your build should complete in ~30 seconds instead of hanging! 🚀
