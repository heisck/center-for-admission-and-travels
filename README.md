# Center for Admission and Travels

This repository contains the Next.js web application for the Center for Admission and Travels. It features a public-facing travel agency website alongside a comprehensive, fully-integrated professional Admin System.

## Project Overview

The core feature of this application is its custom Admin System, which is built to be an exact replica of the public-facing pages. This architecture enables administrators to perform intuitive, inline, WYSIWYG editing of website content (such as Hero sections, Packages, Travel Tours, and Services) directly on the UI. It also includes an undo/redo history feature for robust content management.

## Key Features

- **Inline Admin Editing**: Administrators can edit content directly on pages that mirror the public UI.
- **State Management & History**: Built-in undo/redo functionality for content edits, with optimized localStorage usage to prevent quota exhaustion.
- **Authentication & Security**: Secure login mechanisms and role-based auth gating for admin routes.
- **Media Management**: Integrated with Cloudinary for seamless image uploads and masonry gallery management.
- **Payments**: Pre-configured integration with Paystack for processing transactions.
- **Robust Database**: Relational schema powered by Prisma ORM and PostgreSQL.

## Technology Stack

- **Framework**: Next.js (React)
- **Database**: PostgreSQL
- **ORM**: Prisma (Compatible with v6.0.0+)
- **Image Hosting**: Cloudinary
- **Payments**: Paystack
- **Deployment**: Configured for Render

## Next Steps

Please refer to the following retained documents for more detailed information:
- **`QUICK_START.md`**: Guide for initial database (Supabase/Neon) and environment setup.
- **`ARCHITECTURE_OVERVIEW.md`**: Deep dive into the system's structural design and admin implementation phases.
