-- Add optional coordinates for Google Maps deep-linking
ALTER TABLE "contact_info"
ADD COLUMN IF NOT EXISTS "mapLatitude" DOUBLE PRECISION;

ALTER TABLE "contact_info"
ADD COLUMN IF NOT EXISTS "mapLongitude" DOUBLE PRECISION;
