# Service Page Hero Redesign

## Summary

Replace the 2-column "image left, text right on pale gradient" hero in `service-page-template.tsx` with a full-bleed cinematic hero image with overlaid text and subtle CSS entrance animations.

Affects: Study Abroad, Work Abroad, Global Network (all pages using the shared template).

## Hero Section

### Layout

- Remove `bg-gradient-to-br from-orange-50 to-red-50` background and the `grid md:grid-cols-2` layout
- Full-bleed container: `position: relative`, `min-h-[50vh] md:min-h-[60vh]`, `overflow: hidden`
- Hero image: `<Image>` with `fill`, `object-cover`, `priority`
- Gradient overlay div on top of image: `bg-gradient-to-b from-black/5 via-black/30 to-black/65`
- Text container: positioned at the bottom of the section using flex `items-end`, inside the usual `max-w-7xl` wrapper with bottom padding

### Text Treatment

- Title: white text (`text-white`), keeps existing size classes (`text-4xl sm:text-5xl md:text-6xl font-bold`)
- Subtitle: `text-white/85`
- Description paragraph: `text-white/75`
- CTA button: keeps `bg-gradient-to-r from-orange-500 to-red-600` — pops against the dark overlay
- Max-width on text block (`max-w-2xl`) so it doesn't stretch across the full viewport

### Animations (CSS only)

**Ken Burns zoom on image:**
- `@keyframes ken-burns { from { transform: scale(1) } to { transform: scale(1.05) } }`
- Applied to the image: `animation: ken-burns 20s ease-out forwards`
- The container has `overflow: hidden` so the scaled image doesn't cause scrollbars

**Staggered text fade-up:**
- `@keyframes fade-up { from { opacity: 0; transform: translateY(20px) } to { opacity: 1; transform: translateY(0) } }`
- Title: `animation-delay: 0.15s`
- Subtitle: `animation-delay: 0.3s`
- CTA: `animation-delay: 0.45s`
- All use `duration: 0.7s`, `ease-out`, `animation-fill-mode: both` (starts invisible)

**Reduced motion:**
- `@media (prefers-reduced-motion: reduce)` sets `animation: none` and restores full opacity on text elements

### Mobile

- `min-h-[50vh]` (shorter than desktop's 60vh)
- Same full-bleed image + overlay + bottom-aligned text
- Text sizes scale down via existing responsive classes

## What Stays the Same

- All sections below the hero (overview, benefits, requirements, countries, visa, testimonials, scholarships, CTA)
- Data flow: `service.heroImage`, `service.bannerTitle`, `service.bannerSubtitle` used exactly as before
- No new props, no schema changes, no API changes

## Files Changed

- `components/service-page-template.tsx` — hero section markup rewrite
- New CSS file `components/service-hero.css` — keyframes and animation classes (or inline in the template via Tailwind arbitrary values)
