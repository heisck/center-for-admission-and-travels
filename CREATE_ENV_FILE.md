# Create .env File - Quick Guide

## The Error

Prisma can't find `DATABASE_URL` because the `.env` file doesn't exist yet.

## Solution: Create .env File

### Step 1: Create the file

In your project root (same folder as `package.json`), create a file named `.env`

**Windows PowerShell:**
```powershell
New-Item -Path .env -ItemType File
```

**Or manually:**
- Create a new file in your project root
- Name it exactly: `.env` (with the dot at the beginning)

### Step 2: Add DATABASE_URL

Open `.env` and add this line:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/center_for_admission_travels"
```

### Step 3: Replace with Your Actual Database

**If you have a database already:**
- Replace the connection string with your actual database URL

**If you DON'T have a database yet:**

#### Option A: Use Supabase (Easiest - Free)
1. Go to https://supabase.com
2. Sign up (free)
3. Create new project
4. Wait for database to be ready (~2 minutes)
5. Go to **Settings** → **Database**
6. Copy the **Connection string** (URI format)
7. Paste it in your `.env` file as `DATABASE_URL`

#### Option B: Local PostgreSQL
1. Install PostgreSQL on your computer
2. Create database: `createdb center_for_admission_travels`
3. Use: `postgresql://your_username:your_password@localhost:5432/center_for_admission_travels`

### Step 4: Test

After creating `.env` with `DATABASE_URL`, run:

```bash
npx prisma migrate dev --name init
```

It should work now! ✅

## Example .env File

```env
# Required: Database connection
DATABASE_URL="postgresql://postgres:yourpassword@db.xxxxx.supabase.co:5432/postgres"

# Optional: Cloudinary (add later)
# CLOUDINARY_CLOUD_NAME="your_cloud_name"
# CLOUDINARY_API_KEY="your_api_key"
# CLOUDINARY_API_SECRET="your_api_secret"

# Optional: Paystack (add later)
# PAYSTACK_SECRET_KEY="sk_test_..."
# PAYSTACK_PUBLIC_KEY="pk_test_..."
```

## Important Notes

- ✅ `.env` file should be in project root (same folder as `package.json`)
- ✅ Don't commit `.env` to git (it's in `.gitignore`)
- ✅ Replace placeholder values with real ones
- ✅ No spaces around the `=` sign
- ✅ Use quotes around the connection string

## Quick Supabase Setup

1. Visit: https://supabase.com
2. Click "Start your project" → Sign up
3. Click "New Project"
4. Fill in:
   - Name: `center-for-admission-travels`
   - Database Password: (choose a strong password - save it!)
   - Region: (choose closest)
5. Wait ~2 minutes for setup
6. Go to **Settings** → **Database**
7. Find **Connection string** → **URI**
8. Copy it
9. Paste in your `.env` file as `DATABASE_URL="paste_here"`

Then run: `npx prisma migrate dev --name init`
