-- CreateTable
CREATE TABLE "FanArtPost" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "manhwa_id" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "is_nsfw" BOOLEAN NOT NULL DEFAULT false,
    "is_original" BOOLEAN NOT NULL DEFAULT false,
    "credit_name" TEXT,
    "credit_url" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "like_count" INTEGER NOT NULL DEFAULT 0,
    "comment_count" INTEGER NOT NULL DEFAULT 0,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FanArtPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FanArtImage" (
    "id" TEXT NOT NULL,
    "post_id" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "thumb_url" TEXT NOT NULL,
    "alt_text" TEXT,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "FanArtImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FanArtComment" (
    "id" TEXT NOT NULL,
    "post_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "parent_id" TEXT,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FanArtComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FanArtLike" (
    "user_id" TEXT NOT NULL,
    "post_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FanArtLike_pkey" PRIMARY KEY ("user_id","post_id")
);

-- CreateIndex
CREATE INDEX "FanArtPost_user_id_idx" ON "FanArtPost"("user_id");

-- CreateIndex
CREATE INDEX "FanArtPost_manhwa_id_idx" ON "FanArtPost"("manhwa_id");

-- CreateIndex
CREATE INDEX "FanArtPost_created_at_idx" ON "FanArtPost"("created_at" DESC);

-- CreateIndex
CREATE INDEX "FanArtImage_post_id_idx" ON "FanArtImage"("post_id");

-- CreateIndex
CREATE INDEX "FanArtComment_post_id_idx" ON "FanArtComment"("post_id");

-- AddForeignKey
ALTER TABLE "FanArtPost" ADD CONSTRAINT "FanArtPost_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FanArtPost" ADD CONSTRAINT "FanArtPost_manhwa_id_fkey" FOREIGN KEY ("manhwa_id") REFERENCES "Manhwa"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FanArtImage" ADD CONSTRAINT "FanArtImage_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "FanArtPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FanArtComment" ADD CONSTRAINT "FanArtComment_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "FanArtPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FanArtComment" ADD CONSTRAINT "FanArtComment_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FanArtComment" ADD CONSTRAINT "FanArtComment_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "FanArtComment"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "FanArtLike" ADD CONSTRAINT "FanArtLike_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FanArtLike" ADD CONSTRAINT "FanArtLike_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "FanArtPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;
