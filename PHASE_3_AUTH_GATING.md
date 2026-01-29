PHASE 3: AUTH GATING SYSTEM & ROUTING GUARDS

═══════════════════════════════════════════════════════════════════

CORE AUTH REQUIREMENTS

1. /admin routes require authentication
2. Unauthenticated users redirected to /admin/login
3. No signup page (login only)
4. Username + password (mock, no hashing initially)
5. Session persists (memory or localStorage)
6. Logout available on all admin pages
7. Logo remains non-editable (no auth edits to logo)

═══════════════════════════════════════════════════════════════════

1. AUTH FLOW DIAGRAM

┌────────────────────────────────────────────────────────────────┐
│                   AUTH ROUTING FLOW                            │
└────────────────────────────────────────────────────────────────┘

Unauthenticated User:
  ↓
  Visits /admin/*
  ↓
  Middleware/Guard checks auth state
  ↓
  isAuthenticated = false
  ↓
  Redirect to /admin/login
  ↓
  User sees login form
  ↓
  Enter credentials
  ↓
  Authenticate (check against mock data)
  ↓
  Create session (store in Context + localStorage)
  ↓
  Redirect to /admin/home
  ↓
  Guard allows access
  ↓
  User sees admin home page

Authenticated User (Visiting again):
  ↓
  Opens /admin
  ↓
  Guard checks auth state (from localStorage/Context)
  ↓
  isAuthenticated = true
  ↓
  Allow access
  ↓
  Render admin page

═══════════════════════════════════════════════════════════════════

2. ROUTING STRUCTURE

Routes (Public):
  /                    (Public home)
  /about               (Public about)
  /study-abroad        (Public study)
  /work-abroad         (Public work)
  /travel-tours        (Public travel)
  /global-network      (Public network)
  /contact             (Public contact)

Routes (Admin - No Auth Required):
  /admin/login         (Login form - no auth needed)
  /admin/logout        (Logout action)

Routes (Admin - Auth Required):
  /admin               (Redirect to /admin/login if not auth)
  /admin/home          (Admin home page)
  /admin/about         (Admin about page)
  /admin/study-abroad  (Admin study page)
  /admin/work-abroad   (Admin work page)
  /admin/travel-tours  (Admin travel page)
  /admin/global-network(Admin network page)
  /admin/contact       (Admin contact page)

═══════════════════════════════════════════════════════════════════

3. AUTH STATE STRUCTURE

In AdminContext:

interface AuthState {
  isAuthenticated: boolean
  user: {
    username: string
    role: 'admin' // Can add more roles later
  } | null
  sessionToken: string | null // Optional unique token
  loginTime: number | null
}

Mock Credentials (stored in code):
  Username: admin
  Password: password123
  
  (In production, would come from backend + be hashed)

═══════════════════════════════════════════════════════════════════

4. LOGIN PAGE DESIGN

Location: /app/admin/login/page.tsx

Features:
  • Logo at top (non-editable, matches navbar)
  • Title: "Admin Login"
  • Username input field
  • Password input field
  • Login button
  • Error message display (on failed login)
  • Matches site styling (orange/red gradient, Tailwind)
  • Responsive layout
  • No animation, clean and simple

Form Fields:
  • Username: text input (required)
  • Password: password input (required)
  • Remember Me: optional checkbox (future feature)

Validation:
  • Both fields required
  • Show error if credentials invalid
  • Show error if fields empty
  • No network errors (all mock)

Submit Behavior:
  • Check credentials against mock data
  • If valid:
    - Create session
    - Store in Context
    - Store in localStorage (for persistence)
    - Redirect to /admin/home
  • If invalid:
    - Show "Invalid credentials" error
    - Clear password field
    - Keep username field (for convenience)

═══════════════════════════════════════════════════════════════════

5. AUTHENTICATION GUARD IMPLEMENTATION

Strategy: Use Next.js 16+ Route Groups with Middleware

Directory Structure:

/app/admin/
  ├── login/
  │   └── page.tsx              (Login page - NO guard)
  │
  └── (authenticated)/          (Route group - with guard)
      ├── layout.tsx            (Wrapper with guard logic)
      │
      ├── page.tsx              (Admin home)
      ├── about/
      │   └── page.tsx
      ├── study-abroad/
      │   └── page.tsx
      ├── work-abroad/
      │   └── page.tsx
      ├── travel-tours/
      │   └── page.tsx
      ├── global-network/
      │   └── page.tsx
      └── contact/
          └── page.tsx

Guard Logic (in /app/admin/(authenticated)/layout.tsx):

```
export default function AuthenticatedLayout({ children }) {
  const router = useRouter()
  const { isAuthenticated } = useAdminAuth()
  const [isChecking, setIsChecking] = useState(true)
  
  useEffect(() => {
    // Check auth on mount
    if (!isAuthenticated) {
      // Redirect to login
      router.push('/admin/login')
    }
    setIsChecking(false)
  }, [isAuthenticated, router])
  
  if (isChecking) {
    return <LoadingSpinner /> // Or nothing
  }
  
  return isAuthenticated ? children : null
}
```

═══════════════════════════════════════════════════════════════════

6. SESSION PERSISTENCE

How Sessions Work:

Option 1: Memory Only
  • Session stored in React Context
  • Lost on page refresh
  • Quick to implement
  • Less secure (easy to clear)

Option 2: localStorage (Recommended for Phase 1)
  • Store session token/username in localStorage
  • Check localStorage on app startup
  • Persist across page refreshes
  • More user-friendly
  • Not fully secure (client-side only)

Option 3: Cookies (Best Practice)
  • Store session in HTTP-only cookie
  • Server can read cookie on each request
  • Most secure option
  • Requires backend support

Implementation (Option 2 - localStorage):

// On successful login:
const sessionData = {
  username: 'admin',
  loginTime: Date.now(),
  token: generateSimpleToken() // Non-cryptographic UUID
}
localStorage.setItem('admin_session', JSON.stringify(sessionData))

// On app startup:
useEffect(() => {
  const session = JSON.parse(localStorage.getItem('admin_session'))
  if (session) {
    validateSession(session) // Check if session still valid
    setAuthState({ isAuthenticated: true, user: session.username })
  }
}, [])

// On logout:
localStorage.removeItem('admin_session')
setAuthState({ isAuthenticated: false, user: null })

═══════════════════════════════════════════════════════════════════

7. LOGOUT MECHANISM

Logout Button Location:
  • Admin navbar (top right, next to logo)
  • Or: Floating button on each admin page
  • Or: Admin settings menu

Logout Action:
  1. User clicks "Logout"
  2. Confirm dialog (optional): "Are you sure?"
  3. On confirm:
     - Clear localStorage session
     - Clear Context auth state
     - Redirect to /admin/login
     - Show "Logged out" message
  4. Session data completely removed

═══════════════════════════════════════════════════════════════════

8. SESSION TIMEOUT (Optional Enhancement)

Current State: No timeout

Future Enhancement:
  • Auto-logout after 30 minutes of inactivity
  • Show warning at 25 minutes
  • Track last user action (mouse, keyboard)
  • Clear session on timeout
  • Redirect to login with message

═══════════════════════════════════════════════════════════════════

9. ADMIN AUTH CONTEXT STRUCTURE

New Auth Methods in AdminContext:

interface AdminAuthActions {
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
  validateSession: () => boolean
  isAuthenticated: () => boolean
  getCurrentUser: () => string | null
  clearSession: () => void
}

useAdminAuth() Hook:
  • Provides isAuthenticated flag
  • Provides login/logout functions
  • Checks localStorage on mount
  • Handles session validation

═══════════════════════════════════════════════════════════════════

10. MOCK CREDENTIALS STORAGE

Option 1: Hardcoded in Context
  // In AdminContext.tsx
  const MOCK_CREDENTIALS = {
    admin: 'password123'
  }
  
  const validateCredentials = (username, password) => {
    return MOCK_CREDENTIALS[username] === password
  }

Option 2: Separate constants file
  // In /lib/mock-auth.ts
  export const MOCK_CREDENTIALS = { ... }

Option 3: In admin data file
  // Could extend /data to include admin users
  // Not recommended for this phase

Recommendation: Use Option 1 (hardcoded in context, simple and clear)

═══════════════════════════════════════════════════════════════════

11. LOGIN PAGE STYLING

Match existing site design:

Layout:
  • Centered form (max-width: 400px)
  • Logo at top
  • Form title below
  • Input fields with proper spacing
  • Button at bottom

Colors:
  • Background: white or light gray
  • Input borders: border-gray-300
  • Button: gradient orange-to-red (matches site)
  • Button hover: darker gradient
  • Text: dark gray (matches site)
  • Error message: red

Typography:
  • Title: font-bold, text-2xl
  • Labels: font-semibold, text-sm
  • Input text: font-normal, text-base

Responsive:
  • Mobile: full width with padding
  • Tablet: centered with max-width
  • Desktop: centered with max-width

═══════════════════════════════════════════════════════════════════

12. ERROR HANDLING

Login Errors:

1. Username not found
   Message: "Username or password incorrect"
   Action: Clear password, keep username

2. Password incorrect
   Message: "Username or password incorrect"
   Action: Clear password, keep username

3. Both fields empty
   Message: Show inline validation errors
   Action: Do not submit

4. Session expired (if timeout added)
   Message: "Your session has expired. Please login again."
   Action: Redirect to login, clear session

5. Network error (future, if API added)
   Message: "Unable to connect to server"
   Action: Show retry button

═══════════════════════════════════════════════════════════════════

13. SECURITY NOTES (Phase 1 Limitations)

Current (Phase 1 - Mock):
  • No password hashing
  • Credentials in client code
  • No HTTPS/TLS
  • No rate limiting
  • No CSRF protection
  • localStorage is readable by JavaScript
  • Not suitable for production

Future (Phase X - Production):
  • Implement real backend auth (bcrypt, JWT)
  • Use HTTP-only cookies
  • Implement CORS protection
  • Add rate limiting on login attempts
  • Use HTTPS only
  • Add CSRF tokens
  • Implement session expiration
  • Add audit logging

═══════════════════════════════════════════════════════════════════

14. TESTING AUTH FLOW

Manual Testing Steps:

1. Visit /admin (not logged in)
   Expected: Redirect to /admin/login

2. Visit /admin/login
   Expected: See login form

3. Try login with wrong credentials
   Expected: Error message appears

4. Try login with correct credentials (admin/password123)
   Expected: Redirect to /admin/home

5. On /admin/home, refresh page
   Expected: Still logged in (session persists)

6. Click Logout button
   Expected: Redirect to /admin/login, session cleared

7. Try accessing /admin/about directly
   Expected: If logged out, redirect to /admin/login

═══════════════════════════════════════════════════════════════════

AUTH GATING DESIGN COMPLETE

Status: READY FOR PHASE 4 (Implementation)

Next Step: Begin implementing auth system, login page, and first admin page.
