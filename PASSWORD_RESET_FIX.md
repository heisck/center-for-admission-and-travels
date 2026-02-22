# Password Reset Fix

## What was changed

The password reset was returning "success" but the new password wasn't persisting. The old password still worked because the database update wasn't being committed properly (likely due to Neon connection pooling or Prisma ORM behavior).

### Fixes applied

1. **Raw SQL update** – Replaced Prisma's `update()` with `$executeRaw` to bypass any ORM caching or connection pooling issues.

2. **Post-update verification** – After the update, we re-fetch the user and verify the new password. If verification fails, we return an error instead of falsely claiming success.

3. **`force-dynamic`** – Ensures API routes are never cached.

## If you still have issues

### Neon connection string

If you're using **Neon** with a pooled connection (hostname contains `-pooler`), try switching to the **direct** connection for more consistent writes:

- **Pooled**: `ep-xxx-pooler.us-east-1.aws.neon.tech` (for high connection count)
- **Direct**: `ep-xxx.us-east-1.aws.neon.tech` (better for write consistency)

Get both from your [Neon Console](https://console.neon.tech) → Project → Connection Details.

### Vercel environment variables

Ensure `DATABASE_URL` in Vercel matches your production database. Check:

1. Vercel Dashboard → Your Project → Settings → Environment Variables
2. Confirm `DATABASE_URL` is set for **Production**
3. Redeploy after any changes
