# Setup Checklist - What You Need to Provide First

## Prerequisites Before Code is Ready

### 1. ✅ Database Setup (PostgreSQL)

**What you need:**
- A PostgreSQL database (local or cloud)

**Options:**
- **Local**: Install PostgreSQL on your machine
- **Cloud**: Use services like:
  - Supabase (free tier available)
  - Railway (free tier)
  - Neon (free tier)
  - AWS RDS
  - DigitalOcean

**Action Required:**
1. Set up PostgreSQL database
2. Get connection string (will look like: `postgresql://user:password@host:port/database`)

---

### 2. ✅ Environment Variables

**What you need to create:** `.env` file in project root

**Required variables:**

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/center_for_admission_travels"

# Cloudinary (for image uploads - can be added later)
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"
CLOUDINARY_UPLOAD_PRESET="your_preset" # Optional

# Paystack (for payments - can be added later)
PAYSTACK_SECRET_KEY="sk_test_..."
PAYSTACK_PUBLIC_KEY="pk_test_..." # For frontend

# Next.js
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

**Action Required:**
1. Create `.env` file
2. Add `DATABASE_URL` (required)
3. Add Cloudinary keys (optional for now)
4. Add Paystack keys (optional for now)

---

### 3. ✅ Install Dependencies

**What you need to install:**

```bash
# Prisma (database ORM)
npm install prisma @prisma/client

# Optional: For API calls (if not already installed)
npm install axios

# Optional: For image uploads (when ready for Cloudinary)
npm install cloudinary

# Optional: For payments (when ready for Paystack)
npm install @paystack/paystack-sdk
```

**Action Required:**
Run: `npm install prisma @prisma/client`

---

### 4. ✅ Initialize Prisma

**What you need to do:**

```bash
# Generate Prisma Client
npx prisma generate

# Create database migration
npx prisma migrate dev --name init

# (Optional) Open Prisma Studio to view database
npx prisma studio
```

**Action Required:**
1. Run `npx prisma generate`
2. Run `npx prisma migrate dev --name init`
3. Verify database tables are created

---

### 5. ✅ Seed Initial Data (Optional but Recommended)

**What you need:**
- Initial content to populate database

**Action Required:**
Create `prisma/seed.ts` to populate database with default content (or we can create this for you)

---

### 6. ✅ Update AdminContext to Use API

**What needs to happen:**
- AdminContext currently uses localStorage
- Needs to be updated to call API endpoints
- API endpoints need to use Prisma instead of mockDataStore

**Action Required:**
- We'll update this after database is set up

---

## Quick Start Checklist

### Minimum Required (to get started):
- [ ] PostgreSQL database set up
- [ ] `.env` file with `DATABASE_URL`
- [ ] Run `npm install prisma @prisma/client`
- [ ] Run `npx prisma generate`
- [ ] Run `npx prisma migrate dev --name init`

### Optional (can add later):
- [ ] Cloudinary account and keys
- [ ] Paystack account and keys
- [ ] Seed data script

---

## Step-by-Step Setup Instructions

### Step 1: Database Setup

**Option A: Local PostgreSQL**
```bash
# Install PostgreSQL (if not installed)
# Windows: Download from postgresql.org
# Mac: brew install postgresql
# Linux: sudo apt-get install postgresql

# Create database
createdb center_for_admission_travels

# Get connection string
# Format: postgresql://username:password@localhost:5432/center_for_admission_travels
```

**Option B: Supabase (Recommended for quick start)**
1. Go to https://supabase.com
2. Create free account
3. Create new project
4. Copy connection string from Settings → Database
5. Use as `DATABASE_URL`

### Step 2: Create .env File

```bash
# In project root, create .env file
touch .env

# Add this content:
DATABASE_URL="your_connection_string_here"
```

### Step 3: Install and Setup Prisma

```bash
# Install Prisma
npm install prisma @prisma/client

# Generate Prisma Client
npx prisma generate

# Create and run migration
npx prisma migrate dev --name init

# Verify it worked
npx prisma studio
# This opens a browser to view your database
```

### Step 4: Verify Setup

```bash
# Test database connection
npx prisma db pull

# Should see: "Introspecting database..."
```

---

## What Happens After Setup

Once you provide:
1. ✅ Database connection string
2. ✅ Run Prisma migrations

Then we can:
1. Update API routes to use Prisma (replace mockDataStore)
2. Update AdminContext to write to API
3. Add PublicContentProvider
4. Update public pages to read from API
5. Test the full flow

---

## Current Status

### ✅ Already Done:
- Database schema designed (`prisma/schema.prisma`)
- API routes created (using mock data)
- Mock data store created
- Admin API client created
- Public content context created

### ⏳ Waiting For:
- **YOU**: Database connection string
- **YOU**: Run Prisma setup commands
- **THEN**: We update code to use real database

---

## Need Help?

If you need help with any step:
1. **Database setup**: Tell me which option you prefer (local or cloud)
2. **Connection string**: Share format and I'll help verify
3. **Prisma errors**: Share error message and I'll help fix

---

## Summary

**What YOU need to provide:**
1. PostgreSQL database (or connection to one)
2. Database connection string
3. Run: `npm install prisma @prisma/client`
4. Run: `npx prisma generate`
5. Run: `npx prisma migrate dev --name init`

**What WE'LL do after:**
1. Update API routes to use Prisma
2. Connect AdminContext to API
3. Connect public pages to API
4. Test everything

**Ready to start?** Let me know when you have the database connection string! 🚀
