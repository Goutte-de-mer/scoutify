-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_clubs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "club_name" TEXT NOT NULL,
    "logo_url" TEXT NOT NULL,
    "is_official" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
INSERT INTO "new_clubs" ("club_name", "created_at", "id", "logo_url", "updated_at") SELECT "club_name", "created_at", "id", "logo_url", "updated_at" FROM "clubs";
DROP TABLE "clubs";
ALTER TABLE "new_clubs" RENAME TO "clubs";
CREATE UNIQUE INDEX "clubs_club_name_key" ON "clubs"("club_name");
CREATE INDEX "idx_club_name" ON "clubs"("club_name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
