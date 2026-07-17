/**
 * Collect every Cloudinary URL referenced by CMS content, then optionally
 * delete Cloudinary assets that are no longer referenced.
 */

import { prisma } from '@/lib/prisma'
import {
  deleteImages,
  extractPublicId,
  isCloudinaryConfigured,
  listCloudinaryImagesInFolder,
} from '@/lib/cloudinary'

function addUrl(set: Set<string>, value: string | null | undefined) {
  if (!value || typeof value !== 'string') return
  const trimmed = value.trim()
  if (!trimmed || !trimmed.includes('cloudinary.com')) return
  set.add(trimmed)
  const publicId = extractPublicId(trimmed)
  if (publicId) set.add(publicId)
}

/**
 * All Cloudinary URLs / public IDs still referenced in the database.
 */
export async function collectReferencedCloudinaryIds(): Promise<Set<string>> {
  const referenced = new Set<string>()

  const [
    packageImages,
    homeHeroImages,
    aboutPage,
    founders,
    teamMembers,
    travelGallery,
    travelFeatured,
    travelPage,
    servicePages,
    serviceCountries,
    blogPosts,
  ] = await Promise.all([
    prisma.packageImage.findMany({ select: { url: true } }),
    prisma.homeHeroImage.findMany({ select: { url: true } }),
    prisma.aboutPage.findFirst({ select: { heroImageUrl: true } }),
    prisma.aboutFounder.findMany({ select: { imageUrl: true } }),
    prisma.aboutTeamMember.findMany({ select: { imageUrl: true } }),
    prisma.travelToursGalleryImage.findMany({ select: { url: true } }),
    prisma.travelToursFeaturedPackage.findMany({ select: { imageUrl: true } }),
    prisma.travelToursPage.findFirst({ select: { heroImageUrl: true } }),
    prisma.servicePage.findMany({ select: { heroImageUrl: true } }),
    prisma.serviceCountry.findMany({ select: { imageUrl: true } }),
    prisma.blogPost.findMany({ select: { imageUrl: true } }),
  ])

  for (const row of packageImages) addUrl(referenced, row.url)
  for (const row of homeHeroImages) addUrl(referenced, row.url)
  if (aboutPage) addUrl(referenced, aboutPage.heroImageUrl)
  for (const row of founders) addUrl(referenced, row.imageUrl)
  for (const row of teamMembers) addUrl(referenced, row.imageUrl)
  for (const row of travelGallery) addUrl(referenced, row.url)
  for (const row of travelFeatured) addUrl(referenced, row.imageUrl)
  if (travelPage) addUrl(referenced, travelPage.heroImageUrl)
  for (const row of servicePages) addUrl(referenced, row.heroImageUrl)
  for (const row of serviceCountries) addUrl(referenced, row.imageUrl)
  for (const row of blogPosts) addUrl(referenced, row.imageUrl)

  return referenced
}

export type OrphanCleanupResult = {
  configured: boolean
  scanned: number
  referenced: number
  orphans: Array<{ publicId: string; secureUrl: string }>
  deleted: string[]
  failed: string[]
  dryRun: boolean
}

/**
 * Find (and optionally delete) Cloudinary images in our folder that are not
 * referenced by any CMS content.
 */
export async function cleanupOrphanCloudinaryImages(options?: {
  dryRun?: boolean
  folder?: string
}): Promise<OrphanCleanupResult> {
  const dryRun = options?.dryRun !== false // default true for safety
  const folder = options?.folder || 'center-for-admission-and-travels'

  if (!isCloudinaryConfigured()) {
    return {
      configured: false,
      scanned: 0,
      referenced: 0,
      orphans: [],
      deleted: [],
      failed: [],
      dryRun,
    }
  }

  const [assets, referenced] = await Promise.all([
    listCloudinaryImagesInFolder(folder),
    collectReferencedCloudinaryIds(),
  ])

  const confirmedOrphans = assets.filter((asset) => !referenced.has(asset.publicId))

  const deleted: string[] = []
  const failed: string[] = []

  if (!dryRun && confirmedOrphans.length > 0) {
    const results = await deleteImages(confirmedOrphans.map((o) => o.publicId))
    confirmedOrphans.forEach((orphan, i) => {
      if (results[i]) deleted.push(orphan.publicId)
      else failed.push(orphan.publicId)
    })
  }

  return {
    configured: true,
    scanned: assets.length,
    referenced: referenced.size,
    orphans: confirmedOrphans,
    deleted,
    failed,
    dryRun,
  }
}
