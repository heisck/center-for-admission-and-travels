# Quick Start Guide

## What You Need to Provide First

### 1. PostgreSQL Database

**Choose one option:**

#### Option A: Supabase (Easiest - Recommended)
1. Go to https://supabase.com
2. Sign up (free)
3. Create new project
4. Wait for database to be ready
5. Go to Settings → Database
6. Copy the connection string (looks like: `postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres`)

#### Option B: Local PostgreSQL
1. Install PostgreSQL on your computer
2. Create database: `createdb center_for_admission_travels`
3. Connection string: `postgresql://username:password@localhost:5432/center_for_admission_travels`

#### Option C: Other Cloud Providers
- Railway: https://railway.app
- Neon: https://neon.tech
- AWS RDS
- DigitalOcean

---

### 2. Create .env File

In your project root, create a file named `.env`:

```env
# REQUIRED: Database connection
DATABASE_URL="postgresql://user:password@host:port/database"

# OPTIONAL: Cloudinary (for image uploads - add later)
# CLOUDINARY_CLOUD_NAME="your_cloud_name"
# CLOUDINARY_API_KEY="your_api_key"
# CLOUDINARY_API_SECRET="your_api_secret"

# OPTIONAL: Paystack (for payments - add later)
# PAYSTACK_SECRET_KEY="sk_test_..."
# PAYSTACK_PUBLIC_KEY="pk_test_..."
```

**Replace the DATABASE_URL with your actual connection string!**

---

### 3. Install Dependencies

```bash
# Install project dependencies
npm install
```

---

### 4. Setup Prisma

```bash
# Generate Prisma Client
npm run db:generate

# Create database tables
npm run db:migrate

# (Optional) View database in browser
npm run db:studio
```

When you run `npm run db:migrate`, it will:
- Create all database tables
- Ask you to name the migration (type: `init`)

---

## Verification

After setup, verify everything works:

```bash
# Start dev server
npm run dev

# In another terminal, open Prisma Studio
npm run db:studio
```

You should see:
- ✅ Database tables created
- ✅ No errors in console

---

## What Happens Next

Once you've completed the setup above, we'll:

1. ✅ API routes use Prisma-backed persistence
2. ✅ Update AdminContext to write to API
3. ✅ Add PublicContentProvider
4. ✅ Update public pages to read from API
5. ✅ Test the full flow

---

## Troubleshooting

### "Cannot find module 'prisma'"
```bash
npm install prisma @prisma/client
```

### "Error: P1001: Can't reach database server"
- Check your DATABASE_URL is correct
- Make sure database is running
- Check firewall/network settings

### "Error: Migration failed"
- Make sure database is empty (or drop existing tables)
- Check database permissions

## Summary Checklist

- [ ] PostgreSQL database set up
- [ ] `.env` file created with `DATABASE_URL`
- [ ] Run `npm install`
- [ ] Run `npm run db:generate`
- [ ] Run `npm run db:migrate`
- [ ] Verify with `npm run db:studio`

**Once all checked, let me know and we'll connect everything!** 🚀
