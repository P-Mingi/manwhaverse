-- CreateEnum
CREATE TYPE "ContentType" AS ENUM ('MANHWA', 'MANHUA');

-- CreateEnum
CREATE TYPE "PublicationStatus" AS ENUM ('ONGOING', 'COMPLETED', 'HIATUS', 'CANCELLED');

-- CreateEnum
CREATE TYPE "RelationType" AS ENUM ('ADAPTATION', 'SOURCE', 'SEQUEL', 'PREQUEL', 'SIDE_STORY', 'ALTERNATIVE', 'LIGHT_NOVEL');

-- CreateEnum
CREATE TYPE "ExternalPlatform" AS ENUM ('MAL', 'ANILIST', 'KITSU');

-- CreateEnum
CREATE TYPE "CreatorRole" AS ENUM ('AUTHOR', 'ILLUSTRATOR', 'BOTH');

-- CreateEnum
CREATE TYPE "TropeCategory" AS ENUM ('PROTAGONIST_TYPE', 'NARRATIVE', 'SETTING', 'THEME', 'AMBIANCE');

-- CreateEnum
CREATE TYPE "ReadingStatus" AS ENUM ('READING', 'COMPLETED', 'ON_HOLD', 'DROPPED', 'PLAN_TO_READ', 'REREADING');

-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('ADDED_TO_LIBRARY', 'COMPLETED', 'RATED', 'REVIEWED', 'CREATED_LIST', 'STARTED_READING', 'FAVORITED');

