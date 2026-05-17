ALTER TABLE "users"
ADD COLUMN IF NOT EXISTS "emailVerifiedAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "emailVerificationToken" TEXT,
ADD COLUMN IF NOT EXISTS "emailVerificationTokenExpiry" TIMESTAMP(3);

CREATE UNIQUE INDEX IF NOT EXISTS "users_emailVerificationToken_key"
ON "users"("emailVerificationToken");

UPDATE "users"
SET "emailVerifiedAt" = COALESCE("emailVerifiedAt", "createdAt", CURRENT_TIMESTAMP)
WHERE "emailVerifiedAt" IS NULL;
