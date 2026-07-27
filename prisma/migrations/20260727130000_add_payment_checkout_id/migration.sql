-- Enforce checkout idempotency at the database layer.
ALTER TABLE "payments" ADD COLUMN "checkoutId" TEXT;

-- Preserve the newest legacy metadata idempotency key when present. Older
-- duplicates remain NULL so the unique index can be created safely.
WITH ranked AS (
  SELECT
    "id",
    "metadata"->>'checkoutId' AS checkout_id,
    ROW_NUMBER() OVER (
      PARTITION BY "metadata"->>'checkoutId'
      ORDER BY "createdAt" DESC
    ) AS row_number
  FROM "payments"
  WHERE
    "metadata"->>'checkoutId' IS NOT NULL
    AND LENGTH("metadata"->>'checkoutId') BETWEEN 16 AND 100
)
UPDATE "payments" AS payment
SET "checkoutId" = ranked.checkout_id
FROM ranked
WHERE payment."id" = ranked."id" AND ranked.row_number = 1;

CREATE UNIQUE INDEX "payments_checkoutId_key" ON "payments"("checkoutId");
