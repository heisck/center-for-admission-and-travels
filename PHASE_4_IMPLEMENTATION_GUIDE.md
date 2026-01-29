PHASE 4-7: STEP-BY-STEP IMPLEMENTATION GUIDE

═══════════════════════════════════════════════════════════════════

OVERVIEW

This document provides the exact implementation steps for:
  • Phase 4: Home admin page with inline editing + undo/redo
  • Phase 5: Replicate pattern to other pages
  • Phase 6: Implement login + auth gates
  • Phase 7: Remove old admin implementation

═══════════════════════════════════════════════════════════════════

PHASE 4: IMPLEMENT HOME ADMIN PAGE

This is the foundational phase. Get this RIGHT and the rest is copy/paste.

═══════════════════════════════════════════════════════════════════

PHASE 4 STEP 1: Create AdminContext with State Management

File: /context/admin-context.tsx

What to create:
  1. AdminStore interface (contains all page data)
  2. Version tracking for undo/redo
  3. Mock data initialization (from /data files)
  4. useAdminContext hook
  5. AdminProvider component
  6. Action creators (updatePage, undo, redo, reset)

Key points:
  • Initialize with mock data from /data/packages.js, /data/services.js, /data/team.js
  • Keep last 5 versions per page in history array
  • Export useAdmin() hook for easy access
  • Track isDirty flag (changed from default)
  • Track currentEditingPage

Structure:
  export const AdminContext = createContext<AdminStore | null>(null)
  export const AdminProvider: React.FC<{children}> = ({ children }) => {...}
  export const useAdmin = () => {...}

═══════════════════════════════════════════════════════════════════

PHASE 4 STEP 2: Create Editable Component Wrappers

Files to create:

a) /components/admin/editable-text.tsx
   Purpose: Inline text editor for single-line content
   Props:
     - value: string
     - onChange: (newValue: string) => void
     - field: string (for tracking)
     - children: React.ReactNode (the displayed content)
   Features:
     - Shows pencil icon on hover
     - Click to edit
     - Input field appears
     - Enter to save, Esc to cancel
     - Visual feedback (border color change)

b) /components/admin/editable-textarea.tsx
   Purpose: Inline text editor for multi-line content
   Props: Same as editable-text
   Features:
     - Textarea instead of input
     - Auto-resize to fit content
     - Better for paragraphs

c) /components/admin/editable-image.tsx
   Purpose: Click to upload new image
   Props:
     - value: string (image URL)
     - onChange: (newValue: string) => void
     - field: string
     - children: React.ReactNode
   Features:
     - Shows camera icon on hover
     - Click opens file picker
     - Preview new image before saving
     - Convert to data URL or blob URL
     - Delete option

d) /components/admin/editable-list.tsx
   Purpose: Manage list items (add/remove)
   Props:
     - items: any[]
     - onChange: (newItems: any[]) => void
     - renderItem: (item, index) => React.ReactNode
     - onAdd: () => any (default new item)
   Features:
     - Trash icon on each item (on hover)
     - Plus button below list
     - Click trash: remove item
     - Click plus: add new item
     - Visual reorder drag (optional for phase 1)

═══════════════════════════════════════════════════════════════════

PHASE 4 STEP 3: Create History Tracking Hook

File: /hooks/useHistory.ts

Purpose: Manage undo/redo for a page

Actions:
  • addVersion(data, description?) - Create new version
  • undo() - Go back
  • redo() - Go forward
  • reset() - Go to original
  • getCurrentData() - Get current version data
  • canUndo() - Check if undo available
  • canRedo() - Check if redo available

State:
  • versions: Array<{timestamp, data, description}>
  • currentIndex: number
  • maxVersions: 5

Usage Example:
  const history = useHistory(initialData, 5)
  history.addVersion(newData) // Auto-creates version
  history.undo() // Go back one version
  history.getCurrentData() // Get current version

═══════════════════════════════════════════════════════════════════

PHASE 4 STEP 4: Create Mock Data Initialization

File: /lib/mock-data.ts

Purpose: Load initial data for admin context

Function: initializeMockData()
  Reads from:
    • /data/packages.js (for travel packages)
    • /data/services.js (for study/work/network services)
    • /data/team.js (for team members)
  Returns: Full AdminStore data structure
  
