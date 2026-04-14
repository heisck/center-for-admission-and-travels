# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Center for Admission and Travels (CFAAT) - a Next.js 16 website for a Ghanaian education and travel agency. Provides study abroad, work abroad, and travel tour services with an admin CMS panel, Paystack payment integration, and blog.

## Commands

```bash
npm run dev          # Start dev server (localhost:3000)
npm run build        # Production build
npm run lint         # ESLint
npm run test         # Vitest (all tests)
npm run test:watch   # Vitest watch mode

# Database
npm run db:generate  # Generate Prisma client
npm run db:migrate   # Run migrations (dev)
npm run db:studio    # Open Prisma Studio GUI
npm run db:seed      # Seed database (tsx prisma/seed.ts)
npm run db:push      # Push schema without migration
npm run db:setup     # Generate + deploy migrations (CI/prod)

# Load testing (requires k6)
npm run loadtest:smoke
npm run loadtest:peak
npm run loadtest:writes
```

## Architecture

### Stack
- **Next.js 16** (App Router) with React 19, TypeScript, Tailwind CSS v4
- **Prisma** with PostgreSQL (Supabase in prod)
- **Cloudinary** for image uploads
- **Paystack** for GHS payments
- **Nodemailer** (Gmail SMTP) for transactional emails
- **Upstash Redis** for distributed rate limiting
- **GSAP + Motion (Framer Motion)** for animations
- **shadcn/ui** (Radix primitives + CVA) component library
- **Vitest** for testing, **k6** for load tests
- **Render** as deployment target (see `render.yaml`)

### Auth System (Dual)
Two separate auth systems with independent session tables:
- **Admin auth** (`AdminUser`, `AdminSession`): token-based sessions in `admin_sessions`, role-based access (SUPER_ADMIN, ADMIN, EDITOR, SUPPORT, VIEWER). Auth logic in `lib/auth-helpers.ts`, permissions in `lib/admin-permissions.ts`.
- **Public user auth** (`User`, `UserSession`): token-based sessions in `user_sessions`. Auth logic in `lib/user-auth.ts`, cookies in `lib/user-session-cookies.ts`.

### Content Architecture
All public page content is database-driven and admin-editable:
- Each page type has its own Prisma model (HomePage, AboutPage, ServicePage, TravelToursPage, Package, BlogPost, LegalPage)
- `ContentVersion` model stores snapshots for undo/redo
- Content is fetched server-side via `lib/public-content.ts` and `lib/prisma-content-helpers.ts`
- Admin API routes under `app/api/admin/content/` for CRUD operations
- React context providers in `context/` (admin-context, public-content-context, user-auth-context)

### API Route Organization
- `app/api/admin/` - Admin CMS endpoints (auth, blog, bookings, content, images, newsletter, payments)
- `app/api/auth/` - Public user authentication
- `app/api/payment/` - Paystack payment flow
- `app/api/contact/` - Contact form submissions
- `app/api/health/` - Health check endpoint
- `app/api/newsletter/` - Newsletter subscriptions
- `app/api/blog/`, `app/api/packages/` - Public read endpoints

### Key Patterns
- `@/*` path alias maps to project root
- Singleton Prisma client via `lib/prisma.ts` (cached in globalThis for dev HMR)
- Rate limiting via `lib/rate-limit.ts` (Upstash Redis in prod, in-memory fallback)
- Admin audit logging via `lib/admin-audit.ts`
- Images stored as Cloudinary URLs in the database
- CSP headers configured in `next.config.mjs` (Paystack domains whitelisted)
- `lib/security.ts` for security utilities
- Static data fallbacks in `data/` directory (countries, packages, team, services)

## ESLint Config
`@typescript-eslint/no-explicit-any` and `@typescript-eslint/no-require-imports` are intentionally off. `react/no-unescaped-entities` is off for content pages.

## Environment
Requires `.env` with DATABASE_URL, Cloudinary credentials, Paystack keys, SMTP config. See `.env.example` for full list. Seeding is gated behind `ALLOW_DATABASE_SEED=true`.