-- CreateTable
CREATE TABLE "Manhwa" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title_en" TEXT NOT NULL,
    "title_kr" TEXT,
    "title_fr" TEXT,
    "title_alt" TEXT[],
    "synopsis_en" TEXT,
    "synopsis_fr" TEXT,
    "cover_url" TEXT,
    "cover_cf_id" TEXT,
    "banner_url" TEXT,
    "type" "ContentType" NOT NULL DEFAULT 'MANHWA',
    "status" "PublicationStatus" NOT NULL DEFAULT 'ONGOING',
    "chapter_count" INTEGER,
    "volume_count" INTEGER,
    "release_year" INTEGER,
    "end_year" INTEGER,
    "origin_country" TEXT NOT NULL DEFAULT 'KR',
    "demographic" TEXT,
    "score_avg" DOUBLE PRECISION,
    "score_stddev" DOUBLE PRECISION,
    "score_count" INTEGER NOT NULL DEFAULT 0,
    "review_count" INTEGER NOT NULL DEFAULT 0,
    "list_count" INTEGER NOT NULL DEFAULT 0,
    "reader_count" INTEGER NOT NULL DEFAULT 0,
    "favorite_count" INTEGER NOT NULL DEFAULT 0,
    "waitlist_count" INTEGER NOT NULL DEFAULT 0,
    "ext_score_mal" DOUBLE PRECISION,
    "ext_score_mal_count" INTEGER,
    "ext_score_anilist" DOUBLE PRECISION,
    "ext_score_anilist_count" INTEGER,
    "ext_score_kitsu" DOUBLE PRECISION,
    "ext_score_kitsu_count" INTEGER,
    "ext_scores_updated_at" TIMESTAMP(3),
    "ext_score_composite" DOUBLE PRECISION,
    "trending_score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "trending_fr" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "trending_en" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "anilist_id" INTEGER,
    "mal_id" INTEGER,
    "mangadex_id" TEXT,
    "kitsu_id" TEXT,
    "is_published" BOOLEAN NOT NULL DEFAULT true,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "data_source" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "Manhwa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Arc" (
    "id" TEXT NOT NULL,
    "manhwa_id" TEXT NOT NULL,
    "name_en" TEXT NOT NULL,
    "name_fr" TEXT,
    "chapter_start" INTEGER NOT NULL,
    "chapter_end" INTEGER,
    "position" INTEGER NOT NULL,
    "score_avg" DOUBLE PRECISION,
    "score_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Arc_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArcScore" (
    "id" TEXT NOT NULL,
    "arc_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ArcScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReadLink" (
    "id" TEXT NOT NULL,
    "manhwa_id" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "is_free" BOOLEAN NOT NULL DEFAULT false,
    "is_official" BOOLEAN NOT NULL DEFAULT true,
    "language" TEXT NOT NULL,
    "is_affiliate" BOOLEAN NOT NULL DEFAULT false,
    "affiliate_url" TEXT,

    CONSTRAINT "ReadLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SimilarManhwa" (
    "id" TEXT NOT NULL,
    "source_id" TEXT NOT NULL,
    "target_id" TEXT NOT NULL,
    "similarity" DOUBLE PRECISION NOT NULL,
    "reasons" TEXT[],
    "computed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SimilarManhwa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ManhwaRelation" (
    "id" TEXT NOT NULL,
    "source_id" TEXT NOT NULL,
    "target_id" TEXT NOT NULL,
    "relation_type" "RelationType" NOT NULL,

    CONSTRAINT "ManhwaRelation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScoreHistory" (
    "id" TEXT NOT NULL,
    "manhwa_id" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "reader_count" INTEGER NOT NULL,
    "recorded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScoreHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExternalScoreSnapshot" (
    "id" TEXT NOT NULL,
    "manhwa_id" TEXT NOT NULL,
    "platform" "ExternalPlatform" NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "score_raw" DOUBLE PRECISION NOT NULL,
    "vote_count" INTEGER,
    "recorded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExternalScoreSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Release" (
    "id" TEXT NOT NULL,
    "manhwa_id" TEXT NOT NULL,
    "chapter" INTEGER NOT NULL,
    "chapter_title" TEXT,
    "platform" TEXT NOT NULL,
    "url" TEXT,
    "released_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notifications_sent" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Release_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Creator" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "name_native" TEXT,
    "bio_en" TEXT,
    "bio_fr" TEXT,
    "avatar_url" TEXT,
    "nationality" TEXT,
    "birth_year" INTEGER,
    "avg_score" DOUBLE PRECISION,
    "total_readers" INTEGER NOT NULL DEFAULT 0,
    "follower_count" INTEGER NOT NULL DEFAULT 0,
    "anilist_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Creator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ManhwaCreator" (
    "manhwa_id" TEXT NOT NULL,
    "creator_id" TEXT NOT NULL,
    "role" "CreatorRole" NOT NULL,

    CONSTRAINT "ManhwaCreator_pkey" PRIMARY KEY ("manhwa_id","creator_id","role")
);

-- CreateTable
CREATE TABLE "CreatorFollow" (
    "user_id" TEXT NOT NULL,
    "creator_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CreatorFollow_pkey" PRIMARY KEY ("user_id","creator_id")
);

-- CreateTable
CREATE TABLE "Genre" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name_en" TEXT NOT NULL,
    "name_fr" TEXT NOT NULL,
    "description_en" TEXT,
    "description_fr" TEXT,
    "color" TEXT,
    "manhwa_count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Genre_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ManhwaGenre" (
    "manhwa_id" TEXT NOT NULL,
    "genre_id" TEXT NOT NULL,

    CONSTRAINT "ManhwaGenre_pkey" PRIMARY KEY ("manhwa_id","genre_id")
);

-- CreateTable
CREATE TABLE "Trope" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description_en" TEXT,
    "description_fr" TEXT,
    "category" "TropeCategory" NOT NULL,
    "manhwa_count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Trope_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ManhwaTrope" (
    "manhwa_id" TEXT NOT NULL,
    "trope_id" TEXT NOT NULL,
    "upvotes" INTEGER NOT NULL DEFAULT 0,
    "downvotes" INTEGER NOT NULL DEFAULT 0,
    "added_by" TEXT,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ManhwaTrope_pkey" PRIMARY KEY ("manhwa_id","trope_id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "display_name" TEXT,
    "avatar_url" TEXT,
    "bio" VARCHAR(300),
    "locale" TEXT NOT NULL DEFAULT 'en',
    "reading_pace" DOUBLE PRECISION,
    "notif_new_chapter" BOOLEAN NOT NULL DEFAULT true,
    "notif_review_liked" BOOLEAN NOT NULL DEFAULT true,
    "notif_new_follower" BOOLEAN NOT NULL DEFAULT true,
    "notif_weekly_digest" BOOLEAN NOT NULL DEFAULT true,
    "notif_email" BOOLEAN NOT NULL DEFAULT true,
    "reader_class" TEXT,
    "influence_score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "reading_streak" INTEGER NOT NULL DEFAULT 0,
    "longest_streak" INTEGER NOT NULL DEFAULT 0,
    "last_read_at" TIMESTAMP(3),
    "total_chapters_read" INTEGER NOT NULL DEFAULT 0,
    "total_manhwas_completed" INTEGER NOT NULL DEFAULT 0,
    "is_premium" BOOLEAN NOT NULL DEFAULT false,
    "premium_until" TIMESTAMP(3),
    "is_banned" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserLibrary" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "manhwa_id" TEXT NOT NULL,
    "status" "ReadingStatus" NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "score" DOUBLE PRECISION,
    "score_private" DOUBLE PRECISION,
    "is_favorite" BOOLEAN NOT NULL DEFAULT false,
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "private_tags" TEXT[],
    "reread_count" INTEGER NOT NULL DEFAULT 0,
    "reread_score" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserLibrary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JournalEntry" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "manhwa_id" TEXT NOT NULL,
    "chapter" INTEGER,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JournalEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Waitlist" (
    "user_id" TEXT NOT NULL,
    "manhwa_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notified_at" TIMESTAMP(3),

    CONSTRAINT "Waitlist_pkey" PRIMARY KEY ("user_id","manhwa_id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "manhwa_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "score" DOUBLE PRECISION,
    "is_micro" BOOLEAN NOT NULL DEFAULT false,
    "has_spoilers" BOOLEAN NOT NULL DEFAULT false,
    "score_story" DOUBLE PRECISION,
    "score_art" DOUBLE PRECISION,
    "score_characters" DOUBLE PRECISION,
    "score_world" DOUBLE PRECISION,
    "audience_tag" TEXT,
    "likes_count" INTEGER NOT NULL DEFAULT 0,
    "imported_from" TEXT,
    "import_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReviewLike" (
    "user_id" TEXT NOT NULL,
    "review_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReviewLike_pkey" PRIMARY KEY ("user_id","review_id")
);

-- CreateTable
CREATE TABLE "Quote" (
    "id" TEXT NOT NULL,
    "manhwa_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "content" VARCHAR(500) NOT NULL,
    "chapter" INTEGER,
    "character" TEXT,
    "votes" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "Quote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuoteVote" (
    "user_id" TEXT NOT NULL,
    "quote_id" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuoteVote_pkey" PRIMARY KEY ("user_id","quote_id")
);

-- CreateTable
CREATE TABLE "TropeVote" (
    "user_id" TEXT NOT NULL,
    "manhwa_id" TEXT NOT NULL,
    "trope_id" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TropeVote_pkey" PRIMARY KEY ("user_id","manhwa_id","trope_id")
);

-- CreateTable
CREATE TABLE "ManhwaList" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "is_public" BOOLEAN NOT NULL DEFAULT true,
    "is_collab" BOOLEAN NOT NULL DEFAULT false,
    "og_title" TEXT,
    "likes_count" INTEGER NOT NULL DEFAULT 0,
    "item_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ManhwaList_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ListItem" (
    "id" TEXT NOT NULL,
    "list_id" TEXT NOT NULL,
    "manhwa_id" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "note" VARCHAR(500),
    "added_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ListItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ListVote" (
    "user_id" TEXT NOT NULL,
    "list_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ListVote_pkey" PRIMARY KEY ("user_id","list_id")
);

-- CreateTable
CREATE TABLE "Follow" (
    "follower_id" TEXT NOT NULL,
    "following_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Follow_pkey" PRIMARY KEY ("follower_id","following_id")
);

-- CreateTable
CREATE TABLE "Activity" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" "ActivityType" NOT NULL,
    "manhwa_id" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReadingRoom" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "manhwa_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "is_public" BOOLEAN NOT NULL DEFAULT true,
    "max_members" INTEGER NOT NULL DEFAULT 20,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReadingRoom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoomMember" (
    "room_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RoomMember_pkey" PRIMARY KEY ("room_id","user_id")
);

-- CreateTable
CREATE TABLE "RoomMessage" (
    "id" TEXT NOT NULL,
    "room_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "content" VARCHAR(1000) NOT NULL,
    "chapter_ref" INTEGER,
    "reaction" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RoomMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Achievement" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name_en" TEXT NOT NULL,
    "name_fr" TEXT NOT NULL,
    "description_en" TEXT NOT NULL,
    "description_fr" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "category" TEXT NOT NULL,

    CONSTRAINT "Achievement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserAchievement" (
    "user_id" TEXT NOT NULL,
    "achievement_id" TEXT NOT NULL,
    "unlocked_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserAchievement_pkey" PRIMARY KEY ("user_id","achievement_id")
);

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "reporter_id" TEXT NOT NULL,
    "content_type" TEXT NOT NULL,
    "content_id" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved_at" TIMESTAMP(3),
    "resolved_by" TEXT,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModerationLog" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "target_id" TEXT NOT NULL,
    "target_type" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ModerationLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SocialPostQueue" (
    "id" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "image_url" TEXT,
    "manhwa_id" TEXT,
    "scheduled_at" TIMESTAMP(3),
    "posted_at" TIMESTAMP(3),
    "post_url" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "error" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SocialPostQueue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SyncLog" (
    "id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "items_synced" INTEGER NOT NULL DEFAULT 0,
    "items_new" INTEGER NOT NULL DEFAULT 0,
    "items_updated" INTEGER NOT NULL DEFAULT 0,
    "errors" INTEGER NOT NULL DEFAULT 0,
    "duration_ms" INTEGER,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),
    "error_log" TEXT,

    CONSTRAINT "SyncLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Manhwa_slug_key" ON "Manhwa"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Manhwa_anilist_id_key" ON "Manhwa"("anilist_id");

-- CreateIndex
CREATE UNIQUE INDEX "Manhwa_mal_id_key" ON "Manhwa"("mal_id");

-- CreateIndex
CREATE UNIQUE INDEX "Manhwa_mangadex_id_key" ON "Manhwa"("mangadex_id");

-- CreateIndex
CREATE UNIQUE INDEX "Manhwa_kitsu_id_key" ON "Manhwa"("kitsu_id");

-- CreateIndex
CREATE INDEX "Manhwa_slug_idx" ON "Manhwa"("slug");

-- CreateIndex
CREATE INDEX "Manhwa_type_status_idx" ON "Manhwa"("type", "status");

-- CreateIndex
CREATE INDEX "Manhwa_score_avg_idx" ON "Manhwa"("score_avg" DESC);

-- CreateIndex
CREATE INDEX "Manhwa_trending_score_idx" ON "Manhwa"("trending_score" DESC);

-- CreateIndex
CREATE INDEX "Manhwa_release_year_idx" ON "Manhwa"("release_year");

-- CreateIndex
CREATE INDEX "Arc_manhwa_id_position_idx" ON "Arc"("manhwa_id", "position");

-- CreateIndex
CREATE UNIQUE INDEX "ArcScore_arc_id_user_id_key" ON "ArcScore"("arc_id", "user_id");

-- CreateIndex
CREATE INDEX "SimilarManhwa_source_id_similarity_idx" ON "SimilarManhwa"("source_id", "similarity" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "SimilarManhwa_source_id_target_id_key" ON "SimilarManhwa"("source_id", "target_id");

-- CreateIndex
CREATE UNIQUE INDEX "ManhwaRelation_source_id_target_id_relation_type_key" ON "ManhwaRelation"("source_id", "target_id", "relation_type");

-- CreateIndex
CREATE INDEX "ScoreHistory_manhwa_id_recorded_at_idx" ON "ScoreHistory"("manhwa_id", "recorded_at");

-- CreateIndex
CREATE INDEX "ExternalScoreSnapshot_manhwa_id_platform_recorded_at_idx" ON "ExternalScoreSnapshot"("manhwa_id", "platform", "recorded_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "ExternalScoreSnapshot_manhwa_id_platform_recorded_at_key" ON "ExternalScoreSnapshot"("manhwa_id", "platform", "recorded_at");

-- CreateIndex
CREATE INDEX "Release_released_at_idx" ON "Release"("released_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "Release_manhwa_id_chapter_platform_key" ON "Release"("manhwa_id", "chapter", "platform");

-- CreateIndex
CREATE UNIQUE INDEX "Creator_slug_key" ON "Creator"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Genre_slug_key" ON "Genre"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Trope_slug_key" ON "Trope"("slug");

-- CreateIndex
CREATE INDEX "ManhwaTrope_manhwa_id_upvotes_idx" ON "ManhwaTrope"("manhwa_id", "upvotes" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE INDEX "UserLibrary_user_id_status_idx" ON "UserLibrary"("user_id", "status");

-- CreateIndex
CREATE INDEX "UserLibrary_user_id_updated_at_idx" ON "UserLibrary"("user_id", "updated_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "UserLibrary_user_id_manhwa_id_key" ON "UserLibrary"("user_id", "manhwa_id");

-- CreateIndex
CREATE INDEX "JournalEntry_user_id_manhwa_id_idx" ON "JournalEntry"("user_id", "manhwa_id");

-- CreateIndex
CREATE INDEX "Review_manhwa_id_likes_count_idx" ON "Review"("manhwa_id", "likes_count" DESC);

-- CreateIndex
CREATE INDEX "Review_manhwa_id_created_at_idx" ON "Review"("manhwa_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "Review_user_id_idx" ON "Review"("user_id");

-- CreateIndex
CREATE INDEX "Quote_manhwa_id_votes_idx" ON "Quote"("manhwa_id", "votes" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "ManhwaList_slug_key" ON "ManhwaList"("slug");

-- CreateIndex
CREATE INDEX "ListItem_list_id_position_idx" ON "ListItem"("list_id", "position");

-- CreateIndex
CREATE UNIQUE INDEX "ListItem_list_id_manhwa_id_key" ON "ListItem"("list_id", "manhwa_id");

-- CreateIndex
CREATE INDEX "Follow_following_id_idx" ON "Follow"("following_id");

-- CreateIndex
CREATE INDEX "Activity_user_id_created_at_idx" ON "Activity"("user_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "Activity_created_at_idx" ON "Activity"("created_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "ReadingRoom_slug_key" ON "ReadingRoom"("slug");

-- CreateIndex
CREATE INDEX "RoomMessage_room_id_chapter_ref_idx" ON "RoomMessage"("room_id", "chapter_ref");

-- CreateIndex
CREATE INDEX "Notification_user_id_read_created_at_idx" ON "Notification"("user_id", "read", "created_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "Achievement_slug_key" ON "Achievement"("slug");

-- CreateIndex
CREATE INDEX "Report_status_created_at_idx" ON "Report"("status", "created_at");

-- CreateIndex
CREATE INDEX "Report_content_type_content_id_idx" ON "Report"("content_type", "content_id");

-- CreateIndex
CREATE INDEX "SocialPostQueue_status_scheduled_at_idx" ON "SocialPostQueue"("status", "scheduled_at");

-- AddForeignKey
ALTER TABLE "Arc" ADD CONSTRAINT "Arc_manhwa_id_fkey" FOREIGN KEY ("manhwa_id") REFERENCES "Manhwa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArcScore" ADD CONSTRAINT "ArcScore_arc_id_fkey" FOREIGN KEY ("arc_id") REFERENCES "Arc"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArcScore" ADD CONSTRAINT "ArcScore_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReadLink" ADD CONSTRAINT "ReadLink_manhwa_id_fkey" FOREIGN KEY ("manhwa_id") REFERENCES "Manhwa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SimilarManhwa" ADD CONSTRAINT "SimilarManhwa_source_id_fkey" FOREIGN KEY ("source_id") REFERENCES "Manhwa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SimilarManhwa" ADD CONSTRAINT "SimilarManhwa_target_id_fkey" FOREIGN KEY ("target_id") REFERENCES "Manhwa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ManhwaRelation" ADD CONSTRAINT "ManhwaRelation_source_id_fkey" FOREIGN KEY ("source_id") REFERENCES "Manhwa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ManhwaRelation" ADD CONSTRAINT "ManhwaRelation_target_id_fkey" FOREIGN KEY ("target_id") REFERENCES "Manhwa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScoreHistory" ADD CONSTRAINT "ScoreHistory_manhwa_id_fkey" FOREIGN KEY ("manhwa_id") REFERENCES "Manhwa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExternalScoreSnapshot" ADD CONSTRAINT "ExternalScoreSnapshot_manhwa_id_fkey" FOREIGN KEY ("manhwa_id") REFERENCES "Manhwa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Release" ADD CONSTRAINT "Release_manhwa_id_fkey" FOREIGN KEY ("manhwa_id") REFERENCES "Manhwa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ManhwaCreator" ADD CONSTRAINT "ManhwaCreator_manhwa_id_fkey" FOREIGN KEY ("manhwa_id") REFERENCES "Manhwa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ManhwaCreator" ADD CONSTRAINT "ManhwaCreator_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "Creator"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreatorFollow" ADD CONSTRAINT "CreatorFollow_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreatorFollow" ADD CONSTRAINT "CreatorFollow_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "Creator"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ManhwaGenre" ADD CONSTRAINT "ManhwaGenre_manhwa_id_fkey" FOREIGN KEY ("manhwa_id") REFERENCES "Manhwa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ManhwaGenre" ADD CONSTRAINT "ManhwaGenre_genre_id_fkey" FOREIGN KEY ("genre_id") REFERENCES "Genre"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ManhwaTrope" ADD CONSTRAINT "ManhwaTrope_manhwa_id_fkey" FOREIGN KEY ("manhwa_id") REFERENCES "Manhwa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ManhwaTrope" ADD CONSTRAINT "ManhwaTrope_trope_id_fkey" FOREIGN KEY ("trope_id") REFERENCES "Trope"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserLibrary" ADD CONSTRAINT "UserLibrary_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserLibrary" ADD CONSTRAINT "UserLibrary_manhwa_id_fkey" FOREIGN KEY ("manhwa_id") REFERENCES "Manhwa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalEntry" ADD CONSTRAINT "JournalEntry_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Waitlist" ADD CONSTRAINT "Waitlist_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Waitlist" ADD CONSTRAINT "Waitlist_manhwa_id_fkey" FOREIGN KEY ("manhwa_id") REFERENCES "Manhwa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_manhwa_id_fkey" FOREIGN KEY ("manhwa_id") REFERENCES "Manhwa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewLike" ADD CONSTRAINT "ReviewLike_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewLike" ADD CONSTRAINT "ReviewLike_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "Review"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quote" ADD CONSTRAINT "Quote_manhwa_id_fkey" FOREIGN KEY ("manhwa_id") REFERENCES "Manhwa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quote" ADD CONSTRAINT "Quote_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuoteVote" ADD CONSTRAINT "QuoteVote_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuoteVote" ADD CONSTRAINT "QuoteVote_quote_id_fkey" FOREIGN KEY ("quote_id") REFERENCES "Quote"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TropeVote" ADD CONSTRAINT "TropeVote_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ManhwaList" ADD CONSTRAINT "ManhwaList_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListItem" ADD CONSTRAINT "ListItem_list_id_fkey" FOREIGN KEY ("list_id") REFERENCES "ManhwaList"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListItem" ADD CONSTRAINT "ListItem_manhwa_id_fkey" FOREIGN KEY ("manhwa_id") REFERENCES "Manhwa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListVote" ADD CONSTRAINT "ListVote_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListVote" ADD CONSTRAINT "ListVote_list_id_fkey" FOREIGN KEY ("list_id") REFERENCES "ManhwaList"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Follow" ADD CONSTRAINT "Follow_follower_id_fkey" FOREIGN KEY ("follower_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Follow" ADD CONSTRAINT "Follow_following_id_fkey" FOREIGN KEY ("following_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomMember" ADD CONSTRAINT "RoomMember_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "ReadingRoom"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomMember" ADD CONSTRAINT "RoomMember_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomMessage" ADD CONSTRAINT "RoomMessage_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "ReadingRoom"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAchievement" ADD CONSTRAINT "UserAchievement_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAchievement" ADD CONSTRAINT "UserAchievement_achievement_id_fkey" FOREIGN KEY ("achievement_id") REFERENCES "Achievement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
