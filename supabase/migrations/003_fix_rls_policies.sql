-- ═══════════════════════════════════════════════════════════════════════════
-- COMMLEAD ACADEMY - COMPLETE RLS FIX
-- Run this in Supabase SQL Editor to fix ALL admin CRUD operations
-- This fixes the recursive RLS policy issue and ensures admin can manage all data
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── STEP 1: Create a SECURITY DEFINER function to check admin role ────────
-- This avoids the recursive RLS issue where admin policies query
-- the profiles table which itself has RLS enabled
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ─── STEP 2: Drop ALL existing policies and recreate them properly ─────────

-- === PROFILES ===
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;

-- Users see their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id OR public.is_admin());

-- Users update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id OR public.is_admin());

-- === PROGRAMS ===
DROP POLICY IF EXISTS "Anyone can view active programs" ON programs;
DROP POLICY IF EXISTS "Admins can manage programs" ON programs;

-- Public sees active programs, admin sees ALL
CREATE POLICY "View programs"
  ON programs FOR SELECT
  USING (is_active = TRUE OR public.is_admin());

-- Admin full CRUD
CREATE POLICY "Admin manage programs"
  ON programs FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Admin update programs"
  ON programs FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "Admin delete programs"
  ON programs FOR DELETE
  USING (public.is_admin());

-- === EVENTS ===
DROP POLICY IF EXISTS "Anyone can view events" ON events;
DROP POLICY IF EXISTS "Admins can manage events" ON events;

-- Public sees active events, admin sees ALL
CREATE POLICY "View events"
  ON events FOR SELECT
  USING (is_active = TRUE OR public.is_admin());

-- Admin full CRUD
CREATE POLICY "Admin manage events"
  ON events FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Admin update events"
  ON events FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "Admin delete events"
  ON events FOR DELETE
  USING (public.is_admin());

-- === TEAM MEMBERS ===
DROP POLICY IF EXISTS "Anyone can view team members" ON team_members;
DROP POLICY IF EXISTS "Admins can manage team members" ON team_members;

-- Public sees active team members, admin sees ALL
CREATE POLICY "View team members"
  ON team_members FOR SELECT
  USING (is_active = TRUE OR public.is_admin());

-- Admin full CRUD
CREATE POLICY "Admin manage team members"
  ON team_members FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Admin update team members"
  ON team_members FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "Admin delete team members"
  ON team_members FOR DELETE
  USING (public.is_admin());

-- === ENROLLMENTS ===
DROP POLICY IF EXISTS "Users can view own enrollments" ON enrollments;
DROP POLICY IF EXISTS "Users can create own enrollments" ON enrollments;
DROP POLICY IF EXISTS "Admins can manage all enrollments" ON enrollments;

CREATE POLICY "View own enrollments"
  ON enrollments FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Create own enrollment"
  ON enrollments FOR INSERT
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Admin update enrollments"
  ON enrollments FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "Admin delete enrollments"
  ON enrollments FOR DELETE
  USING (public.is_admin());

-- === PAYMENT LOGS ===
DROP POLICY IF EXISTS "Users can view own payments" ON payment_logs;
DROP POLICY IF EXISTS "Admins can manage all payments" ON payment_logs;

CREATE POLICY "View own payments"
  ON payment_logs FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Admin manage payments"
  ON payment_logs FOR ALL
  USING (public.is_admin());

-- === LESSONS ===
DROP POLICY IF EXISTS "Enrolled students can view lessons" ON lessons;
DROP POLICY IF EXISTS "Admins can manage lessons" ON lessons;

CREATE POLICY "View lessons"
  ON lessons FOR SELECT
  USING (
    public.is_admin() OR 
    EXISTS (
      SELECT 1 FROM enrollments e
      WHERE e.user_id = auth.uid()
      AND e.program_id = lessons.program_id
      AND e.status = 'approved'
    )
  );

CREATE POLICY "Admin manage lessons"
  ON lessons FOR ALL
  USING (public.is_admin());

-- === LESSON PROGRESS ===
DROP POLICY IF EXISTS "Users can manage own progress" ON lesson_progress;
DROP POLICY IF EXISTS "Admins can view all progress" ON lesson_progress;

CREATE POLICY "Manage own progress"
  ON lesson_progress FOR ALL
  USING (auth.uid() = user_id OR public.is_admin());

-- === TESTIMONIALS ===
DROP POLICY IF EXISTS "Anyone can view testimonials" ON testimonials;
DROP POLICY IF EXISTS "Admins can manage testimonials" ON testimonials;

CREATE POLICY "View testimonials"
  ON testimonials FOR SELECT
  USING (is_active = TRUE OR public.is_admin());

CREATE POLICY "Admin manage testimonials"
  ON testimonials FOR ALL
  USING (public.is_admin());

-- === WEBSITE CONTENT ===
DROP POLICY IF EXISTS "Anyone can view website content" ON website_content;
DROP POLICY IF EXISTS "Admins can manage website content" ON website_content;

CREATE POLICY "View website content"
  ON website_content FOR SELECT
  USING (TRUE);

CREATE POLICY "Admin manage website content"
  ON website_content FOR ALL
  USING (public.is_admin());

-- ─── STEP 3: Create storage bucket if not exists ───────────────────────────
INSERT INTO storage.buckets (id, name, public) 
VALUES ('images', 'images', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
DROP POLICY IF EXISTS "Public image access" ON storage.objects;
DROP POLICY IF EXISTS "Admin image upload" ON storage.objects;
DROP POLICY IF EXISTS "Admin image update" ON storage.objects;
DROP POLICY IF EXISTS "Admin image delete" ON storage.objects;

CREATE POLICY "Public image access" ON storage.objects
  FOR SELECT USING (bucket_id = 'images');

CREATE POLICY "Admin image upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'images' AND public.is_admin());

CREATE POLICY "Admin image update" ON storage.objects
  FOR UPDATE USING (bucket_id = 'images' AND public.is_admin());

CREATE POLICY "Admin image delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'images' AND public.is_admin());

-- ─── STEP 4: Ensure admin account is set ───────────────────────────────────
UPDATE profiles 
SET role = 'admin', is_approved = TRUE 
WHERE id = '92543f53-96b2-42e2-8bbd-20ba1eb9a9f6';

-- ─── STEP 5: Ensure all columns exist on programs table ────────────────────
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
