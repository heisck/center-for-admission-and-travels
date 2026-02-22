import { prisma } from './prisma'

export async function getLegalPage(slug: string) {
  return prisma.legalPage.findUnique({
    where: { slug },
  })
}
