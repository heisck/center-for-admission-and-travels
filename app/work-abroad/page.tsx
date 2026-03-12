import ServicePageTemplate from "@/components/service-page-template"
import { getServicePageByRoute, getSiteChromeContent } from "@/lib/public-content"

export const revalidate = 300

export default async function WorkAbroad() {
  const [service, chrome] = await Promise.all([
    getServicePageByRoute("/work-abroad"),
    getSiteChromeContent(),
  ])

  if (!service) {
    return null
  }

  return <ServicePageTemplate service={service} chrome={chrome} />
}
