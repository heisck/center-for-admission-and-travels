import { prisma } from './prisma'

export async function getLegalPage(slug: string) {
  try {
    return await prisma.legalPage.findUnique({
      where: { slug },
    })
  } catch (error) {
    console.error(`[Legal] Failed to load page "${slug}":`, error)
    return null
  }
}
