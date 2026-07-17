/**
 * Blog URL slugs: always generate a stable, URL-safe slug so public links
 * never point at an unknown route — even if the display title has spaces,
 * punctuation, or non-Latin characters.
 */

export function slugifyBlogTitle(text: string): string {
  const normalized = String(text || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '') // strip combining marks
    .toLowerCase()
    .trim()

  const slug = normalized
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80)

  // Never return empty — empty slug would make /blog/ and break routing
  return slug || 'post'
}

/** Build a unique slug; caller supplies an existence check. */
export async function ensureUniqueBlogSlug(
  baseTitleOrSlug: string,
  isTaken: (slug: string) => Promise<boolean>
): Promise<string> {
  const base = slugifyBlogTitle(baseTitleOrSlug)
  if (!(await isTaken(base))) return base

  for (let i = 2; i < 50; i++) {
    const candidate = `${base}-${i}`
    if (!(await isTaken(candidate))) return candidate
  }

  // Last resort: timestamp suffix (always unique enough for practice)
  return `${base}-${Date.now().toString(36)}`
}
