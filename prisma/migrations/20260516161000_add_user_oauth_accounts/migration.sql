CREATE TABLE IF NOT EXISTS "user_oauth_accounts" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "providerAccountId" TEXT NOT NULL,
  "email" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "user_oauth_accounts_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "user_oauth_accounts_provider_providerAccountId_key"
ON "user_oauth_accounts"("provider", "providerAccountId");

CREATE INDEX IF NOT EXISTS "user_oauth_accounts_userId_idx"
ON "user_oauth_accounts"("userId");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'user_oauth_accounts_userId_fkey'
  ) THEN
    ALTER TABLE "user_oauth_accounts"
    ADD CONSTRAINT "user_oauth_accounts_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
