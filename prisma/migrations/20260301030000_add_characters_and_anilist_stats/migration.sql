-- CreateEnum
CREATE TYPE "CharacterRole" AS ENUM ('MAIN', 'SUPPORTING', 'BACKGROUND');

-- AlterTable: add anilist_stats to Manhwa
ALTER TABLE "Manhwa" ADD COLUMN "anilist_stats" JSONB;

-- AlterTable: add role_detail to ManhwaCreator
ALTER TABLE "ManhwaCreator" ADD COLUMN "role_detail" TEXT;

-- CreateTable: Character
CREATE TABLE "Character" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name_en" TEXT NOT NULL,
    "name_native" TEXT,
    "name_alt" TEXT[],
    "description" TEXT,
    "age" TEXT,
    "gender" TEXT,
    "image_url" TEXT,
    "anilist_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Character_pkey" PRIMARY KEY ("id")
);

-- CreateTable: ManhwaCharacter
CREATE TABLE "ManhwaCharacter" (
    "manhwa_id" TEXT NOT NULL,
    "character_id" TEXT NOT NULL,
    "role" "CharacterRole" NOT NULL,

    CONSTRAINT "ManhwaCharacter_pkey" PRIMARY KEY ("manhwa_id","character_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Character_slug_key" ON "Character"("slug");
CREATE UNIQUE INDEX "Character_anilist_id_key" ON "Character"("anilist_id");
CREATE INDEX "ManhwaCharacter_character_id_idx" ON "ManhwaCharacter"("character_id");

-- AddForeignKey
ALTER TABLE "ManhwaCharacter" ADD CONSTRAINT "ManhwaCharacter_manhwa_id_fkey" FOREIGN KEY ("manhwa_id") REFERENCES "Manhwa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ManhwaCharacter" ADD CONSTRAINT "ManhwaCharacter_character_id_fkey" FOREIGN KEY ("character_id") REFERENCES "Character"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- RLS
ALTER TABLE "Character" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ManhwaCharacter" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read" ON "Character" FOR SELECT USING (true);
CREATE POLICY "public_read" ON "ManhwaCharacter" FOR SELECT USING (true);
