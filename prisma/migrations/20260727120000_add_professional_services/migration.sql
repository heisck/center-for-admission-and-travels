CREATE TABLE "professional_services" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "summary" TEXT NOT NULL DEFAULT '',
    "descriptionHtml" TEXT NOT NULL DEFAULT '',
    "imageUrl" TEXT NOT NULL DEFAULT '',
    "published" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "professional_services_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "professional_service_plans" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "duration" TEXT NOT NULL DEFAULT '',
    "price" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'GHS',
    "published" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "professional_service_plans_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "professional_services_slug_key" ON "professional_services"("slug");
CREATE INDEX "professional_services_published_order_idx" ON "professional_services"("published", "order");
CREATE INDEX "professional_service_plans_serviceId_published_order_idx" ON "professional_service_plans"("serviceId", "published", "order");

ALTER TABLE "professional_service_plans"
ADD CONSTRAINT "professional_service_plans_serviceId_fkey"
FOREIGN KEY ("serviceId") REFERENCES "professional_services"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
