-- CreateTable
CREATE TABLE "about_success_stories" (
    "id" TEXT NOT NULL,
    "aboutPageId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "program" TEXT NOT NULL,
    "quote" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "about_success_stories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "about_success_stories_aboutPageId_idx" ON "about_success_stories"("aboutPageId");

-- AddForeignKey
ALTER TABLE "about_success_stories" ADD CONSTRAINT "about_success_stories_aboutPageId_fkey" FOREIGN KEY ("aboutPageId") REFERENCES "about_page"("id") ON DELETE CASCADE ON UPDATE CASCADE;