Function: getDefaultPageData(pageId)
  Returns: Default data for specific page

═══════════════════════════════════════════════════════════════════

PHASE 4 STEP 5: Create Admin Header/Toolbar Component

File: /components/admin/admin-toolbar.tsx

Purpose: Show undo/redo/reset buttons

Features:
  • Undo button (disabled if no history)
  • Redo button (disabled if no history)
  • Reset button (confirms with modal)
  • Page title/indicator
  • Last saved time
  • Logout button (top right)

Styling:
  • Sticky at top
  • Orange/red gradient background
  • White text
  • Clear button states (disabled = opacity-50)

═══════════════════════════════════════════════════════════════════

PHASE 4 STEP 6: Clone Home Page Structure

File: /app/admin/(authenticated)/page.tsx

Strategy: Import same components as public /app/page.tsx
          BUT wrap content in EditableContent wrappers

Steps:
  1. Import Navbar, HeroSection, ServicesGrid, CTASection, Footer
  2. Import useAdmin hook
  3. Get admin data from context: const adminData = homeData
  4. Create wrapper version with EditableContent:

     <HeroSection
       title={
         <EditableText
           value={adminData.heroTitle}
           onChange={(newVal) => updateHomeHero({ heroTitle: newVal })}
         >
           {adminData.heroTitle}
         </EditableText>
       }
       images={adminData.heroImages}
       // etc...
     />

  5. Make sure styling is identical to public version
  6. Ensure animations still work
  7. Test that content displays correctly

Key: DO NOT change the component structure or layout.
     Just swap data source and wrap in editable controls.

═══════════════════════════════════════════════════════════════════

PHASE 4 STEP 7: Implement Inline Editing

For each editable field, use pattern:

Text Field Example:
  const [isEditing, setIsEditing] = useState(false)
  const [value, setValue] = useState(initialValue)
  
  {isEditing ? (
    <input
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={() => {
        onChange(value)
        setIsEditing(false)
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          onChange(value)
          setIsEditing(false)
        }
        if (e.key === 'Escape') {
          setValue(initialValue)
          setIsEditing(false)
        }
      }}
      autoFocus
      className="border-2 border-orange-500 rounded px-2 py-1"
    />
  ) : (
    <div
      onClick={() => setIsEditing(true)}
      className="relative group cursor-pointer"
    >
      {initialValue}
      <span className="absolute -right-6 top-0 opacity-0 group-hover:opacity-100">
        <PencilIcon />
      </span>
    </div>
  )}

═══════════════════════════════════════════════════════════════════

PHASE 4 STEP 8: Integrate Undo/Redo

In admin home page:

  const { content, undo, redo, canUndo, canRedo } = useAdmin()
  
  const handleUpdateField = (field, value) => {
    // Update the field
    updateHomeHero({ [field]: value })
    // This should automatically create new version in history
  }
  
  // In toolbar:
  <button onClick={undo} disabled={!canUndo}>Undo</button>
  <button onClick={redo} disabled={!canRedo}>Redo</button>

═══════════════════════════════════════════════════════════════════

PHASE 4 STEP 9: Test Home Admin Page

Checklist:
  ✓ Visit /admin/home, see page (should be exact clone)
  ✓ Click on text, inline editor appears
  ✓ Edit text, click away, page updates
  ✓ Click undo, change reverts
  ✓ Click redo, change reapplies
  ✓ All animations still work
  ✓ Styling matches public version exactly
  ✓ Images display correctly
  ✓ Services grid shows and is editable
  ✓ CTA section editable
  ✓ Reset button clears all changes
  ✓ After refresh, changes don't persist (expected)

═══════════════════════════════════════════════════════════════════

PHASE 5: REPLICATE PATTERN TO OTHER PAGES

Once Phase 4 is working, Phase 5 is simple copy/paste with adjustments.

═══════════════════════════════════════════════════════════════════

PHASE 5 STEP 1: Create Admin About Page

File: /app/admin/(authenticated)/about/page.tsx

