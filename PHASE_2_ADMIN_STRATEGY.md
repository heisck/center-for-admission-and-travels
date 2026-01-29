PHASE 2: ADMIN CLONE STRATEGY & STATE MANAGEMENT ARCHITECTURE

═══════════════════════════════════════════════════════════════════

CORE PRINCIPLES

1. Admin pages are EXACT clones of public pages
2. Same components, same layout, same styling, same animations
3. Content becomes editable via inline controls
4. Edit controls appear only on hover/focus (non-intrusive)
5. All state managed in-memory (React Context)
6. History tracking with undo/redo (5 versions per page)
7. No database, no backend, no API calls

═══════════════════════════════════════════════════════════════════

1. ADMIN ARCHITECTURE OVERVIEW

┌─────────────────────────────────────────────────────────────────┐
│                    ADMIN CLONE STRUCTURE                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  /admin/login         (Auth gate, no cloning needed)            │
│    ↓                                                             │
│  /admin/home          (Clone of /)                              │
│  /admin/about         (Clone of /about)                         │
│  /admin/study-abroad  (Clone of /study-abroad)                  │
│  /admin/work-abroad   (Clone of /work-abroad)                   │
│  /admin/travel-tours  (Clone of /travel-tours)                  │
│  /admin/global-network(Clone of /global-network)                │
│  /admin/contact       (Clone of /contact)                       │
│                                                                 │
│  Each page uses exact same components as public version         │
│  BUT wraps content in <EditableContent> wrappers               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════

2. STATE MANAGEMENT ARCHITECTURE

Admin Context Structure:

interface AdminStore {
  // Auth state
  isAuthenticated: boolean
  username: string | null
  
  // Page data (in-memory cache)
  pages: {
    home: PageData
    about: PageData
    studyAbroad: PageData
    workAbroad: PageData
    travelTours: PageData
    globalNetwork: PageData
    contact: PageData
  }
  
  // History tracking
  history: {
    [pageId: string]: {
      versions: Version[]
      currentIndex: number
    }
  }
  
  // Edit state
  currentEditingPage: string | null
  isDirty: boolean
}

interface PageData {
  [contentKey: string]: string | string[] | object
  // Example: { heroTitle, heroSubtitle, heroImages, serviceCards, etc. }
}

interface Version {
  timestamp: number
  data: PageData
  description?: string
}

═══════════════════════════════════════════════════════════════════

3. CONTENT STRUCTURE (Per Page)

Home Page Content:
{
  heroTitle: string
  heroSubtitle: string
  heroImages: string[] (5 images)
  serviceCards: {
    id: string
    title: string
    description: string
    icon?: string
  }[]
  ctaTitle: string
  ctaDescription: string
  ctaButtonText: string
}

About Page Content:
{
  heroImage: string
  missionTitle: string
  missionDescription: string
  visionTitle: string
  visionDescription: string
  coreValues: {
    id: string
    title: string
    description: string
    icon?: string
  }[]
  teamMembers: {
    id: string
    name: string
    role: string
    bio: string
    image: string
  }[]
}

Travel Tours Page Content:
{
  heroTitle: string
  heroDescription: string
  heroParagraph: string
  packages: {
    id: string
    name: string
    description: string
    duration: string
    price: number
    highlights: string[]
    itinerary: string
    image: string
  }[]
}

Study/Work/Network Page Content:
{
  title: string
  description: string
  whyChoose: string[]
  requirements: string[]
  countries: string[]
  processSteps: {
    id: string
    step: number
    title: string
    description: string
  }[]
  ctaTitle: string
  ctaDescription: string
}

Contact Page Content:
{
  formTitle: string
  formDescription: string
  formFields: {
    id: string
    name: string
    label: string
    placeholder: string
    type: 'text' | 'email' | 'phone' | 'textarea'
    required: boolean
  }[]
  successMessage: string
}

═══════════════════════════════════════════════════════════════════

4. MOCK DATA INITIALIZATION

Initialize admin store with data from:
  • /data/packages.js → Used in travel tours admin page
  • /data/services.js → Used in study/work/network admin pages
  • /data/team.js → Used in about admin page
  • Hardcoded defaults → Used in home, contact pages

Strategy: Load public data files, transform into PageData format,
store in Context as default versions. Admin edits update Context.
Public pages continue using data files (no sync needed).

═══════════════════════════════════════════════════════════════════

5. EDITABLE CONTENT WRAPPER COMPONENT

<EditableContent> Component Behavior:

```
<EditableContent 
  type="text"
  field="heroTitle"
  value={homeData.heroTitle}
  onChange={(newValue) => updatePage('home', { heroTitle: newValue })}
>
  {/* Renders the actual content */}
  <h1>{homeData.heroTitle}</h1>
  
  {/* On hover, shows edit controls */}
  {/* Click to activate inline editor */}
  {/* Esc or blur to save and exit */}
</EditableContent>
```

Component Features:
  • Appears non-intrusive (controls on hover)
  • Supports text, textarea, select, file upload
  • Shows visual indicator when content is edited
  • Integrates with history tracking
  • Prevents accidental submission

═══════════════════════════════════════════════════════════════════

6. HISTORY & UNDO/REDO SYSTEM

How it works:
  1. When user edits content, new version is created
  2. Version stored in history array (max 5 per page)
  3. currentIndex points to active version
  4. Undo: currentIndex-- (if > 0)
  5. Redo: currentIndex++ (if < history.length - 1)
  6. Reset: Delete all versions, restore to original

History Actions:
  • updatePage(pageId, changes) → Create new version
  • undo(pageId) → Go back 1 version
  • redo(pageId) → Go forward 1 version
  • reset(pageId) → Restore to original (delete history)
  • clearHistory(pageId) → Clear all versions for page

