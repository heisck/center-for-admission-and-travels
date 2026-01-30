# Architecture Overview

## Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    ADMIN PANEL (/admin/*)                    │
│                                                               │
│  Admin edits content → API calls → Database (WRITE)          │
│                                                               │
│  - Uses: AdminContext (writes to API)                        │
│  - Endpoints: /api/admin/content/*                           │
│  - Auth: Required (session-based)                            │
└─────────────────────────────────────────────────────────────┘
                            ↓
                    ┌──────────────┐
                    │   DATABASE   │
                    │  (PostgreSQL)│
                    └──────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              PUBLIC PAGES (/, /about, etc.)                  │
│                                                               │
│  Public pages display → API calls → Database (READ)          │
│                                                               │
│  - Uses: PublicContentContext (reads from API)               │
│  - Endpoint: /api/content                                    │
│  - Auth: Not required                                        │
└─────────────────────────────────────────────────────────────┘
```

## Key Principles

1. **Admin Panel = WRITE ONLY**
   - All edits go through `/api/admin/content/*` endpoints
   - Requires authentication
   - Updates database directly

2. **Public Pages = READ ONLY**
   - All content fetched from `/api/content` endpoint
   - No authentication required
   - Never writes to database

3. **Single Source of Truth**
   - Database is the only source of truth
   - No static data files for content
   - No localStorage for public pages

## Current State vs. Target State

### Current State (Needs Update)
- ❌ Public pages use static `data/*.js` files
- ❌ Admin uses localStorage
- ❌ No clear separation

### Target State (What We're Building)
- ✅ Public pages fetch from `/api/content`
- ✅ Admin writes to `/api/admin/content/*`
- ✅ Clear read/write separation

## Implementation Steps

1. ✅ Database schema created
2. ✅ API endpoints created
3. ⏳ Create PublicContentContext (reads from API)
4. ⏳ Update AdminContext (writes to API)
5. ⏳ Update public pages to use PublicContentContext
6. ⏳ Remove static data files (or keep as fallback)
