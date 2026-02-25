-- ═══════════════════════════════════════════════════════════════════════════
-- COMMLEAD ACADEMY - STORAGE & RLS FIXES
-- Run this in your Supabase SQL Editor AFTER the initial schema
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── CREATE STORAGE BUCKET ─────────────────────────────────────────────────
-- Create the "images" bucket for storing program, event, and team photos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('images', 'images', TRUE)
ON CONFLICT (id) DO NOTHING;

-- ─── STORAGE POLICIES ──────────────────────────────────────────────────────
-- Allow anyone to view images (public bucket)
CREATE POLICY "Public image access" ON storage.objects
  FOR SELECT USING (bucket_id = 'images');

-- Allow authenticated admins to upload images
CREATE POLICY "Admin image upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'images'
    AND EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Allow authenticated admins to update images
CREATE POLICY "Admin image update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'images'
    AND EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Allow authenticated admins to delete images
CREATE POLICY "Admin image delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'images'
    AND EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ─── FIX ADMIN PROFILE ACCESS ──────────────────────────────────────────────
-- Make sure admin user can access all data
-- Replace the UUID below with your admin's UUID

UPDATE profiles 
SET role = 'admin', is_approved = TRUE 
WHERE id = '92543f53-96b2-42e2-8bbd-20ba1eb9a9f6';

-- ─── ENSURE TABLES EXIST (SAFE) ────────────────────────────────────────────
-- If tables already exist from 001_initial_schema.sql, these will do nothing

CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  bio TEXT,
  image_url TEXT,
  linkedin_url TEXT,
  twitter_url TEXT,
  order_index INTEGER DEFAULT 0,
  is_founder BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT DEFAULT 'workshop',
  date DATE NOT NULL,
  time TEXT,
  location TEXT,
  is_virtual BOOLEAN DEFAULT FALSE,
  registration_link TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── ENABLE RLS (safe re-run) ──────────────────────────────────────────────
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- ─── ENSURE POLICIES EXIST ─────────────────────────────────────────────────
-- Drop and recreate to be safe (idempotent)

DROP POLICY IF EXISTS "Anyone can view team members" ON team_members;
CREATE POLICY "Anyone can view team members"
  ON team_members FOR SELECT
  USING (is_active = TRUE);

DROP POLICY IF EXISTS "Admins can manage team members" ON team_members;
CREATE POLICY "Admins can manage team members"
  ON team_members FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Anyone can view events" ON events;
CREATE POLICY "Anyone can view events"
  ON events FOR SELECT
  USING (is_active = TRUE);

DROP POLICY IF EXISTS "Admins can manage events" ON events;
CREATE POLICY "Admins can manage events"
  ON events FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ─── ENSURE PROGRAMS TABLE HAS ALL COLUMNS ─────────────────────────────────
-- Add columns if they don't exist (safe for re-runs)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'programs' AND column_name = 'delivery_mode') THEN
    ALTER TABLE programs ADD COLUMN delivery_mode TEXT DEFAULT 'In-Person';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'programs' AND column_name = 'schedule') THEN
    ALTER TABLE programs ADD COLUMN schedule TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'programs' AND column_name = 'target_audience') THEN
    ALTER TABLE programs ADD COLUMN target_audience TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'programs' AND column_name = 'certification') THEN
    ALTER TABLE programs ADD COLUMN certification TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'programs' AND column_name = 'payment_options') THEN
    ALTER TABLE programs ADD COLUMN payment_options TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'programs' AND column_name = 'full_description') THEN
    ALTER TABLE programs ADD COLUMN full_description TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'programs' AND column_name = 'image_url') THEN
    ALTER TABLE programs ADD COLUMN image_url TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'programs' AND column_name = 'order_index') THEN
    ALTER TABLE programs ADD COLUMN order_index INTEGER DEFAULT 0;
  END IF;
END $$;
