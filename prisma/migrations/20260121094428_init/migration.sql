-- CreateTable
CREATE TABLE "resumes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "is_treated" INTEGER NOT NULL DEFAULT 0,
    "color" TEXT NOT NULL,
    "formation_system" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "player_profiles" (
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

-- CreateTable
CREATE TABLE "contacts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "resume_id" TEXT NOT NULL,
    "player_email" TEXT NOT NULL,
    "player_phone" TEXT NOT NULL,
    "agent_email" TEXT,
    "agent_phone" TEXT,
    CONSTRAINT "contacts_resume_id_fkey" FOREIGN KEY ("resume_id") REFERENCES "resumes" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "qualities" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "resume_id" TEXT NOT NULL,
    "quality_text" TEXT NOT NULL,
    "display_order" INTEGER NOT NULL,
    CONSTRAINT "qualities_resume_id_fkey" FOREIGN KEY ("resume_id") REFERENCES "resumes" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "career_seasons" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "resume_id" TEXT NOT NULL,
    "start_year" INTEGER NOT NULL,
    "end_year" INTEGER NOT NULL,
    "display_order" INTEGER NOT NULL,
    CONSTRAINT "career_seasons_resume_id_fkey" FOREIGN KEY ("resume_id") REFERENCES "resumes" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "club_logos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "club_name" TEXT NOT NULL,
    "logo_url" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "divisions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "division_name" TEXT NOT NULL,
    "logo_url" TEXT,
    "is_official" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "career_clubs" (
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
    CONSTRAINT "career_clubs_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "club_logos" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "career_clubs_division_id_fkey" FOREIGN KEY ("division_id") REFERENCES "divisions" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "training_entries" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "resume_id" TEXT NOT NULL,
    "start_year" INTEGER NOT NULL,
    "end_year" INTEGER,
    "location" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "details" TEXT,
    "display_order" INTEGER NOT NULL,
    CONSTRAINT "training_entries_resume_id_fkey" FOREIGN KEY ("resume_id") REFERENCES "resumes" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "club_interests" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "resume_id" TEXT NOT NULL,
    "club_id" TEXT,
    "club_name" TEXT NOT NULL,
    "year" TEXT NOT NULL,
    "display_order" INTEGER NOT NULL,
    CONSTRAINT "club_interests_resume_id_fkey" FOREIGN KEY ("resume_id") REFERENCES "resumes" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "club_interests_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "club_logos" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "player_profiles_resume_id_key" ON "player_profiles"("resume_id");

-- CreateIndex
CREATE UNIQUE INDEX "contacts_resume_id_key" ON "contacts"("resume_id");

-- CreateIndex
CREATE UNIQUE INDEX "club_logos_club_name_key" ON "club_logos"("club_name");

-- CreateIndex
CREATE INDEX "idx_club_name" ON "club_logos"("club_name");

-- CreateIndex
CREATE INDEX "idx_division_name" ON "divisions"("division_name");
