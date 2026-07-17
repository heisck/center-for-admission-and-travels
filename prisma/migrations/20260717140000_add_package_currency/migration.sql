-- Add per-package currency for multi-currency Paystack checkout (GHS, USD, EUR, GBP)
ALTER TABLE "packages" ADD COLUMN IF NOT EXISTS "currency" TEXT NOT NULL DEFAULT 'GHS';
ALTER TABLE "travel_tours_featured_packages" ADD COLUMN IF NOT EXISTS "currency" TEXT NOT NULL DEFAULT 'GHS';
