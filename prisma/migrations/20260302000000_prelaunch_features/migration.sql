-- CreateEnum
CREATE TYPE "KoreanReaction" AS ENUM ('HEOL', 'DAEBAK', 'GAMDONG', 'KINGBAT', 'MICHYEO', 'JUKGET');

-- CreateEnum
CREATE TYPE "ArticleCategory" AS ENUM ('NEWS', 'GUIDE', 'LIST', 'OPINION', 'ANALYSIS');

-- CreateEnum
CREATE TYPE "ArticleStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- AlterTable: reaction counters on Manhwa
ALTER TABLE "Manhwa"
  ADD COLUMN "reaction_heol"    INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "reaction_daebak"  INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "reaction_gamdong" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "reaction_kingbat" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "reaction_michyeo" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "reaction_jukget"  INTEGER NOT NULL DEFAULT 0;

-- CreateTable: ManhwaReaction
CREATE TABLE "ManhwaReaction" (
    "user_id"    TEXT NOT NULL,
    "manhwa_id"  TEXT NOT NULL,
    "reaction"   "KoreanReaction" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ManhwaReaction_pkey" PRIMARY KEY ("user_id","manhwa_id","reaction")
);

-- CreateIndex
CREATE INDEX "ManhwaReaction_manhwa_id_idx" ON "ManhwaReaction"("manhwa_id");

-- CreateTable: CharacterVote
CREATE TABLE "CharacterVote" (
    "id"           TEXT NOT NULL,
    "user_id"      TEXT NOT NULL,
    "manhwa_id"    TEXT NOT NULL,
    "character_id" TEXT NOT NULL,
    "created_at"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CharacterVote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CharacterVote_user_id_manhwa_id_key" ON "CharacterVote"("user_id", "manhwa_id");

-- CreateIndex
CREATE INDEX "CharacterVote_manhwa_id_character_id_idx" ON "CharacterVote"("manhwa_id", "character_id");

-- CreateTable: Poll
CREATE TABLE "Poll" (
    "id"          TEXT NOT NULL,
    "question_en" TEXT NOT NULL,
    "question_fr" TEXT,
    "manhwa_id"   TEXT,
    "is_active"   BOOLEAN NOT NULL DEFAULT true,
    "ends_at"     TIMESTAMP(3),
    "created_at"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Poll_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Poll_manhwa_id_is_active_idx" ON "Poll"("manhwa_id", "is_active");

-- CreateTable: PollOption
CREATE TABLE "PollOption" (
    "id"         TEXT NOT NULL,
    "poll_id"    TEXT NOT NULL,
    "label_en"   TEXT NOT NULL,
    "label_fr"   TEXT,
    "vote_count" INTEGER NOT NULL DEFAULT 0,
    "position"   INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "PollOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable: PollVote
CREATE TABLE "PollVote" (
    "user_id"    TEXT NOT NULL,
    "option_id"  TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PollVote_pkey" PRIMARY KEY ("user_id","option_id")
);

-- CreateTable: Article
CREATE TABLE "Article" (
    "id"              TEXT NOT NULL,
    "slug"            TEXT NOT NULL,
    "title_en"        TEXT NOT NULL,
    "title_fr"        TEXT,
    "content_en"      TEXT NOT NULL,
    "content_fr"      TEXT,
    "excerpt_en"      VARCHAR(500),
    "excerpt_fr"      VARCHAR(500),
    "cover_image_url" TEXT,
    "category"        "ArticleCategory" NOT NULL,
    "status"          "ArticleStatus" NOT NULL DEFAULT 'DRAFT',
    "author_name"     TEXT NOT NULL,
    "reading_time"    INTEGER,
    "view_count"      INTEGER NOT NULL DEFAULT 0,
    "published_at"    TIMESTAMP(3),
    "created_at"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"      TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Article_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Article_slug_key" ON "Article"("slug");

-- CreateIndex
CREATE INDEX "Article_status_published_at_idx" ON "Article"("status", "published_at" DESC);

-- CreateIndex
CREATE INDEX "Article_category_status_idx" ON "Article"("category", "status");

-- CreateTable: ArticleManhwa
CREATE TABLE "ArticleManhwa" (
    "article_id" TEXT NOT NULL,
    "manhwa_id"  TEXT NOT NULL,

    CONSTRAINT "ArticleManhwa_pkey" PRIMARY KEY ("article_id","manhwa_id")
);

-- AddForeignKey
ALTER TABLE "ManhwaReaction" ADD CONSTRAINT "ManhwaReaction_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ManhwaReaction" ADD CONSTRAINT "ManhwaReaction_manhwa_id_fkey" FOREIGN KEY ("manhwa_id") REFERENCES "Manhwa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "CharacterVote" ADD CONSTRAINT "CharacterVote_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CharacterVote" ADD CONSTRAINT "CharacterVote_manhwa_id_fkey" FOREIGN KEY ("manhwa_id") REFERENCES "Manhwa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CharacterVote" ADD CONSTRAINT "CharacterVote_character_id_fkey" FOREIGN KEY ("character_id") REFERENCES "Character"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Poll" ADD CONSTRAINT "Poll_manhwa_id_fkey" FOREIGN KEY ("manhwa_id") REFERENCES "Manhwa"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "PollOption" ADD CONSTRAINT "PollOption_poll_id_fkey" FOREIGN KEY ("poll_id") REFERENCES "Poll"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "PollVote" ADD CONSTRAINT "PollVote_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PollVote" ADD CONSTRAINT "PollVote_option_id_fkey" FOREIGN KEY ("option_id") REFERENCES "PollOption"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Article" ADD CONSTRAINT "Article_pkey_check" CHECK (true);

ALTER TABLE "ArticleManhwa" ADD CONSTRAINT "ArticleManhwa_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ArticleManhwa" ADD CONSTRAINT "ArticleManhwa_manhwa_id_fkey" FOREIGN KEY ("manhwa_id") REFERENCES "Manhwa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
