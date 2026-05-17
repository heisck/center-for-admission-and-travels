-- CreateTable
CREATE TABLE IF NOT EXISTS "travel_tours_benefits" (
    "id" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "travel_tours_benefits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "travel_tours_gallery_images" (
    "id" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "alt" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "travel_tours_gallery_images_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "travel_tours_benefits_pageId_idx" ON "travel_tours_benefits"("pageId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "travel_tours_gallery_images_pageId_idx" ON "travel_tours_gallery_images"("pageId");

-- AddForeignKey
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'travel_tours_benefits_pageId_fkey'
    ) THEN
        ALTER TABLE "travel_tours_benefits" ADD CONSTRAINT "travel_tours_benefits_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "travel_tours_page"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'travel_tours_gallery_images_pageId_fkey'
    ) THEN
        ALTER TABLE "travel_tours_gallery_images" ADD CONSTRAINT "travel_tours_gallery_images_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "travel_tours_page"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