Steps:
  1. Copy /app/about/page.tsx structure
  2. Import admin context
  3. Get aboutData from context
  4. Wrap content in EditableContent wrappers
  5. Make hero image editable
  6. Make mission/vision editable
  7. Make team members editable (add/edit/delete)
  8. Make core values editable (add/edit/delete)
  9. Test with undo/redo
  10. Verify styling matches public version

═══════════════════════════════════════════════════════════════════

PHASE 5 STEP 2: Create Admin Travel Tours Page

File: /app/admin/(authenticated)/travel-tours/page.tsx

Steps:
  1. Copy /app/travel-tours/page.tsx structure
  2. Import admin context
  3. Get travelData from context
  4. Wrap hero section in editable controls
  5. Wrap package cards in editableList
  6. Each package card editable:
     - Name, description, price, duration
     - Images (using editable-image)
     - Highlights (using editable-list)
     - Itinerary (using editable-textarea)
  7. Add button to create new package
  8. Add button to delete package (on hover)
  9. Test with undo/redo
  10. Verify all animations work

═══════════════════════════════════════════════════════════════════

PHASE 5 STEP 3: Create Admin Study/Work/Network Pages

Files:
  /app/admin/(authenticated)/study-abroad/page.tsx
  /app/admin/(authenticated)/work-abroad/page.tsx
  /app/admin/(authenticated)/global-network/page.tsx

Steps (for each page):
  1. Copy public page structure
  2. Import admin context
  3. Get service data from context
  4. Make title/description editable
  5. Make benefits list editable
  6. Make requirements list editable
  7. Make countries list editable
  8. Make process steps editable (add/edit/delete)
  9. Test with undo/redo
  10. Verify matching public version

═══════════════════════════════════════════════════════════════════

PHASE 5 STEP 4: Create Admin Contact Page

File: /app/admin/(authenticated)/contact/page.tsx

Steps:
  1. Copy /app/contact/page.tsx structure
  2. Make form title/description editable
  3. Make form fields editable:
     - Can edit label
     - Can edit placeholder
     - Can edit type (text/email/phone/textarea)
     - Can edit required flag
  4. Add button to add new field
  5. Add button to delete field (with undo support)
  6. Test with undo/redo

═══════════════════════════════════════════════════════════════════

PHASE 5 COMPLETION CHECKLIST

  ✓ /admin/about working (clone + editable)
  ✓ /admin/travel-tours working (clone + editable)
  ✓ /admin/study-abroad working (clone + editable)
  ✓ /admin/work-abroad working (clone + editable)
  ✓ /admin/global-network working (clone + editable)
  ✓ /admin/contact working (clone + editable)
  ✓ All pages have undo/redo/reset
  ✓ All pages match public version styling
  ✓ All animations work on all pages
  ✓ No layout shifts when editing
  ✓ No console errors

═══════════════════════════════════════════════════════════════════

PHASE 6: IMPLEMENT ADMIN LOGIN & AUTH GATES

═══════════════════════════════════════════════════════════════════

PHASE 6 STEP 1: Update AdminContext with Auth State

In /context/admin-context.tsx:

Add to AdminStore:
  interface AdminStore {
    // ... existing
    auth: {
      isAuthenticated: boolean
      user: { username: string } | null
    }
  }

Add actions:
  login(username, password): Promise<boolean>
  logout(): void
  validateSession(): boolean

═══════════════════════════════════════════════════════════════════

PHASE 6 STEP 2: Create Login Page

File: /app/admin/login/page.tsx

Features:
  • Logo at top
  • Title: "Admin Login"
  • Username input
  • Password input
  • Login button
  • Error message display
  • Match site styling
  • Responsive layout

Validation:
  • Check credentials: admin / password123
  • Show error if invalid
  • Call context.login()
  • On success: redirect to /admin/home
  • On error: show message, clear password

═══════════════════════════════════════════════════════════════════

PHASE 6 STEP 3: Create Auth Guard Layout

File: /app/admin/(authenticated)/layout.tsx

Purpose: Guard all routes in this group

Implementation:
  • Check isAuthenticated from context
  • If false: redirect to /admin/login
  • If true: render children
  • Show loading state while checking

═══════════════════════════════════════════════════════════════════

PHASE 6 STEP 4: Add Logout Button

