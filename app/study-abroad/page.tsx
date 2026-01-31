"use client"

import ServicePageTemplate from "@/components/service-page-template"
import { usePublicContent } from "@/context/public-content-context"

export default function StudyAbroad() {
  const { content, loading } = usePublicContent()

  if (loading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </main>
    )
  }

  const service = content?.servicePages?.find((s) => s.id === "study-abroad" || s.route === "/study-abroad")

  if (!service) {
    return <div>Service not found</div>
  }

  // Transform database service to component format
  const serviceData = {
    id: service.id,
    title: service.title,
    heroImage: service.heroImage,
    bannerTitle: service.bannerTitle,
    bannerSubtitle: service.bannerSubtitle,
    overview: service.overview,
    whyStudyOutsideThisCountry: service.whyStudyOutsideThisCountry,
    benefits: service.benefits || [],
    requirements: service.requirements || [],
    countries: service.countries || [],
    visaGuidance: service.visaGuidance || '',
    successStories: service.successStories || [],
    scholarships: service.scholarships || [],
  }

  return <ServicePageTemplate service={serviceData} />
}
