-- Add admin role enum for RBAC
DO $$
BEGIN
  CREATE TYPE "AdminRole" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'EDITOR', 'SUPPORT', 'VIEWER');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;

-- Add role column to admin users
ALTER TABLE "admin_users"
ADD COLUMN IF NOT EXISTS "role" "AdminRole" NOT NULL DEFAULT 'ADMIN';

-- Admin audit logs table
CREATE TABLE IF NOT EXISTS "admin_audit_logs" (
  "id" TEXT NOT NULL,
  "adminUserId" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "entityType" TEXT NOT NULL,
  "entityId" TEXT,
  "metadata" JSONB,
  "ipAddress" TEXT,
  "userAgent" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "admin_audit_logs_pkey" PRIMARY KEY ("id")
);

-- Foreign key for audit log actor
DO $$
BEGIN
  ALTER TABLE "admin_audit_logs"
    ADD CONSTRAINT "admin_audit_logs_adminUserId_fkey"
    FOREIGN KEY ("adminUserId") REFERENCES "admin_users"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;

CREATE INDEX IF NOT EXISTS "admin_audit_logs_adminUserId_createdAt_idx"
  ON "admin_audit_logs"("adminUserId", "createdAt");

CREATE INDEX IF NOT EXISTS "admin_audit_logs_entityType_entityId_idx"
  ON "admin_audit_logs"("entityType", "entityId");
