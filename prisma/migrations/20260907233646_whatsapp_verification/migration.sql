-- AlterTable
ALTER TABLE "User" ADD COLUMN "whatsappPendingNumber" TEXT;
ALTER TABLE "User" ADD COLUMN "whatsappVerifyCode" TEXT;
ALTER TABLE "User" ADD COLUMN "whatsappVerifyExpires" DATETIME;
