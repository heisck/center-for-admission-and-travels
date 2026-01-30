# Migration Guide: Static Data → Database-Driven

## Overview

This guide explains how to migrate from the current static data files to the database-driven architecture.

## Architecture Summary

```
ADMIN PANEL → API → DATABASE ← API ← PUBLIC PAGES
   (WRITE)                    (READ)
```

## Step-by-Step Migration

### Step 1: Update Admin Context to Write to API

**Current**: AdminContext writes to localStorage  
**Target**: AdminContext writes to API (which writes to database)

**File**: `context/admin-context.tsx`

```typescript
// Add import
import * as adminApi from '@/lib/admin-api-client'

// Update methods to call API
const updateHomeHero = useCallback(async (updates: Partial<AdminContent['home']['hero']>) => {
  // Optimistic update (update UI immediately)
  const newContent = {
    ...content,
    home: {
      ...content.home,
      hero: { ...content.home.hero, ...updates },
    },
  }
  setContent(newContent)
  
  // Sync to database
  const result = await adminApi.updateHomeContent({ hero: newContent.home.hero })
  if (!result.success) {
    // Revert on error
    setContent(content)
    console.error('Failed to save:', result.error)
  }
}, [content])
```

### Step 2: Add Public Content Provider

**File**: `app/layout.tsx`

```typescript
import { PublicContentProvider } from '@/context/public-content-context'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <PublicContentProvider>
          {children}
        </PublicContentProvider>
      </body>
    </html>
  )
}
```

### Step 3: Update Public Pages to Use API

**Current**: Public pages use static `data/*.js` files  
**Target**: Public pages use `usePublicContent()` hook

**Example**: `app/page.tsx`

```typescript
'use client'

import { usePublicContent } from '@/context/public-content-context'
import HeroSection from '@/components/hero-section'

export default function Home() {
  const { content, loading } = usePublicContent()

  if (loading) {
    return <div>Loading...</div>
  }

  if (!content) {
    return <div>Error loading content</div>
  }

  return (
    <main>
      <HeroSection 
        title={content.home.hero.title}
        subtitle={content.home.hero.subtitle}
        description={content.home.hero.description}
        // ... etc
      />
    </main>
  )
}
```

**Example**: `app/study-abroad/page.tsx`

```typescript
'use client'

import { usePublicContent } from '@/context/public-content-context'
import ServicePageTemplate from '@/components/service-page-template'

export default function StudyAbroad() {
  const { content, loading } = usePublicContent()

  if (loading) return <div>Loading...</div>
  if (!content) return <div>Error</div>

  const service = content.servicePages.find((s) => s.id === 'study-abroad')
  if (!service) return <div>Service not found</div>

  return <ServicePageTemplate service={service} />
}
```

### Step 4: Update Components

Components that currently read from props should continue to work, but the data source changes:

**Before**:
```typescript
// app/page.tsx
import { services } from '@/data/services'
<ServicesGrid services={services} />
```

**After**:
```typescript
// app/page.tsx
const { content } = usePublicContent()
<ServicesGrid services={content.home.services} />
```

### Step 5: Remove or Keep Static Data as Fallback

**Option A**: Remove static data files (clean approach)
- Delete `data/services.js`, `data/packages.js`, etc.
- All content comes from database

**Option B**: Keep as fallback (safer approach)
- Keep static files
- Use them as fallback if API fails
- Gradually migrate

**Recommended**: Option B for safety during migration

## Testing Checklist

- [ ] Admin can edit content
- [ ] Changes appear in database
- [ ] Public pages load from API
- [ ] Public pages show updated content
- [ ] Error handling works (API failures)
- [ ] Loading states work
- [ ] No console errors

## Rollback Plan

If issues occur:
1. Revert to static data files
2. Keep AdminContext using localStorage
3. Fix issues
4. Retry migration

## Benefits After Migration

✅ **Single source of truth** - Database only  
✅ **Real-time updates** - Changes reflect immediately  
✅ **No localStorage limits** - No quota issues  
✅ **Better performance** - Server-side caching possible  
✅ **Version control** - Database tracks all changes  
✅ **Backup/restore** - Database backups available

## Timeline

- **Phase 1**: Set up database and API (✅ DONE)
- **Phase 2**: Update AdminContext to write to API (⏳ TODO)
- **Phase 3**: Add PublicContentProvider (⏳ TODO)
- **Phase 4**: Update public pages (⏳ TODO)
- **Phase 5**: Remove static data files (⏳ TODO)
