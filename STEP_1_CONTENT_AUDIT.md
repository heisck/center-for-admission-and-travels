# STEP 1: CONTENT AUDIT

## Complete Breakdown of All Editable Content in Admin Panel

### 1. HOME PAGE (`/admin/home`)

#### Hero Section
- **Title** (text) - Main hero title
- **Subtitle** (text) - Hero subtitle
- **Description** (textarea) - Hero description
- **CTA 1 Text** (text) - First call-to-action button text
- **CTA 2 Text** (text) - Second call-to-action button text
- **Images** (array of images) - Hero section images (masonry gallery)
- **Stats** (array of objects):
  - Value (text) - e.g., "50+"
  - Label (text) - e.g., "Success Stories"

#### Services Section
- **Services** (array of objects):
  - ID (string) - Unique identifier
  - Icon (string) - Icon name
  - Title (text) - Service title
  - Description (textarea) - Service description

---

### 2. ABOUT PAGE (`/admin/about`)

#### Hero Section
- **Hero Title** (text)
- **Hero Subtitle** (textarea)
- **Hero Image** (single image URL)

#### Mission Section
- **Title** (text)
- **Description** (textarea)
- **Points** (array of strings) - Mission points list

#### Vision Section
- **Title** (text)
- **Description** (textarea)
- **Points** (array of strings) - Vision points list

#### Core Values
- **Core Values** (array of objects):
  - ID (string)
  - Title (text)
  - Description (textarea)

#### Founder Section
- **Title** (text) - Section title
- **Name** (text) - Founder name
- **Description** (textarea) - Founder bio
- **Image** (single image URL)
- **Vision** (text) - Founder's vision statement
- **Mission** (text) - Founder's mission statement
- **Values** (text) - Founder's values statement

#### Team Section
- **Team Members** (array of objects):
  - ID (string)
  - Name (text)
  - Role (text)
  - Image (single image URL)
  - Description (textarea) - Bio

---

### 3. PACKAGES (`/admin/packages`)

- **Packages** (array of objects):
  - ID (number) - Unique identifier
  - Name (text)
  - Category (enum: 'travel' | 'study' | 'work')
  - Description (textarea)
  - Duration (text) - e.g., "6 Days / 5 Nights"
  - Price (number)
  - Highlights (array of strings)
  - Itinerary (textarea)
  - Images (array of image URLs)
  - Included (array of strings) - What's included
  - Not Included (array of strings) - What's not included

---

### 4. TRAVEL TOURS (`/admin/travel-tours`)

#### Hero Section
- **Title** (text)
- **Description** (textarea)
- **Paragraph** (textarea) - Additional paragraph
- **Image** (single image URL)

#### Featured Packages
- **Featured Packages** (array of objects):
  - ID (string)
  - Name (text)
  - Description (textarea)
  - Duration (text)
  - Price (number)
  - Image (single image URL)
  - Highlights (array of strings)

---

### 5. SERVICE PAGES (`/admin/study-abroad`, `/admin/work-abroad`, `/admin/global-network`)

Each service page has:
- **ID** (string) - Service identifier
- **Title** (text) - Service title
- **Description** (textarea) - Service description
- **Icon** (string) - Icon name
- **Route** (string) - URL route
- **Hero Image** (single image URL)
- **Banner Title** (text)
- **Banner Subtitle** (textarea)

#### Optional Fields (varies by service):
- **Overview** (textarea) - Service overview
- **Why Study Outside This Country** (object):
  - Title (text)
  - Highlights (array of strings)
- **Benefits** (array of strings)
- **Requirements** (array of strings)
- **Countries** (array of objects):
  - Name (text)
  - Description (textarea)
  - Image (single image URL)
- **Visa Guidance** (textarea)
- **Success Stories** (array of objects):
  - Name (text)
  - Program (text)
  - Quote (textarea)
- **Scholarships** (array of objects):
  - Name (text)
  - Amount (text)
  - Description (textarea)

---

### 6. CONTACT PAGE (`/admin/contact`)

- **Phone** (text)
- **Email** (text)
- **Address** (object):
  - Street (text)
  - City (text)
  - Region (text)
  - Country (text)
- **WhatsApp Number** (text)

---

### 7. FOOTER (Global)

- **Company Description** (textarea)
- **Social Links** (array of objects):
  - Platform (text) - e.g., "Facebook", "LinkedIn", "Twitter"
  - URL (text) - Social media URL

---

### 8. AUTHENTICATION

- **Admin Username** (text) - Mock for now
- **Admin Password** (text) - Mock for now
- **Session Token** (string) - Session management

---

## Summary Statistics

- **Total Editable Text Fields**: ~80+
- **Total Editable Images**: ~30+ (various single images and arrays)
- **Total Editable Lists**: ~15+ (arrays of strings/objects)
- **Total Pages**: 8 (Home, About, Packages, Travel Tours, Study Abroad, Work Abroad, Global Network, Contact)
- **Total Sections**: ~25+ distinct sections across all pages

## Image Storage Requirements

All images must be stored as:
- **URLs** (Cloudinary-compatible)
- **Not base64** (to avoid storage bloat)
- Support for:
  - Single images (hero images, team photos, etc.)
  - Image arrays (gallery images, package images)

## Data Relationships

1. **Home** → Services (one-to-many)
2. **About** → Team Members (one-to-many)
3. **About** → Core Values (one-to-many)
4. **Packages** → Standalone entities
5. **Travel Tours** → Featured Packages (one-to-many)
6. **Service Pages** → Countries (one-to-many, optional)
7. **Service Pages** → Success Stories (one-to-many, optional)
8. **Service Pages** → Scholarships (one-to-many, optional)
9. **Footer** → Social Links (one-to-many)

---

## Next Steps

This audit forms the basis for:
1. Prisma schema design
2. API endpoint structure
3. Mock data layer implementation
4. Database migration strategy
