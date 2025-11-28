import ServicePageTemplate from "@/components/service-page-template"
import { services } from "@/data/services"

export default function GlobalNetwork() {
  const service = services.find((s) => s.id === "global-network")

  if (!service) {
    return <div>Service not found</div>
  }

  return <ServicePageTemplate service={service} />
}
