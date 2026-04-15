-- CreateEnum
CREATE TYPE "moderation_status" AS ENUM ('PENDING', 'PROCESSING', 'APPROVED', 'REJECTED', 'TAKEDOWN');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "is_admin" BOOLEAN DEFAULT false;

-- AlterTable
ALTER TABLE "video_assets" ADD COLUMN     "moderation_note" TEXT,
ADD COLUMN     "moderation_status" "moderation_status" NOT NULL DEFAULT 'PENDING';

-- CreateTable
CREATE TABLE "moderation_reports" (
    "id" SERIAL NOT NULL,
    "video_id" INTEGER NOT NULL,
    "reporter_id" INTEGER NOT NULL,
    "reason" VARCHAR(100) NOT NULL,
    "details" TEXT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "moderation_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "moderation_actions" (
    "id" SERIAL NOT NULL,
    "video_id" INTEGER NOT NULL,
    "moderator_id" INTEGER NOT NULL,
    "action" "moderation_status" NOT NULL,
    "note" TEXT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "moderation_actions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_moderation_reports_video" ON "moderation_reports"("video_id");

-- CreateIndex
CREATE INDEX "idx_moderation_actions_video" ON "moderation_actions"("video_id");

-- CreateIndex
CREATE INDEX "idx_video_assets_moderation_status" ON "video_assets"("moderation_status");

-- AddForeignKey
ALTER TABLE "moderation_reports" ADD CONSTRAINT "moderation_reports_video_id_fkey" FOREIGN KEY ("video_id") REFERENCES "video_assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "moderation_reports" ADD CONSTRAINT "moderation_reports_reporter_id_fkey" FOREIGN KEY ("reporter_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "moderation_actions" ADD CONSTRAINT "moderation_actions_video_id_fkey" FOREIGN KEY ("video_id") REFERENCES "video_assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "moderation_actions" ADD CONSTRAINT "moderation_actions_moderator_id_fkey" FOREIGN KEY ("moderator_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
