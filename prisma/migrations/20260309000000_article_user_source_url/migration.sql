-- Add user_id and source_url to Article table
-- user_id: links user-submitted articles to their author
-- source_url: stores the origin URL for news articles ingested from external sources

ALTER TABLE "Article" ADD COLUMN IF NOT EXISTS "user_id" TEXT;
ALTER TABLE "Article" ADD COLUMN IF NOT EXISTS "source_url" TEXT;

-- Foreign key: Article.user_id → User.id (SET NULL on delete so articles survive user deletion)
ALTER TABLE "Article"
  ADD CONSTRAINT "Article_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Index for fetching articles by user
CREATE INDEX IF NOT EXISTS "Article_user_id_idx" ON "Article"("user_id");
