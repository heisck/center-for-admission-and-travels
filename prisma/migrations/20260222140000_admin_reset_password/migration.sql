-- AlterTable
ALTER TABLE "admin_users" ADD COLUMN "resetToken" TEXT;
ALTER TABLE "admin_users" ADD COLUMN "resetTokenExpiry" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "admin_users_resetToken_key" ON "admin_users"("resetToken");
