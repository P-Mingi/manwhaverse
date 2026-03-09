-- Publisher RLS
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor).

ALTER TABLE "Publisher"        ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ManhwaPublisher"  ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "public_read" ON "Publisher"       FOR SELECT USING (true);
CREATE POLICY "public_read" ON "ManhwaPublisher" FOR SELECT USING (true);
