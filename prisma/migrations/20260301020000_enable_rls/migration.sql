-- Enable RLS on all tables
-- Prisma uses service_role (bypasses RLS), so these policies
-- protect against direct Supabase REST/Realtime API access.

-- ═══════════════════════════════════════════════════
-- ENABLE RLS ON ALL TABLES
-- ═══════════════════════════════════════════════════

ALTER TABLE "Manhwa" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Arc" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ArcScore" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ReadLink" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SimilarManhwa" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ManhwaRelation" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ScoreHistory" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ExternalScoreSnapshot" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Release" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Creator" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ManhwaCreator" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CreatorFollow" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Genre" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ManhwaGenre" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Trope" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ManhwaTrope" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "UserLibrary" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "JournalEntry" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Waitlist" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Review" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ReviewLike" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Quote" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "QuoteVote" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TropeVote" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ManhwaList" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ListItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ListVote" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Follow" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Activity" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ReadingRoom" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "RoomMember" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "RoomMessage" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Notification" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Achievement" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "UserAchievement" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Report" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ModerationLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SocialPostQueue" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SyncLog" ENABLE ROW LEVEL SECURITY;

-- ═══════════════════════════════════════════════════
-- PUBLIC READ POLICIES (content visible to everyone)
-- ═══════════════════════════════════════════════════

CREATE POLICY "public_read" ON "Manhwa" FOR SELECT USING (is_published = true);
CREATE POLICY "public_read" ON "Arc" FOR SELECT USING (true);
CREATE POLICY "public_read" ON "ReadLink" FOR SELECT USING (true);
CREATE POLICY "public_read" ON "SimilarManhwa" FOR SELECT USING (true);
CREATE POLICY "public_read" ON "ManhwaRelation" FOR SELECT USING (true);
CREATE POLICY "public_read" ON "ScoreHistory" FOR SELECT USING (true);
CREATE POLICY "public_read" ON "ExternalScoreSnapshot" FOR SELECT USING (true);
CREATE POLICY "public_read" ON "Release" FOR SELECT USING (true);
CREATE POLICY "public_read" ON "Creator" FOR SELECT USING (true);
CREATE POLICY "public_read" ON "ManhwaCreator" FOR SELECT USING (true);
CREATE POLICY "public_read" ON "Genre" FOR SELECT USING (true);
CREATE POLICY "public_read" ON "ManhwaGenre" FOR SELECT USING (true);
CREATE POLICY "public_read" ON "Trope" FOR SELECT USING (true);
CREATE POLICY "public_read" ON "ManhwaTrope" FOR SELECT USING (true);
CREATE POLICY "public_read" ON "Achievement" FOR SELECT USING (true);

-- Reviews: public read (non-deleted only)
CREATE POLICY "public_read" ON "Review" FOR SELECT USING (deleted_at IS NULL);

-- Quotes: public read (non-deleted only)
CREATE POLICY "public_read" ON "Quote" FOR SELECT USING (deleted_at IS NULL);

-- Activity: public read
CREATE POLICY "public_read" ON "Activity" FOR SELECT USING (true);

-- Reading Rooms: public rooms readable
CREATE POLICY "public_read" ON "ReadingRoom" FOR SELECT USING (is_public = true);

-- Lists: public lists readable
CREATE POLICY "public_read" ON "ManhwaList" FOR SELECT USING (is_public = true);
CREATE POLICY "public_read" ON "ListItem" FOR SELECT USING (true);

-- User profiles: public read
CREATE POLICY "public_read" ON "User" FOR SELECT USING (true);

-- User achievements: public read
CREATE POLICY "public_read" ON "UserAchievement" FOR SELECT USING (true);

-- Follow: public read
CREATE POLICY "public_read" ON "Follow" FOR SELECT USING (true);
CREATE POLICY "public_read" ON "CreatorFollow" FOR SELECT USING (true);

-- ArcScore: public read
CREATE POLICY "public_read" ON "ArcScore" FOR SELECT USING (true);

-- ═══════════════════════════════════════════════════
-- AUTHENTICATED USER POLICIES (own data management)
-- ═══════════════════════════════════════════════════

-- User: update own profile
CREATE POLICY "own_update" ON "User" FOR UPDATE USING (auth.uid()::text = id);