UI Controls:
  [Undo] [Redo] [Reset] (Located in admin header/toolbar)
  Undo/Redo disabled when no history available

═══════════════════════════════════════════════════════════════════

7. IMAGE UPLOAD HANDLING

Image Upload Flow:
  1. User clicks on image in admin page
  2. File picker opens (system dialog)
  3. User selects image file
  4. Convert to data URL or store file path
  5. Update PageData with new image reference
  6. Create new version in history
  7. Re-render page with new image

Image Storage:
  • Store as data URLs (base64) for quick access
  • Size limit: ~5MB per image
  • Supported formats: JPG, PNG, WebP, GIF
  • Fallback: If too large, show error message

Sync Mechanism:
  • Admin images stored in Context state only
  • Public site continues using /public/images
  • No automatic sync needed
  • Admin can export data including images

═══════════════════════════════════════════════════════════════════

8. COMPONENT REUSE PATTERN

Strategy: NO duplication of component logic

Approach:
  1. Public page uses <Component /> with props
  2. Admin page uses <Component /> with same props
  3. Props derived from EditableContent wrappers
  4. Same layout, same styling, same behavior

Example - Home Page:

PUBLIC VERSION:
  <HeroSection 
    title={staticData.heroTitle}
    subtitle={staticData.heroSubtitle}
    images={staticData.heroImages}
  />

ADMIN VERSION:
  <HeroSection 
    title={editableData.heroTitle}
    subtitle={editableData.heroSubtitle}
    images={editableData.heroImages}
  />
  
  Where editableData comes from:
  const editableData = {
    heroTitle: <EditableContent>{data.heroTitle}</EditableContent>,
    // etc
  }

No Component Duplication: Same HeroSection component renders
identically on public and admin pages. The ONLY difference is
the data source (static vs editable).

═══════════════════════════════════════════════════════════════════

9. SYNC MECHANISM (Not Needed for Phase 1-5)

Current State:
  Public pages use /data/*.js files
  Admin pages use Context state
  NO SYNC between them (by design)

Why No Sync:
  • Admin edits are in-memory only
  • On page refresh, data reverts to defaults
  • This is intentional (safety mechanism)

Optional Later (Phase 8):
  • Export admin data as JSON file
  • Manual import to update data files
  • Or: Connect to backend API for persistence
  • Or: Use localStorage for session persistence

═══════════════════════════════════════════════════════════════════

10. EDIT CONTROL UX PATTERNS

Pattern 1: Inline Text Edit
  - Text appears normal on page
  - On hover: pencil icon appears
  - Click: field becomes editable input
  - Type to edit
  - Press Enter or click outside: save
  - Press Esc: cancel

Pattern 2: Image Edit
  - Image displays normally
  - On hover: camera/upload icon appears
  - Click: file picker opens
  - Select image: preview shown
  - Click confirm: save to state
  - Click cancel: discard

Pattern 3: List Items (add/remove)
  - List displays normally
  - On hover: trash icon on each item
  - Plus icon appears below list
  - Click trash: remove item (with undo support)
  - Click plus: add new item

Pattern 4: Textarea (multi-line)
  - Text block displays normally
  - On hover: edit icon appears
  - Click: textarea expands inline
  - Type to edit
  - Click outside: save
  - Esc: cancel

═══════════════════════════════════════════════════════════════════

11. COMPONENT FILES TO CREATE/MODIFY

New Files:
  /context/admin-context.tsx (State management)
  /components/admin/editable-text.tsx (Inline text editor)
  /components/admin/editable-image.tsx (Image uploader)
  /components/admin/editable-list.tsx (List item manager)
  /components/admin/editable-textarea.tsx (Multi-line editor)
  /hooks/useAdmin.ts (Custom hook for admin state)
  /hooks/useHistory.ts (History tracking hook)
  /lib/mock-data.ts (Default data initialization)
  /app/admin/layout.tsx (Admin layout wrapper)
  /app/admin/login/page.tsx (Login page)
  /app/admin/(authenticated)/layout.tsx (Auth guard layout)
  /app/admin/(authenticated)/page.tsx (Admin home)
  /app/admin/(authenticated)/about/page.tsx (Admin about)
  /app/admin/(authenticated)/study-abroad/page.tsx (Admin study)
  /app/admin/(authenticated)/work-abroad/page.tsx (Admin work)
  /app/admin/(authenticated)/travel-tours/page.tsx (Admin travel)
  /app/admin/(authenticated)/global-network/page.tsx (Admin network)
  /app/admin/(authenticated)/contact/page.tsx (Admin contact)

Modify Existing:
  /lib/utils.ts (Add helper functions)
  /types/index.ts (Add AdminStore type definitions)

═══════════════════════════════════════════════════════════════════

12. DATA FLOW DIAGRAM

User Action → EditableContent Wrapper
         ↓
  Custom onChange Handler
         ↓
  updatePage(pageId, changes)
         ↓
  AdminContext Reducer
         ↓
  Create new Version (history)
         ↓
  Update PageData in state
         ↓
  Re-render Component with new props
         ↓
  Visual Update (same styling, same layout)

═══════════════════════════════════════════════════════════════════

13. IMPLEMENTATION ORDER (Within Phase 4-5)

Step 1: Create AdminContext + mock data
Step 2: Create editable wrapper components
Step 3: Create hooks for state management
Step 4: Clone home page with editable content
Step 5: Test undo/redo on home page
Step 6: Replicate pattern to other pages
Step 7: Test all pages for consistency
Step 8: Add styling polish + animations test

═══════════════════════════════════════════════════════════════════

STRATEGY COMPLETE

Status: READY FOR PHASE 3 (Auth Gating System)

Next Step: Design login flow, routing guards, session management.
