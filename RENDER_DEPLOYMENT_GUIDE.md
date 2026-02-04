# Render Deployment Guide

Complete guide for deploying your Next.js application with Prisma, PostgreSQL, and Cloudinary to Render.

## 📋 Prerequisites

- Render account (https://render.com)
- GitHub repository with your code
- Cloudinary account (for image uploads)

---

## 🗄️ Step 1: Set Up PostgreSQL Database on Render

### 1.1 Create PostgreSQL Database

1. Log into Render Dashboard: https://dashboard.render.com
2. Click **"New +"** → **"PostgreSQL"**
3. Configure:
   - **Name**: `center-for-admission-travels-db` (or your preferred name)
   - **Database**: `center_for_admission_travels` (or auto-generated)
   - **User**: Auto-generated
   - **Region**: Choose closest to your users
   - **PostgreSQL Version**: 16 (or latest)
   - **Plan**: Free tier (or paid for production)

4. Click **"Create Database"**

### 1.2 Get Database Connection String

After creation, Render will show:
- **Internal Database URL**: Use this in your Render service
- **External Database URL**: Use this for local development

**Important**: Copy the **Internal Database URL** - you'll need it for environment variables.

---

## 🚀 Step 2: Create/Update Web Service on Render

### 2.1 Create New Web Service (or Update Existing)

1. In Render Dashboard, click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Select your repository: `center-for-admission-and-travels`

### 2.2 Configure Build Settings

**Name**: `center-for-admission-travels` (or your preferred name)

**Environment**: `Node`

**Build Command**:
```bash
npm ci && npx prisma generate && npm run build
```

**Note**: Use `npm ci` instead of `npm install` for production builds. It ensures exact dependency versions and installs both dependencies and devDependencies needed for the build.

**Start Command**:
```bash
npm start
```

**Root Directory**: `.` (leave as default)

### 2.3 Configure Environment Variables

Click **"Environment"** tab and add these variables:

#### Database Configuration
```
DATABASE_URL=<Your PostgreSQL Internal Database URL from Step 1.2>
```

#### Cloudinary Configuration
```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=899168383227384
CLOUDINARY_API_SECRET=G-GZgrNZTFLPenChKMclx3EtNSU
```

#### Admin Authentication (Optional - for admin login)
```
ADMIN_USERNAME=admin
ADMIN_PASSWORD=<your-secure-password>
```

#### Next.js Configuration
```
NODE_ENV=production
```

#### Paystack (if using payments)
```
PAYSTACK_SECRET_KEY=your_paystack_secret_key
PAYSTACK_PUBLIC_KEY=your_paystack_public_key
```

### 2.4 Advanced Settings

**Auto-Deploy**: `Yes` (deploys on every push to main branch)

**Health Check Path**: `/` (or leave empty)

---

## 🔧 Step 3: Set Up Database Migrations

### Option A: Using Render Build Script (Recommended)

Update your `package.json` to include migration in build:

```json
{
  "scripts": {
    "build": "next build",
    "postbuild": "prisma db push --accept-data-loss || prisma migrate deploy",
    "start": "next start"
  }
}
```

**Note**: The `postbuild` script uses `prisma db push` first (which syncs schema directly) and falls back to `prisma migrate deploy` if migrations exist. This handles cases where migrations haven't been created yet.

Then update Render **Build Command** to:
```bash
npm ci && npx prisma generate && npm run build
```

**Note**: `npm ci` installs both dependencies and devDependencies, which are needed for the build process (including Tailwind CSS PostCSS plugin).

### Option B: Using Render Shell (Manual Migration)

1. After first deployment, go to your service
2. Click **"Shell"** tab
3. Run:
```bash
npx prisma migrate deploy
```

### Option C: Using Render Scripts (Recommended for Production)

Create a `render.yaml` file in your project root:

```yaml
services:
  - type: web
    name: center-for-admission-travels
    env: node
    buildCommand: npm ci && npx prisma generate && npm run build
    startCommand: npm start
    envVars:
      - key: DATABASE_URL
        sync: false
      - key: CLOUDINARY_CLOUD_NAME
        sync: false
      - key: CLOUDINARY_API_KEY
        sync: false
      - key: CLOUDINARY_API_SECRET
        sync: false
      - key: NODE_ENV
        value: production

databases:
  - name: center-for-admission-travels-db
    databaseName: center_for_admission_travels
    user: center_for_admission_travels_user
    plan: free
```

---

## 🌱 Step 4: Seed Database (First Time Only)

After deployment, seed your database with initial data:

### Option A: Using Render Shell

1. Go to your service → **"Shell"** tab
2. Run:
```bash
npm run db:seed
```

### Option B: Add to Build Script (One-time)

Temporarily add to `package.json`:
```json
{
  "scripts": {
    "postbuild": "prisma migrate deploy && npm run db:seed"
  }
}
```

**⚠️ Warning**: Remove seed from postbuild after first deployment to avoid re-seeding on every deploy.

---

## 📝 Step 5: Update package.json Scripts (Recommended)

Add these scripts for better deployment:

```json
{
  "scripts": {
    "build": "next build",
    "start": "next start",
    "db:generate": "prisma generate",
    "db:migrate": "prisma migrate dev",
    "db:migrate:deploy": "prisma migrate deploy",
    "db:seed": "tsx prisma/seed.ts",
    "db:studio": "prisma studio",
    "db:push": "prisma db push"
  },
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  }
}
```

---

## 🔐 Step 6: Link Database to Web Service

### 6.1 Link Database (if not using render.yaml)

1. In your Web Service settings
2. Go to **"Environment"** tab
3. Click **"Link Database"**
4. Select your PostgreSQL database
5. Render will automatically add `DATABASE_URL` environment variable

### 6.2 Verify Connection

After linking, verify `DATABASE_URL` is set:
- Go to **"Environment"** tab
- Confirm `DATABASE_URL` exists and is correct

---

## 🚀 Step 7: Deploy

### 7.1 Initial Deployment

1. Click **"Create Web Service"** (or **"Save Changes"** if updating)
2. Render will:
   - Install dependencies
   - Generate Prisma Client
   - Run migrations (if configured)
   - Build Next.js app
   - Start the service

### 7.2 Monitor Deployment

Watch the build logs for:
- ✅ Prisma Client generation
- ✅ Database migrations
- ✅ Next.js build success
- ✅ Service started

### 7.3 First-Time Setup

After first deployment:
1. Open Render Shell
2. Run: `npm run db:seed` (to populate initial data)
3. Verify your app is running

---

## 🧪 Step 8: Verify Deployment

### 8.1 Check API Routes

Test your API endpoints:
- `https://your-app.onrender.com/api/content` - Should return content
- `https://your-app.onrender.com/api/auth/signup` - Should work
- `https://your-app.onrender.com/api/admin/images/upload` - Should work (with auth)

### 8.2 Check Database

1. Go to Render Shell
2. Run: `npx prisma studio`
3. Or use external database tool with External Database URL

### 8.3 Check Admin Panel

- Visit: `https://your-app.onrender.com/admin-login`
- Login with admin credentials
- Verify admin panel loads

---

## 🔄 Step 9: Continuous Deployment

### 9.1 Automatic Deployments

Render automatically deploys when you push to your main branch.

### 9.2 Manual Deployments

1. Go to your service
2. Click **"Manual Deploy"**
3. Select branch/commit
4. Click **"Deploy"**

### 9.3 Database Migrations on Updates

When you update Prisma schema:
1. Create migration locally: `npx prisma migrate dev --name your_migration_name`
2. Commit and push migration files
3. Render will run `prisma migrate deploy` automatically (if configured)

---

## 🛠️ Troubleshooting

### Issue: Database Connection Failed

**Solution**:
- Verify `DATABASE_URL` is set correctly
- Use **Internal Database URL** (not external)
- Check database is running in Render dashboard
- Verify database and web service are in same region

### Issue: Prisma Client Not Generated

**Solution**:
- Add `npx prisma generate` to build command
- Check build logs for Prisma errors
- Verify `prisma` is in dependencies (not devDependencies)

### Issue: Migrations Not Running

**Solution**:
- Add `prisma migrate deploy` to build script
- Or run manually in Render Shell
- Check migration files are committed to git

### Issue: Seed Not Running

**Solution**:
- Run manually: `npm run db:seed` in Render Shell
- Verify `tsx` is installed (should be in dependencies)
- Check seed file path is correct

### Issue: API Routes Return 500

**Solution**:
- Check Render logs for errors
- Verify environment variables are set
- Check database connection
- Verify Prisma Client is generated

### Issue: Images Not Uploading

**Solution**:
- Verify Cloudinary environment variables
- Check Cloudinary configuration
- Review upload API logs
- Test Cloudinary connection

### Issue: Cannot find module '@tailwindcss/postcss'

**Error**: `Error: Cannot find module '@tailwindcss/postcss'`

**Solution**:
1. **Move build dependencies to `dependencies`**: 
   - Move `@tailwindcss/postcss`, `postcss`, and `tailwindcss` from `devDependencies` to `dependencies` in `package.json`
   - These packages are needed during the build process

2. **Use `npm ci` instead of `npm install`**:
   - Update Render Build Command to: `npm ci && npx prisma generate && npm run build`
   - `npm ci` installs both dependencies and devDependencies needed for build

3. **Commit and push changes**:
   ```bash
   git add package.json
   git commit -m "Move Tailwind build dependencies to dependencies"
   git push
   ```

4. **Redeploy on Render** - The build should now succeed

### Issue: Can't resolve 'tw-animate-css'

**Error**: `Error: Can't resolve 'tw-animate-css'`

**Solution**:
1. **Move `tw-animate-css` to `dependencies`**:
   - This package is imported in `app/globals.css` and is needed during the build
   - Move it from `devDependencies` to `dependencies` in `package.json`

2. **Commit and push**:
   ```bash
   git add package.json
   git commit -m "Move tw-animate-css to dependencies for build"
   git push
   ```

3. **Redeploy** - The build should now succeed

### Issue: TypeScript types not found during build

**Error**: `It looks like you're trying to use TypeScript but do not have the required package(s) installed`

**Solution**:
1. **Move TypeScript and type definitions to `dependencies`**:
   - Move `typescript`, `@types/node`, `@types/react`, and `@types/react-dom` from `devDependencies` to `dependencies`
   - These are needed during the build process even if type checking is disabled

2. **Ensure `ignoreBuildErrors` is set**:
   - Verify `next.config.mjs` has `typescript: { ignoreBuildErrors: true }`
   - This prevents build failures from type errors but still requires types to be present

3. **Commit and push**:
   ```bash
   git add package.json next.config.mjs
   git commit -m "Move TypeScript types to dependencies for build"
   git push
   ```

4. **Redeploy** - The build should now succeed

---

## 📊 Render-Specific Considerations

### Build Time Limits

- Free tier: 45 minutes max build time
- Paid tiers: Longer build times available

### Database Limits

- Free tier: 90 days retention, 1GB storage
- Paid tiers: Better retention and storage

### Environment Variables

- Set all variables in Render dashboard
- Don't commit `.env` file (it's in `.gitignore`)
- Use Render's environment variable management

