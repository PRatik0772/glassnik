-- AlterTable
ALTER TABLE "users" ADD COLUMN     "has_uploaded_content" BOOLEAN DEFAULT false,
ADD COLUMN     "payout_connected" BOOLEAN DEFAULT false;
