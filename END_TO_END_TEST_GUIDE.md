# End-to-End Test Guide

Complete guide for testing the full integration: Admin Edit → Database → Public Page

## Prerequisites

1. **Database is running** - PostgreSQL connection active
2. **Environment variables set** - `.env` file configured
3. **Database migrated** - Run `npm run db:migrate` if needed
4. **Database seeded** (optional) - Run `npm run db:seed` for initial data

## Test Checklist

### ✅ Test 1: Home Page Hero

**Admin Side:**
1. Go to `http://localhost:3000/admin`
2. Navigate to Home page
3. Edit the hero title (e.g., change "Looking To Travel" to "Your Journey Starts Here")
4. Edit the hero description
5. Save changes

**Database Check:**
```bash
npm run db:studio
```
- Open `HomePage` table
- Verify `heroTitle` and `heroDescription` are updated

**Public Side:**
1. Go to `http://localhost:3000`
2. Verify the hero section shows your changes
3. Refresh the page - changes should persist

**Expected Result:** ✅ Changes appear on public home page immediately

---

### ✅ Test 2: About Page - Team Members

**Admin Side:**
1. Go to `http://localhost:3000/admin/about`
2. Edit a team member's name, role, or description
3. Save changes

**Database Check:**
- Open `AboutTeamMember` table
- Verify team member data is updated

**Public Side:**
1. Go to `http://localhost:3000/about`
2. Scroll to "Meet Our Team" section
3. Verify team member changes appear

**Expected Result:** ✅ Team member changes reflect on public page

---

### ✅ Test 3: Contact Information

**Admin Side:**
1. Go to `http://localhost:3000/admin/contact`
2. Edit phone number, email, or address
3. Save changes

**Database Check:**
- Open `ContactInfo` table
- Verify contact data is updated

**Public Side:**
1. Go to `http://localhost:3000/contact`
2. Verify contact information in the sidebar matches your edits
3. Check footer - contact info should also be updated there

**Expected Result:** ✅ Contact info updated in both contact page and footer

---

### ✅ Test 4: Packages

**Admin Side:**
1. Go to `http://localhost:3000/admin/packages`
2. Edit a package name, description, or price
3. Or create a new package
4. Save changes

**Database Check:**
- Open `Package` table
- Verify package data is updated/created

**Public Side:**
1. Go to `http://localhost:3000/packages`
2. Verify package changes appear
3. Test filtering by category (study/work/travel)

**Expected Result:** ✅ Package changes reflect on public packages page

---

### ✅ Test 5: Travel Tours

**Admin Side:**
1. Go to `http://localhost:3000/admin/travel-tours`
2. Edit hero title, description, or featured packages
3. Save changes

**Database Check:**
- Open `TravelToursPage` table
- Open `TravelToursFeaturedPackage` table
- Verify data is updated

**Public Side:**
1. Go to `http://localhost:3000/travel-tours`
2. Verify hero section shows your changes
3. Verify featured packages are updated

**Expected Result:** ✅ Travel tours content reflects admin edits

---

### ✅ Test 6: Service Pages (Study Abroad, Work Abroad, Global Network)

**Admin Side:**
1. Go to `http://localhost:3000/admin/study-abroad` (or work-abroad, global-network)
2. Edit banner title, description, benefits, or requirements
3. Save changes

**Database Check:**
- Open `ServicePage` table
- Verify service page data is updated

**Public Side:**
1. Go to `http://localhost:3000/study-abroad` (or corresponding page)
2. Verify all edited content appears correctly

**Expected Result:** ✅ Service page content reflects admin edits

---

### ✅ Test 7: Image Upload (Cloudinary)

**Admin Side:**
1. Go to any admin page with image editing
2. Click to edit an image
3. Upload a new image
4. Save

**Database Check:**
- Check the relevant table (e.g., `HomeHeroImage`, `AboutTeamMember`)
- Verify image URL is a Cloudinary URL (should contain `cloudinary.com`)

**Public Side:**
1. Go to corresponding public page
2. Verify new image loads correctly
3. Check browser console for any image loading errors

**Expected Result:** ✅ Image uploaded to Cloudinary and displayed on public page

---

### ✅ Test 8: Footer

**Admin Side:**
1. Go to `http://localhost:3000/admin/footer` (or wherever footer is edited)
2. Edit company description or social links
3. Save changes

**Database Check:**
- Open `FooterInfo` table
- Verify footer data is updated

**Public Side:**
1. Scroll to footer on any public page
2. Verify footer content matches your edits

**Expected Result:** ✅ Footer content reflects admin edits

---

## Quick Test Script

Run this in your browser console on any public page to verify content is loading from database:

```javascript
// Check if content is loaded
fetch('/api/content')
  .then(r => r.json())
  .then(data => {
    console.log('Content loaded:', data.success)
    console.log('Home hero title:', data.data?.home?.hero?.title)
    console.log('Contact phone:', data.data?.contact?.phone)
    console.log('Packages count:', data.data?.packages?.length)
  })
```

## Troubleshooting

### Issue: Changes not appearing on public pages

**Check:**
1. Is the database connection working? (`npm run db:studio`)
2. Are API calls successful? (Check browser Network tab)
3. Is `PublicContentProvider` wrapping the app? (Check `app/layout.tsx`)
4. Are there any console errors?

### Issue: Images not loading

**Check:**
1. Is Cloudinary configured? (Check `.env` for `CLOUDINARY_CLOUD_NAME`)
2. Are image URLs valid Cloudinary URLs?
3. Check browser console for 404 errors

### Issue: Team members disappearing

**Check:**
1. Did you update other about fields without including team?
2. Team members are protected - they won't be deleted unless explicitly updated
3. Check `AboutTeamMember` table in database

## Success Criteria

✅ All admin edits save to database
✅ All public pages display database content
✅ Changes persist across page refreshes
✅ Images upload to Cloudinary successfully
✅ No console errors
✅ No database connection errors

---

**Status:** Ready for testing! 🚀
