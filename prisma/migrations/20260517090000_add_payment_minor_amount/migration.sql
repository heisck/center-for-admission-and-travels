ALTER TABLE "payments"
ADD COLUMN IF NOT EXISTS "amountMinor" INTEGER NOT NULL DEFAULT 0;

UPDATE "payments"
SET "amountMinor" = ROUND("amount" * 100)::INTEGER
WHERE "amountMinor" = 0;
