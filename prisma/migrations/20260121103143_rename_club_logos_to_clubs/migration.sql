/*
  Warnings:

  - You are about to drop the `club_logos` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropIndex
DROP INDEX "idx_club_name";

-- DropIndex
DROP INDEX "club_logos_club_name_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "club_logos";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "clubs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "club_name" TEXT NOT NULL,
    "logo_url" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_career_clubs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "season_id" TEXT NOT NULL,
    "club_id" TEXT,
    "division_id" TEXT NOT NULL,
    "club_name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "start_month" INTEGER,
    "end_month" INTEGER,
    "is_captain" INTEGER NOT NULL DEFAULT 0,
    "is_promoted" INTEGER NOT NULL DEFAULT 0,
    "is_champion" INTEGER NOT NULL DEFAULT 0,
    "is_cup_winner" INTEGER NOT NULL DEFAULT 0,
    "matches_played" INTEGER NOT NULL,
    "goals" INTEGER,
    "assists" INTEGER,
    "avg_playtime_minutes" INTEGER,
    "clean_sheets" INTEGER,
    CONSTRAINT "career_clubs_season_id_fkey" FOREIGN KEY ("season_id") REFERENCES "career_seasons" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "career_clubs_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "clubs" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "career_clubs_division_id_fkey" FOREIGN KEY ("division_id") REFERENCES "divisions" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_career_clubs" ("assists", "avg_playtime_minutes", "category", "clean_sheets", "club_id", "club_name", "division_id", "end_month", "goals", "id", "is_captain", "is_champion", "is_cup_winner", "is_promoted", "matches_played", "season_id", "start_month") SELECT "assists", "avg_playtime_minutes", "category", "clean_sheets", "club_id", "club_name", "division_id", "end_month", "goals", "id", "is_captain", "is_champion", "is_cup_winner", "is_promoted", "matches_played", "season_id", "start_month" FROM "career_clubs";
DROP TABLE "career_clubs";
ALTER TABLE "new_career_clubs" RENAME TO "career_clubs";
CREATE TABLE "new_club_interests" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "resume_id" TEXT NOT NULL,
    "club_id" TEXT,
    "club_name" TEXT NOT NULL,
    "year" TEXT NOT NULL,
    "display_order" INTEGER NOT NULL,
    CONSTRAINT "club_interests_resume_id_fkey" FOREIGN KEY ("resume_id") REFERENCES "resumes" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "club_interests_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "clubs" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_club_interests" ("club_id", "club_name", "display_order", "id", "resume_id", "year") SELECT "club_id", "club_name", "display_order", "id", "resume_id", "year" FROM "club_interests";
DROP TABLE "club_interests";
ALTER TABLE "new_club_interests" RENAME TO "club_interests";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "clubs_club_name_key" ON "clubs"("club_name");

-- CreateIndex
CREATE INDEX "idx_club_name" ON "clubs"("club_name");
