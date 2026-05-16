-- Add stable route column so admin can rename home service cards
-- without breaking the link target.
ALTER TABLE "home_services"
ADD COLUMN IF NOT EXISTS "route" TEXT;

-- Backfill existing rows from the known title→route mapping.
UPDATE "home_services" SET "route" = '/study-abroad'   WHERE "route" IS NULL AND lower("title") IN ('study abroad');
UPDATE "home_services" SET "route" = '/work-abroad'    WHERE "route" IS NULL AND lower("title") IN ('work abroad');
UPDATE "home_services" SET "route" = '/travel-tours'   WHERE "route" IS NULL AND lower("title") IN ('travel & tours', 'travel tours');
UPDATE "home_services" SET "route" = '/global-network' WHERE "route" IS NULL AND lower("title") IN ('global network');
