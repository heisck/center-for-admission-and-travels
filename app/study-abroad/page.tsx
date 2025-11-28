import ServicePageTemplate from "@/components/service-page-template"
import { services } from "@/data/services"

export default function StudyAbroad() {
  const service = services.find((s) => s.id === "study-abroad")

  if (!service) {
    return <div>Service not found</div>
  }

  return <ServicePageTemplate service={service} />
}
