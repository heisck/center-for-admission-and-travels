import ServicePageTemplate from "@/components/service-page-template"
import { getServicePageByRoute, getSiteChromeContent } from "@/lib/public-content"

export const revalidate = 300

export default async function StudyAbroad() {
  const [service, chrome] = await Promise.all([
    getServicePageByRoute("/study-abroad"),
    getSiteChromeContent(),
  ])

  if (!service) {
    return null
  }

  return <ServicePageTemplate service={service} chrome={chrome} />
}
