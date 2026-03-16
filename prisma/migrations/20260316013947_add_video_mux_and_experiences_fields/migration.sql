/*
  Warnings:

  - You are about to drop the column `avatar_varcharurl` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "avatar_varcharurl",
ADD COLUMN     "avatar_url" TEXT;

-- AlterTable
ALTER TABLE "video_assets" ADD COLUMN     "category" VARCHAR(100),
ADD COLUMN     "city" VARCHAR(100),
ADD COLUMN     "country" VARCHAR(100),
ADD COLUMN     "mux_asset_id" VARCHAR(255),
ADD COLUMN     "mux_playback_id" VARCHAR(255),
ADD COLUMN     "place" VARCHAR(255),
ADD COLUMN     "thumbnail_url" TEXT,
ADD COLUMN     "view_count" INTEGER NOT NULL DEFAULT 0;
