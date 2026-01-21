/*
  Warnings:

  - You are about to drop the `qualities` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `qualities` to the `player_profiles` table without a default value. This is not possible if the table is not empty.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "qualities";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_player_profiles" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "resume_id" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "birth_date" TEXT NOT NULL,
    "nationalities" TEXT NOT NULL,
    "strong_foot" TEXT NOT NULL,
    "height_cm" INTEGER NOT NULL,
    "weight_kg" INTEGER NOT NULL,
    "main_position" TEXT NOT NULL,
    "positions" TEXT NOT NULL,
    "qualities" TEXT NOT NULL,
    "vma" REAL,
    "wingspan_cm" INTEGER,
    "stats_url" TEXT,
    "video_url" TEXT,
    "photo_path" TEXT NOT NULL,
    "is_international" INTEGER NOT NULL DEFAULT 0,
    "international_country" TEXT,
    "international_division" TEXT,
    CONSTRAINT "player_profiles_resume_id_fkey" FOREIGN KEY ("resume_id") REFERENCES "resumes" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_player_profiles" ("birth_date", "first_name", "height_cm", "id", "international_country", "international_division", "is_international", "last_name", "main_position", "nationalities", "photo_path", "positions", "resume_id", "stats_url", "strong_foot", "video_url", "vma", "weight_kg", "wingspan_cm") SELECT "birth_date", "first_name", "height_cm", "id", "international_country", "international_division", "is_international", "last_name", "main_position", "nationalities", "photo_path", "positions", "resume_id", "stats_url", "strong_foot", "video_url", "vma", "weight_kg", "wingspan_cm" FROM "player_profiles";
DROP TABLE "player_profiles";
ALTER TABLE "new_player_profiles" RENAME TO "player_profiles";
CREATE UNIQUE INDEX "player_profiles_resume_id_key" ON "player_profiles"("resume_id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
