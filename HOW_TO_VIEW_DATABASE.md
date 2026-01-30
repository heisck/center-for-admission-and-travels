# How to View Your Database

Since the database is now the source of truth (not localStorage), here's how to verify your data is being saved:

## Option 1: Prisma Studio (Recommended - Visual GUI)

Prisma Studio is a visual database browser. It's the easiest way to see your data.

### Start Prisma Studio:
```bash
npm run db:studio
```

This will:
1. Open a browser window (usually at `http://localhost:5555`)
2. Show all your database tables in a visual interface
3. Let you browse, edit, and view all your data

### What You'll See:
- **HomePage** - Home page content (hero, stats, services)
- **AboutPage** - About page content
- **Package** - All travel/study/work packages
- **TravelToursPage** - Travel tours content
- **ServicePage** - Individual service pages (study-abroad, work-abroad, etc.)
- **ContactInfo** - Contact information
- **FooterInfo** - Footer content
- **AdminUser** - Admin users (if any)
- **AdminSession** - Active admin sessions
- **ContentVersion** - Version history (for undo/redo)

### To Verify Data is Saving:
1. Open Prisma Studio: `npm run db:studio`
2. Go to `/admin` in your app
3. Edit some content (e.g., change home page title)
4. Refresh Prisma Studio (or click the table)
5. You should see your changes in the database!

---

## Option 2: Direct SQL Query

If you prefer SQL, you can connect directly to your PostgreSQL database:

### Using psql (PostgreSQL CLI):
```bash
psql "your-database-url"
```

Then run queries like:
```sql
-- See all home page content
SELECT * FROM "HomePage";

-- See all packages
SELECT id, name, price FROM "Package";

-- See recent updates
SELECT * FROM "ContentVersion" ORDER BY "createdAt" DESC LIMIT 10;
```

### Using a Database GUI Tool:
- **pgAdmin** - Official PostgreSQL admin tool
- **DBeaver** - Free universal database tool
- **TablePlus** - Modern database client
- **Postico** (Mac only) - Beautiful PostgreSQL client

Connect using your `DATABASE_URL` from `.env`

---

## Option 3: Check API Response

You can also verify data by checking the API directly:

### In Browser Console:
```javascript
// Fetch all content
fetch('/api/content')
  .then(r => r.json())
  .then(data => console.log(data))

// Check specific section
fetch('/api/admin/content/home')
  .then(r => r.json())
  .then(data => console.log(data))
```

### Using curl:
```bash
curl http://localhost:3000/api/content | jq
```

---

## Quick Test: Verify Database is Working

1. **Start Prisma Studio:**
   ```bash
   npm run db:studio
   ```

2. **Edit something in admin panel:**
   - Go to `http://localhost:3000/admin`
   - Edit the home page hero title
   - Save

3. **Check Prisma Studio:**
   - Look at the `HomePage` table
   - You should see your changes!

4. **Refresh admin page:**
   - The changes should persist (loaded from database)

---

## Troubleshooting

### "No data in database"
- Run the seed script: `npm run db:seed`
- Or start editing in admin panel - it will create records automatically

### "Can't see changes"
- Make sure you're looking at the right table
- Check the API response: `fetch('/api/content').then(r => r.json())`
- Verify your `DATABASE_URL` in `.env` is correct

### "Prisma Studio won't start"
- Make sure database is running
- Check `DATABASE_URL` in `.env`
- Try: `npx prisma generate` then `npm run db:studio`

---

## What Changed

**Before:**
- Content saved to `localStorage` (browser storage)
- Limited to ~5-10MB
- Lost when clearing browser data
- Caused quota errors

**Now:**
- Content saved to **PostgreSQL database**
- Unlimited storage
- Persistent across devices
- No quota errors
- Can be backed up, exported, queried

**localStorage is now:**
- Only used as a fallback if API fails
- Not used for saving content (database is source of truth)
- History kept in memory only (not persisted)

---

**The database is your source of truth now!** 🎉
