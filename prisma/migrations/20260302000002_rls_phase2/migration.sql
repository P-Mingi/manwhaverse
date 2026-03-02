-- RLS Phase 2: cover tables added after the initial RLS migration
-- Run this in the Supabase SQL editor (Dashboard → SQL Editor).
-- Prisma uses service_role which bypasses RLS; these policies protect
-- against direct PostgREST/Supabase REST API access.

-- ═══════════════════════════════════════════════════
-- AUTH.JS TABLES
-- Enable RLS with NO permissive policies → effectively blocks all
-- PostgREST access while service_role (Auth.js / Prisma) still works.
-- ═══════════════════════════════════════════════════

ALTER TABLE "Account"           ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Session"           ENABLE ROW LEVEL SECURITY;
ALTER TABLE "VerificationToken" ENABLE ROW LEVEL SECURITY;

-- No SELECT/INSERT/UPDATE/DELETE policies for anon or authenticated roles.
-- auth.uid() cannot match any row because these tables are exclusively
-- managed by Auth.js via the service_role connection.

-- ═══════════════════════════════════════════════════
-- REVIEW INTERACTIONS (ReviewReaction, ReviewDislike)
-- Created after the initial RLS migration.
-- ═══════════════════════════════════════════════════

ALTER TABLE "ReviewReaction" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ReviewDislike"  ENABLE ROW LEVEL SECURITY;

-- ReviewReaction: public read, own insert/delete
CREATE POLICY "public_read" ON "ReviewReaction" FOR SELECT USING (true);
CREATE POLICY "own_insert"  ON "ReviewReaction" FOR INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "own_delete"  ON "ReviewReaction" FOR DELETE USING (auth.uid()::text = user_id);

-- ReviewDislike: public read, own insert/delete
CREATE POLICY "public_read" ON "ReviewDislike" FOR SELECT USING (true);
CREATE POLICY "own_insert"  ON "ReviewDislike" FOR INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "own_delete"  ON "ReviewDislike" FOR DELETE USING (auth.uid()::text = user_id);

-- ═══════════════════════════════════════════════════
-- PRE-LAUNCH FEATURE TABLES
-- Created in the prelaunch_features migration without RLS.
-- ═══════════════════════════════════════════════════

ALTER TABLE "ManhwaReaction" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CharacterVote"  ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Poll"           ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PollOption"     ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PollVote"       ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Article"        ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ArticleManhwa"  ENABLE ROW LEVEL SECURITY;

-- ManhwaReaction: public read, own insert/delete
CREATE POLICY "public_read" ON "ManhwaReaction" FOR SELECT USING (true);
CREATE POLICY "own_insert"  ON "ManhwaReaction" FOR INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "own_delete"  ON "ManhwaReaction" FOR DELETE USING (auth.uid()::text = user_id);

-- CharacterVote: public read, own insert/delete
CREATE POLICY "public_read" ON "CharacterVote" FOR SELECT USING (true);
CREATE POLICY "own_insert"  ON "CharacterVote" FOR INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "own_delete"  ON "CharacterVote" FOR DELETE USING (auth.uid()::text = user_id);

-- Poll: public read (active polls and all polls for admins via service_role)
CREATE POLICY "public_read" ON "Poll" FOR SELECT USING (is_active = true);

-- PollOption: public read
CREATE POLICY "public_read" ON "PollOption" FOR SELECT USING (true);

-- PollVote: public read (so vote counts are visible), own insert
CREATE POLICY "public_read" ON "PollVote" FOR SELECT USING (true);
CREATE POLICY "own_insert"  ON "PollVote" FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Article: public read for published articles only
CREATE POLICY "public_read" ON "Article" FOR SELECT USING (status = 'PUBLISHED');

-- ArticleManhwa: public read (join table, visible if article is published)
CREATE POLICY "public_read" ON "ArticleManhwa" FOR SELECT USING (true);
