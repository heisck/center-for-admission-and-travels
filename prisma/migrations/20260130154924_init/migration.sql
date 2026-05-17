-- CreateEnum
CREATE TYPE "PackageCategory" AS ENUM ('travel', 'study', 'work');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('pending', 'processing', 'success', 'failed', 'cancelled');

-- CreateTable
CREATE TABLE "admin_users" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "email" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_versions" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "version" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,

    CONSTRAINT "content_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "home_page" (
    "id" TEXT NOT NULL,
    "heroTitle" TEXT NOT NULL,
    "heroSubtitle" TEXT,
    "heroDescription" TEXT NOT NULL DEFAULT '',
    "heroCta1Text" TEXT NOT NULL,
    "heroCta2Text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "home_page_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "home_hero_images" (
    "id" TEXT NOT NULL,
    "homePageId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "alt" TEXT DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "home_hero_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "home_stats" (
    "id" TEXT NOT NULL,
    "homePageId" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "home_stats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "home_services" (
    "id" TEXT NOT NULL,
    "homePageId" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "home_services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "about_page" (
    "id" TEXT NOT NULL,
    "heroTitle" TEXT NOT NULL,
    "heroSubtitle" TEXT NOT NULL,
    "heroImageUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "about_page_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "about_mission" (
    "id" TEXT NOT NULL,
    "aboutPageId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "about_mission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "about_mission_points" (
    "id" TEXT NOT NULL,
    "missionId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "about_mission_points_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "about_vision" (
    "id" TEXT NOT NULL,
    "aboutPageId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "about_vision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "about_vision_points" (
    "id" TEXT NOT NULL,
    "visionId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "about_vision_points_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "about_core_values" (
    "id" TEXT NOT NULL,
    "aboutPageId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "about_core_values_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "about_founder" (
    "id" TEXT NOT NULL,
    "aboutPageId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "vision" TEXT NOT NULL,
    "mission" TEXT NOT NULL,
    "values" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "about_founder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "about_team_members" (
    "id" TEXT NOT NULL,
    "aboutPageId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "about_team_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "packages" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "PackageCategory" NOT NULL,
    "description" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "itinerary" TEXT NOT NULL DEFAULT '',
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "packages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "package_highlights" (
    "id" TEXT NOT NULL,
    "packageId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "package_highlights_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "package_images" (
    "id" TEXT NOT NULL,
    "packageId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "alt" TEXT DEFAULT '',
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "package_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "package_included" (
    "id" TEXT NOT NULL,
    "packageId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "package_included_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "package_not_included" (
    "id" TEXT NOT NULL,
    "packageId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "package_not_included_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "travel_tours_page" (
    "id" TEXT NOT NULL,
    "heroTitle" TEXT NOT NULL,
    "heroDescription" TEXT NOT NULL,
    "heroParagraph" TEXT NOT NULL,
    "heroImageUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "travel_tours_page_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "travel_tours_featured_packages" (
    "id" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "travel_tours_featured_packages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "travel_tours_highlights" (
    "id" TEXT NOT NULL,
    "packageId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "travel_tours_highlights_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_pages" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "route" TEXT NOT NULL,
    "heroImageUrl" TEXT NOT NULL,
    "bannerTitle" TEXT NOT NULL,
    "bannerSubtitle" TEXT NOT NULL,
    "overview" TEXT,
    "visaGuidance" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_pages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_why_study_sections" (
    "id" TEXT NOT NULL,
    "servicePageId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_why_study_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_why_study_highlights" (
    "id" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "service_why_study_highlights_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_benefits" (
    "id" TEXT NOT NULL,
    "servicePageId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "service_benefits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_requirements" (
    "id" TEXT NOT NULL,
    "servicePageId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "service_requirements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_countries" (
    "id" TEXT NOT NULL,
    "servicePageId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_countries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_success_stories" (
    "id" TEXT NOT NULL,
    "servicePageId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "program" TEXT NOT NULL,
    "quote" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_success_stories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_scholarships" (
    "id" TEXT NOT NULL,
    "servicePageId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "amount" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_scholarships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact_info" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "whatsappNumber" TEXT NOT NULL,
    "addressStreet" TEXT NOT NULL,
    "addressCity" TEXT NOT NULL,
    "addressRegion" TEXT NOT NULL,
    "addressCountry" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contact_info_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "footer_info" (
    "id" TEXT NOT NULL,
    "companyDescription" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "footer_info_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "footer_social_links" (
    "id" TEXT NOT NULL,
    "footerInfoId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "footer_social_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'GHS',
    "status" "PaymentStatus" NOT NULL,
    "paymentMethod" TEXT,
    "customerEmail" TEXT NOT NULL,
    "customerName" TEXT,
    "customerPhone" TEXT,
    "packageId" TEXT,
    "metadata" JSONB,
    "paystackData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admin_users_username_key" ON "admin_users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "admin_sessions_token_key" ON "admin_sessions"("token");

-- CreateIndex
CREATE INDEX "admin_sessions_token_idx" ON "admin_sessions"("token");

-- CreateIndex
CREATE INDEX "admin_sessions_userId_idx" ON "admin_sessions"("userId");

-- CreateIndex
CREATE INDEX "content_versions_entityType_entityId_idx" ON "content_versions"("entityType", "entityId");

-- CreateIndex
CREATE UNIQUE INDEX "content_versions_entityType_entityId_version_key" ON "content_versions"("entityType", "entityId", "version");

-- CreateIndex
CREATE INDEX "home_hero_images_homePageId_idx" ON "home_hero_images"("homePageId");

-- CreateIndex
CREATE INDEX "home_stats_homePageId_idx" ON "home_stats"("homePageId");

-- CreateIndex
CREATE INDEX "home_services_homePageId_idx" ON "home_services"("homePageId");

-- CreateIndex
CREATE UNIQUE INDEX "about_mission_aboutPageId_key" ON "about_mission"("aboutPageId");

-- CreateIndex
CREATE INDEX "about_mission_points_missionId_idx" ON "about_mission_points"("missionId");

-- CreateIndex
CREATE UNIQUE INDEX "about_vision_aboutPageId_key" ON "about_vision"("aboutPageId");

-- CreateIndex
CREATE INDEX "about_vision_points_visionId_idx" ON "about_vision_points"("visionId");

-- CreateIndex
CREATE INDEX "about_core_values_aboutPageId_idx" ON "about_core_values"("aboutPageId");

-- CreateIndex
CREATE UNIQUE INDEX "about_founder_aboutPageId_key" ON "about_founder"("aboutPageId");

-- CreateIndex
CREATE INDEX "about_team_members_aboutPageId_idx" ON "about_team_members"("aboutPageId");

-- CreateIndex
CREATE INDEX "packages_category_idx" ON "packages"("category");

-- CreateIndex
CREATE INDEX "package_highlights_packageId_idx" ON "package_highlights"("packageId");

-- CreateIndex
CREATE INDEX "package_images_packageId_idx" ON "package_images"("packageId");

-- CreateIndex
CREATE INDEX "package_included_packageId_idx" ON "package_included"("packageId");

-- CreateIndex
CREATE INDEX "package_not_included_packageId_idx" ON "package_not_included"("packageId");

-- CreateIndex
CREATE INDEX "travel_tours_featured_packages_pageId_idx" ON "travel_tours_featured_packages"("pageId");

-- CreateIndex
CREATE INDEX "travel_tours_highlights_packageId_idx" ON "travel_tours_highlights"("packageId");

-- CreateIndex
CREATE UNIQUE INDEX "service_pages_serviceId_key" ON "service_pages"("serviceId");

-- CreateIndex
CREATE UNIQUE INDEX "service_why_study_sections_servicePageId_key" ON "service_why_study_sections"("servicePageId");

-- CreateIndex
CREATE INDEX "service_why_study_highlights_sectionId_idx" ON "service_why_study_highlights"("sectionId");

-- CreateIndex
CREATE INDEX "service_benefits_servicePageId_idx" ON "service_benefits"("servicePageId");

-- CreateIndex
CREATE INDEX "service_requirements_servicePageId_idx" ON "service_requirements"("servicePageId");

-- CreateIndex
CREATE INDEX "service_countries_servicePageId_idx" ON "service_countries"("servicePageId");

-- CreateIndex
CREATE INDEX "service_success_stories_servicePageId_idx" ON "service_success_stories"("servicePageId");

-- CreateIndex
CREATE INDEX "service_scholarships_servicePageId_idx" ON "service_scholarships"("servicePageId");

-- CreateIndex
CREATE INDEX "footer_social_links_footerInfoId_idx" ON "footer_social_links"("footerInfoId");

-- CreateIndex
CREATE UNIQUE INDEX "payments_reference_key" ON "payments"("reference");

-- CreateIndex
CREATE INDEX "payments_reference_idx" ON "payments"("reference");

-- CreateIndex
CREATE INDEX "payments_status_idx" ON "payments"("status");

-- CreateIndex
CREATE INDEX "payments_customerEmail_idx" ON "payments"("customerEmail");

-- AddForeignKey
ALTER TABLE "admin_sessions" ADD CONSTRAINT "admin_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "admin_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "home_hero_images" ADD CONSTRAINT "home_hero_images_homePageId_fkey" FOREIGN KEY ("homePageId") REFERENCES "home_page"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "home_stats" ADD CONSTRAINT "home_stats_homePageId_fkey" FOREIGN KEY ("homePageId") REFERENCES "home_page"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "home_services" ADD CONSTRAINT "home_services_homePageId_fkey" FOREIGN KEY ("homePageId") REFERENCES "home_page"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "about_mission" ADD CONSTRAINT "about_mission_aboutPageId_fkey" FOREIGN KEY ("aboutPageId") REFERENCES "about_page"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "about_mission_points" ADD CONSTRAINT "about_mission_points_missionId_fkey" FOREIGN KEY ("missionId") REFERENCES "about_mission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "about_vision" ADD CONSTRAINT "about_vision_aboutPageId_fkey" FOREIGN KEY ("aboutPageId") REFERENCES "about_page"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "about_vision_points" ADD CONSTRAINT "about_vision_points_visionId_fkey" FOREIGN KEY ("visionId") REFERENCES "about_vision"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "about_core_values" ADD CONSTRAINT "about_core_values_aboutPageId_fkey" FOREIGN KEY ("aboutPageId") REFERENCES "about_page"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "about_founder" ADD CONSTRAINT "about_founder_aboutPageId_fkey" FOREIGN KEY ("aboutPageId") REFERENCES "about_page"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "about_team_members" ADD CONSTRAINT "about_team_members_aboutPageId_fkey" FOREIGN KEY ("aboutPageId") REFERENCES "about_page"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "package_highlights" ADD CONSTRAINT "package_highlights_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "packages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "package_images" ADD CONSTRAINT "package_images_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "packages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "package_included" ADD CONSTRAINT "package_included_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "packages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "package_not_included" ADD CONSTRAINT "package_not_included_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "packages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "travel_tours_featured_packages" ADD CONSTRAINT "travel_tours_featured_packages_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "travel_tours_page"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "travel_tours_highlights" ADD CONSTRAINT "travel_tours_highlights_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "travel_tours_featured_packages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_why_study_sections" ADD CONSTRAINT "service_why_study_sections_servicePageId_fkey" FOREIGN KEY ("servicePageId") REFERENCES "service_pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_why_study_highlights" ADD CONSTRAINT "service_why_study_highlights_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "service_why_study_sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_benefits" ADD CONSTRAINT "service_benefits_servicePageId_fkey" FOREIGN KEY ("servicePageId") REFERENCES "service_pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_requirements" ADD CONSTRAINT "service_requirements_servicePageId_fkey" FOREIGN KEY ("servicePageId") REFERENCES "service_pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_countries" ADD CONSTRAINT "service_countries_servicePageId_fkey" FOREIGN KEY ("servicePageId") REFERENCES "service_pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_success_stories" ADD CONSTRAINT "service_success_stories_servicePageId_fkey" FOREIGN KEY ("servicePageId") REFERENCES "service_pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_scholarships" ADD CONSTRAINT "service_scholarships_servicePageId_fkey" FOREIGN KEY ("servicePageId") REFERENCES "service_pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "footer_social_links" ADD CONSTRAINT "footer_social_links_footerInfoId_fkey" FOREIGN KEY ("footerInfoId") REFERENCES "footer_info"("id") ON DELETE CASCADE ON UPDATE CASCADE;
