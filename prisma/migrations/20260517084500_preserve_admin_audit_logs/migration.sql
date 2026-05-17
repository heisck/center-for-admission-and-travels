ALTER TABLE "admin_audit_logs"
ALTER COLUMN "adminUserId" DROP NOT NULL;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'admin_audit_logs_adminUserId_fkey'
  ) THEN
    ALTER TABLE "admin_audit_logs"
    DROP CONSTRAINT "admin_audit_logs_adminUserId_fkey";
  END IF;
END $$;

ALTER TABLE "admin_audit_logs"
ADD CONSTRAINT "admin_audit_logs_adminUserId_fkey"
FOREIGN KEY ("adminUserId") REFERENCES "admin_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