### Health Checks

- Render checks `/` by default
- Can configure custom health check path
- Service restarts if health check fails

---

## ✅ Deployment Checklist

Before deploying:

- [ ] PostgreSQL database created on Render
- [ ] Database URL copied (Internal URL)
- [ ] All environment variables set in Render
- [ ] Cloudinary credentials configured
- [ ] Build command includes `prisma generate`
- [ ] Migration strategy decided (build script or manual)
- [ ] Seed script ready (for first deployment)
- [ ] Code pushed to GitHub
- [ ] Render service configured
- [ ] Database linked to web service

After deployment:

- [ ] Service is running
- [ ] Database migrations applied
- [ ] Database seeded (first time)
- [ ] API routes working
- [ ] Admin panel accessible
- [ ] Image uploads working
- [ ] Authentication working

---

## 🎯 Quick Reference

### Render Build Command
```bash
npm ci && npx prisma generate && npm run build
```

**Note**: `npm ci` is recommended for production builds as it:
- Installs exact versions from `package-lock.json`
- Installs both dependencies and devDependencies (needed for build)
- Is faster and more reliable than `npm install`

### Render Start Command
```bash
npm start
```

### Manual Migration (in Render Shell)
```bash
npx prisma migrate deploy
```

### Manual Seed (in Render Shell)
```bash
npm run db:seed
```

### Check Database Connection (in Render Shell)
```bash
npx prisma studio
```

---

## 📚 Additional Resources

- Render Docs: https://render.com/docs
- Prisma Deploy Guide: https://www.prisma.io/docs/guides/deployment
- Next.js Deployment: https://nextjs.org/docs/deployment

---

## 🆘 Need Help?

If you encounter issues:

1. Check Render build logs
2. Check Render runtime logs
3. Verify environment variables
4. Test database connection
5. Review Prisma migration status

---

**Last Updated**: 2025-01-29
**Version**: 1.0
