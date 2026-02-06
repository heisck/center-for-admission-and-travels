"use client"

import ServicePageTemplate from "@/components/service-page-template"
import { usePublicContent } from "@/context/public-content-context"

export default function WorkAbroad() {
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

  const service = content?.servicePages?.find((s) => s.id === "work-abroad" || s.route === "/work-abroad")

  if (!service) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Service Not Available</h1>
          <p className="text-muted-foreground mb-4">The work abroad page content is currently being loaded. Please try refreshing the page.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            Refresh Page
          </button>
        </div>
      </main>
    )
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