-- UserLibrary: full CRUD on own entries
CREATE POLICY "own_read" ON "UserLibrary" FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "own_insert" ON "UserLibrary" FOR INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "own_update" ON "UserLibrary" FOR UPDATE USING (auth.uid()::text = user_id);
CREATE POLICY "own_delete" ON "UserLibrary" FOR DELETE USING (auth.uid()::text = user_id);

-- JournalEntry: strictly private
CREATE POLICY "own_read" ON "JournalEntry" FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "own_insert" ON "JournalEntry" FOR INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "own_update" ON "JournalEntry" FOR UPDATE USING (auth.uid()::text = user_id);
CREATE POLICY "own_delete" ON "JournalEntry" FOR DELETE USING (auth.uid()::text = user_id);

-- Review: create/edit/delete own
CREATE POLICY "own_insert" ON "Review" FOR INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "own_update" ON "Review" FOR UPDATE USING (auth.uid()::text = user_id);
CREATE POLICY "own_delete" ON "Review" FOR DELETE USING (auth.uid()::text = user_id);

-- ReviewLike: manage own likes
CREATE POLICY "public_read" ON "ReviewLike" FOR SELECT USING (true);
CREATE POLICY "own_insert" ON "ReviewLike" FOR INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "own_delete" ON "ReviewLike" FOR DELETE USING (auth.uid()::text = user_id);

-- Follow: manage own follows
CREATE POLICY "own_insert" ON "Follow" FOR INSERT WITH CHECK (auth.uid()::text = follower_id);
CREATE POLICY "own_delete" ON "Follow" FOR DELETE USING (auth.uid()::text = follower_id);

-- CreatorFollow: manage own follows
CREATE POLICY "own_insert" ON "CreatorFollow" FOR INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "own_delete" ON "CreatorFollow" FOR DELETE USING (auth.uid()::text = user_id);

-- Notification: own only
CREATE POLICY "own_read" ON "Notification" FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "own_update" ON "Notification" FOR UPDATE USING (auth.uid()::text = user_id);

-- Waitlist: manage own
CREATE POLICY "own_read" ON "Waitlist" FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "own_insert" ON "Waitlist" FOR INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "own_delete" ON "Waitlist" FOR DELETE USING (auth.uid()::text = user_id);

-- Quote: create own
CREATE POLICY "own_insert" ON "Quote" FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- QuoteVote: manage own
CREATE POLICY "public_read" ON "QuoteVote" FOR SELECT USING (true);
CREATE POLICY "own_insert" ON "QuoteVote" FOR INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "own_delete" ON "QuoteVote" FOR DELETE USING (auth.uid()::text = user_id);

-- TropeVote: manage own
CREATE POLICY "public_read" ON "TropeVote" FOR SELECT USING (true);
CREATE POLICY "own_insert" ON "TropeVote" FOR INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "own_delete" ON "TropeVote" FOR DELETE USING (auth.uid()::text = user_id);

-- ManhwaList: manage own lists
CREATE POLICY "own_insert" ON "ManhwaList" FOR INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "own_update" ON "ManhwaList" FOR UPDATE USING (auth.uid()::text = user_id);
CREATE POLICY "own_delete" ON "ManhwaList" FOR DELETE USING (auth.uid()::text = user_id);

-- ListVote: manage own votes
CREATE POLICY "public_read" ON "ListVote" FOR SELECT USING (true);
CREATE POLICY "own_insert" ON "ListVote" FOR INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "own_delete" ON "ListVote" FOR DELETE USING (auth.uid()::text = user_id);

-- ArcScore: manage own scores
CREATE POLICY "own_insert" ON "ArcScore" FOR INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "own_update" ON "ArcScore" FOR UPDATE USING (auth.uid()::text = user_id);

-- Report: users can create reports
CREATE POLICY "own_insert" ON "Report" FOR INSERT WITH CHECK (auth.uid()::text = reporter_id);

-- RoomMember: read public rooms
CREATE POLICY "public_read" ON "RoomMember" FOR SELECT USING (true);
CREATE POLICY "own_insert" ON "RoomMember" FOR INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "own_delete" ON "RoomMember" FOR DELETE USING (auth.uid()::text = user_id);

-- RoomMessage: read in public rooms
CREATE POLICY "public_read" ON "RoomMessage" FOR SELECT USING (true);
CREATE POLICY "own_insert" ON "RoomMessage" FOR INSERT WITH CHECK (auth.uid()::text = user_id);