Location: Admin navbar or floating button

Action:
  • Click logout
  • Confirm dialog: "Are you sure?"
  • Clear auth state
  • Clear localStorage session
  • Redirect to /admin/login

═══════════════════════════════════════════════════════════════════

PHASE 6 STEP 5: Persist Session

Using localStorage:

On login success:
  const session = { username, loginTime: Date.now() }
  localStorage.setItem('admin_session', JSON.stringify(session))
  
On app startup (in AdminContext):
  const session = localStorage.getItem('admin_session')
  if (session) {
    setAuth({ isAuthenticated: true, user: session })
  }
  
On logout:
  localStorage.removeItem('admin_session')
  setAuth({ isAuthenticated: false, user: null })

═══════════════════════════════════════════════════════════════════

PHASE 6 COMPLETION CHECKLIST

  ✓ Login page appears at /admin/login
  ✓ Cannot access /admin routes without login
  ✓ Login with admin/password123 works
  ✓ Invalid credentials show error
  ✓ Session persists after refresh
  ✓ Logout button clears session
  ✓ After logout, redirects to login
  ✓ localStorage clears on logout
  ✓ All admin pages have logout button
  ✓ UI matches site styling

═══════════════════════════════════════════════════════════════════

PHASE 7: REMOVE OLD ADMIN IMPLEMENTATION

═══════════════════════════════════════════════════════════════════

PHASE 7 STEP 1: Identify Old Admin Code

Find and list all existing admin-related files:
  • /app/admin/* (check what currently exists)
  • /components/admin/* (if old components)
  • Any hardcoded admin data
  • Any fixed panels, sidebars, preview layouts

═══════════════════════════════════════════════════════════════════

PHASE 7 STEP 2: Delete Old Files

Remove:
  • Old admin pages (if they exist)
  • Old admin components
  • Old admin styling
  • Old admin context (if different from new one)

Keep:
  • NEW /app/admin/login
  • NEW /app/admin/(authenticated)
  • NEW /context/admin-context.tsx
  • NEW /components/admin/* (new components)

═══════════════════════════════════════════════════════════════════

PHASE 7 STEP 3: Clean Up Routes

Verify routing:
  /admin → Redirects to /admin/login (if not auth)
  /admin/login → Login page
  /admin/home → Home page (with auth)
  /admin/about → About page (with auth)
  etc...

═══════════════════════════════════════════════════════════════════

FINAL CHECKLIST (All Phases Complete)

FUNCTIONALITY:
  ✓ All 7 admin pages are exact clones of public pages
  ✓ All pages support inline text editing
  ✓ All pages support image uploading
  ✓ All pages support list add/edit/delete
  ✓ Undo/redo works on all pages
  ✓ Reset works on all pages
  ✓ Authentication working (login/logout)
  ✓ Session persists after refresh
  ✓ Unauthorized users redirected to login
  ✓ All animations work during editing
  ✓ No layout shifts or visual glitches
  ✓ No console errors
  ✓ Old admin code removed

STYLING & UX:
  ✓ Admin pages look identical to public pages
  ✓ Edit controls non-intrusive (appear on hover)
  ✓ No sidebars or fixed panels
  ✓ No "dashboard" aesthetic
  ✓ Navbar and footer unchanged
  ✓ All Tailwind classes match public site
  ✓ Responsive on mobile/tablet/desktop
  ✓ Animations smooth and functional
  ✓ Loading states handled
  ✓ Error messages clear

DATA:
  ✓ Mock data loaded from /data files
  ✓ Changes don't persist on refresh (expected)
  ✓ Full undo/redo history works
  ✓ Reset goes back to original data
  ✓ No backend calls needed
  ✓ No database required

═══════════════════════════════════════════════════════════════════

IMPLEMENTATION GUIDE COMPLETE

You now have:
  1. Detailed architecture (Phase 1)
  2. State management design (Phase 2)
  3. Auth system design (Phase 3)
  4. Implementation steps for Phase 4 (home page)
  5. Copy/paste pattern for Phase 5 (other pages)
  6. Auth implementation steps for Phase 6 (login)
  7. Cleanup steps for Phase 7 (remove old code)

Next: Begin Phase 4 implementation!
