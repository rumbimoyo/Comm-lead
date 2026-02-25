-- ═══════════════════════════════════════════════════════════════════════════
-- COMMLEAD ACADEMY - COMPLETE DATABASE SETUP (ALL-IN-ONE)
-- ═══════════════════════════════════════════════════════════════════════════
-- This is safe to run from ANY state. It creates tables only if they don't
-- exist, uses DROP POLICY IF EXISTS before creating policies, and fixes
-- the recursive RLS admin check issue.
--
-- Run this ONCE in your Supabase SQL Editor and everything will work.
-- ═══════════════════════════════════════════════════════════════════════════


-- ─── STEP 1: ENUMS (safe - ignores if they already exist) ─────────────────
DO $$ BEGIN CREATE TYPE user_role AS ENUM ('student', 'admin'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE enrollment_status AS ENUM ('pending', 'approved', 'rejected', 'suspended'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE student_level AS ENUM ('beginner', 'intermediate', 'advanced'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE payment_method AS ENUM ('ecocash', 'innbucks', 'bank_transfer', 'scholarship'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE payment_status AS ENUM ('pending', 'confirmed', 'failed', 'refunded'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE lesson_type AS ENUM ('video', 'text', 'quiz', 'assignment'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;


-- ─── STEP 2: CREATE ALL TABLES (IF NOT EXISTS) ───────────────────────────

-- Profiles
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT 'New Student',
  phone TEXT,
  city TEXT,
  avatar_url TEXT,
  role user_role DEFAULT 'student',
  is_approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone, role, is_approved)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New Student'),
    NEW.raw_user_meta_data->>'phone',
    'student',
    FALSE
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop and recreate trigger to avoid duplicates
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Programs
CREATE TABLE IF NOT EXISTS programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  short_description TEXT,
  full_description TEXT,
  duration TEXT,
  delivery_mode TEXT DEFAULT 'In-Person',
  schedule TEXT,
  target_audience TEXT,
  price DECIMAL(10,2) DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  payment_options TEXT,
  outcomes TEXT[] DEFAULT '{}',
  certification TEXT,
  level student_level DEFAULT 'beginner',
  is_active BOOLEAN DEFAULT TRUE,
  image_url TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enrollments
CREATE TABLE IF NOT EXISTS enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  program_id UUID REFERENCES programs(id) ON DELETE SET NULL,
  status enrollment_status DEFAULT 'pending',
  payment_status payment_status DEFAULT 'pending',
  payment_method payment_method,
  is_scholarship BOOLEAN DEFAULT FALSE,
  motivation TEXT,
  city TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fix: if enrollments table existed but was incomplete, add missing columns
DO $$ BEGIN
  ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES profiles(id) ON DELETE CASCADE;
  ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS program_id UUID REFERENCES programs(id) ON DELETE SET NULL;
  ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS status enrollment_status DEFAULT 'pending';
  ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS payment_status payment_status DEFAULT 'pending';
  ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS payment_method payment_method;
  ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS is_scholarship BOOLEAN DEFAULT FALSE;
  ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS motivation TEXT;
  ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS city TEXT;
  ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
  ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
EXCEPTION WHEN others THEN NULL;
END $$;

-- Payment Logs
CREATE TABLE IF NOT EXISTS payment_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id UUID REFERENCES enrollments(id) ON DELETE CASCADE,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  payment_method TEXT,
  status payment_status DEFAULT 'pending',
  reference TEXT,
  receipt_url TEXT,
  confirmed_by UUID REFERENCES profiles(id),
  confirmed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fix: if payment_logs existed but was incomplete
DO $$ BEGIN
  ALTER TABLE payment_logs ADD COLUMN IF NOT EXISTS enrollment_id UUID REFERENCES enrollments(id) ON DELETE CASCADE;
  ALTER TABLE payment_logs ADD COLUMN IF NOT EXISTS student_id UUID REFERENCES profiles(id) ON DELETE CASCADE;
  ALTER TABLE payment_logs ADD COLUMN IF NOT EXISTS amount DECIMAL(10,2);
  ALTER TABLE payment_logs ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD';
  ALTER TABLE payment_logs ADD COLUMN IF NOT EXISTS payment_method TEXT;
  ALTER TABLE payment_logs ADD COLUMN IF NOT EXISTS status payment_status DEFAULT 'pending';
  ALTER TABLE payment_logs ADD COLUMN IF NOT EXISTS reference TEXT;
  ALTER TABLE payment_logs ADD COLUMN IF NOT EXISTS receipt_url TEXT;
  ALTER TABLE payment_logs ADD COLUMN IF NOT EXISTS confirmed_by UUID REFERENCES profiles(id);
  ALTER TABLE payment_logs ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMPTZ;
  ALTER TABLE payment_logs ADD COLUMN IF NOT EXISTS notes TEXT;
  ALTER TABLE payment_logs ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
EXCEPTION WHEN others THEN NULL;
END $$;

-- Lessons
CREATE TABLE IF NOT EXISTS lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  content TEXT,
  video_url TEXT,
  lesson_type lesson_type DEFAULT 'text',
  order_index INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(program_id, slug)
);

-- Fix: if lessons existed but was incomplete
DO $$ BEGIN
  ALTER TABLE lessons ADD COLUMN IF NOT EXISTS program_id UUID REFERENCES programs(id) ON DELETE CASCADE;
  ALTER TABLE lessons ADD COLUMN IF NOT EXISTS title TEXT;
  ALTER TABLE lessons ADD COLUMN IF NOT EXISTS slug TEXT;
  ALTER TABLE lessons ADD COLUMN IF NOT EXISTS content TEXT;
  ALTER TABLE lessons ADD COLUMN IF NOT EXISTS video_url TEXT;
  ALTER TABLE lessons ADD COLUMN IF NOT EXISTS lesson_type lesson_type DEFAULT 'text';
  ALTER TABLE lessons ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0;
  ALTER TABLE lessons ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT FALSE;
  ALTER TABLE lessons ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
  ALTER TABLE lessons ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
EXCEPTION WHEN others THEN NULL;
END $$;

-- Lesson Progress
CREATE TABLE IF NOT EXISTS lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT FALSE,
  score INTEGER,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- Fix: if lesson_progress existed but was incomplete
DO $$ BEGIN
  ALTER TABLE lesson_progress ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES profiles(id) ON DELETE CASCADE;
  ALTER TABLE lesson_progress ADD COLUMN IF NOT EXISTS lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE;
  ALTER TABLE lesson_progress ADD COLUMN IF NOT EXISTS completed BOOLEAN DEFAULT FALSE;
  ALTER TABLE lesson_progress ADD COLUMN IF NOT EXISTS score INTEGER;
  ALTER TABLE lesson_progress ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;
  ALTER TABLE lesson_progress ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
EXCEPTION WHEN others THEN NULL;
END $$;

-- Team Members
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

-- Events
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

-- Testimonials
CREATE TABLE IF NOT EXISTS testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT,
  company TEXT,
  content TEXT NOT NULL,
  image_url TEXT,
  rating INTEGER DEFAULT 5,
  is_active BOOLEAN DEFAULT TRUE,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Website Content
CREATE TABLE IF NOT EXISTS website_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section TEXT UNIQUE NOT NULL,
  content JSONB DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- Fix: if profiles existed but was incomplete (e.g. created by Supabase dashboard)
DO $$ BEGIN
  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS full_name TEXT DEFAULT 'New Student';
  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT;
  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS city TEXT;
  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role user_role DEFAULT 'student';
  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT FALSE;
  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
EXCEPTION WHEN others THEN NULL;
END $$;

-- Fix: if team_members existed but was incomplete
DO $$ BEGIN
  ALTER TABLE team_members ADD COLUMN IF NOT EXISTS name TEXT;
  ALTER TABLE team_members ADD COLUMN IF NOT EXISTS role TEXT;
  ALTER TABLE team_members ADD COLUMN IF NOT EXISTS bio TEXT;
  ALTER TABLE team_members ADD COLUMN IF NOT EXISTS image_url TEXT;
  ALTER TABLE team_members ADD COLUMN IF NOT EXISTS linkedin_url TEXT;
  ALTER TABLE team_members ADD COLUMN IF NOT EXISTS twitter_url TEXT;
  ALTER TABLE team_members ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0;
  ALTER TABLE team_members ADD COLUMN IF NOT EXISTS is_founder BOOLEAN DEFAULT FALSE;
  ALTER TABLE team_members ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
  ALTER TABLE team_members ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
EXCEPTION WHEN others THEN NULL;
END $$;

-- Fix: if events existed but was incomplete
DO $$ BEGIN
  ALTER TABLE events ADD COLUMN IF NOT EXISTS title TEXT;
  ALTER TABLE events ADD COLUMN IF NOT EXISTS description TEXT;
  ALTER TABLE events ADD COLUMN IF NOT EXISTS event_type TEXT DEFAULT 'workshop';
  ALTER TABLE events ADD COLUMN IF NOT EXISTS date DATE;
  ALTER TABLE events ADD COLUMN IF NOT EXISTS time TEXT;
  ALTER TABLE events ADD COLUMN IF NOT EXISTS location TEXT;
  ALTER TABLE events ADD COLUMN IF NOT EXISTS is_virtual BOOLEAN DEFAULT FALSE;
  ALTER TABLE events ADD COLUMN IF NOT EXISTS registration_link TEXT;
  ALTER TABLE events ADD COLUMN IF NOT EXISTS image_url TEXT;
  ALTER TABLE events ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
  ALTER TABLE events ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
EXCEPTION WHEN others THEN NULL;
END $$;

-- Fix: if testimonials existed but was incomplete
DO $$ BEGIN
  ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS name TEXT;
  ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS role TEXT;
  ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS company TEXT;
  ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS content TEXT;
  ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS image_url TEXT;
  ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS rating INTEGER DEFAULT 5;
  ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
  ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0;
  ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
EXCEPTION WHEN others THEN NULL;
END $$;

-- Fix: if website_content existed but was incomplete
DO $$ BEGIN
  ALTER TABLE website_content ADD COLUMN IF NOT EXISTS section TEXT;
  ALTER TABLE website_content ADD COLUMN IF NOT EXISTS content JSONB DEFAULT '{}';
  ALTER TABLE website_content ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
EXCEPTION WHEN others THEN NULL;
END $$;

-- ─── STEP 3: Ensure ALL columns exist on programs (safe add) ──────────────
DO $$ BEGIN
  ALTER TABLE programs ADD COLUMN IF NOT EXISTS name TEXT;
  ALTER TABLE programs ADD COLUMN IF NOT EXISTS slug TEXT;
  ALTER TABLE programs ADD COLUMN IF NOT EXISTS short_description TEXT;
  ALTER TABLE programs ADD COLUMN IF NOT EXISTS full_description TEXT;
  ALTER TABLE programs ADD COLUMN IF NOT EXISTS duration TEXT;
  ALTER TABLE programs ADD COLUMN IF NOT EXISTS delivery_mode TEXT DEFAULT 'In-Person';
  ALTER TABLE programs ADD COLUMN IF NOT EXISTS schedule TEXT;
  ALTER TABLE programs ADD COLUMN IF NOT EXISTS target_audience TEXT;
  ALTER TABLE programs ADD COLUMN IF NOT EXISTS price DECIMAL(10,2) DEFAULT 0;
  ALTER TABLE programs ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD';
  ALTER TABLE programs ADD COLUMN IF NOT EXISTS payment_options TEXT;
  ALTER TABLE programs ADD COLUMN IF NOT EXISTS outcomes TEXT[] DEFAULT '{}';
  ALTER TABLE programs ADD COLUMN IF NOT EXISTS certification TEXT;
  ALTER TABLE programs ADD COLUMN IF NOT EXISTS level student_level DEFAULT 'beginner';
  ALTER TABLE programs ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
  ALTER TABLE programs ADD COLUMN IF NOT EXISTS image_url TEXT;
  ALTER TABLE programs ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0;
  ALTER TABLE programs ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
  ALTER TABLE programs ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
EXCEPTION WHEN others THEN NULL;
END $$;


-- ─── STEP 4: ENABLE RLS ON ALL TABLES ────────────────────────────────────
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE website_content ENABLE ROW LEVEL SECURITY;


-- ─── STEP 5: Create SECURITY DEFINER admin check function ────────────────
-- This is the KEY FIX. Without this, admin policies that query the profiles
-- table create a recursive RLS loop that silently blocks everything.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;


-- ─── STEP 6: DROP ALL OLD POLICIES AND CREATE FIXED ONES ─────────────────

-- === PROFILES ===
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id OR public.is_admin());

-- === PROGRAMS ===
DROP POLICY IF EXISTS "Anyone can view active programs" ON programs;
DROP POLICY IF EXISTS "Admins can manage programs" ON programs;
DROP POLICY IF EXISTS "View programs" ON programs;
DROP POLICY IF EXISTS "Admin manage programs" ON programs;
DROP POLICY IF EXISTS "Admin update programs" ON programs;
DROP POLICY IF EXISTS "Admin delete programs" ON programs;

CREATE POLICY "View programs"
  ON programs FOR SELECT
  USING (is_active = TRUE OR public.is_admin());

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
DROP POLICY IF EXISTS "View events" ON events;
DROP POLICY IF EXISTS "Admin manage events" ON events;
DROP POLICY IF EXISTS "Admin update events" ON events;
DROP POLICY IF EXISTS "Admin delete events" ON events;

CREATE POLICY "View events"
  ON events FOR SELECT
  USING (is_active = TRUE OR public.is_admin());

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
DROP POLICY IF EXISTS "View team members" ON team_members;
DROP POLICY IF EXISTS "Admin manage team members" ON team_members;
DROP POLICY IF EXISTS "Admin update team members" ON team_members;
DROP POLICY IF EXISTS "Admin delete team members" ON team_members;

CREATE POLICY "View team members"
  ON team_members FOR SELECT
  USING (is_active = TRUE OR public.is_admin());

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
DROP POLICY IF EXISTS "View own enrollments" ON enrollments;
DROP POLICY IF EXISTS "Create own enrollment" ON enrollments;
DROP POLICY IF EXISTS "Admin update enrollments" ON enrollments;
DROP POLICY IF EXISTS "Admin delete enrollments" ON enrollments;

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
DROP POLICY IF EXISTS "View own payments" ON payment_logs;
DROP POLICY IF EXISTS "Admin manage payments" ON payment_logs;

CREATE POLICY "View own payments"
  ON payment_logs FOR SELECT
  USING (auth.uid() = student_id OR public.is_admin());

CREATE POLICY "Admin manage payments"
  ON payment_logs FOR ALL
  USING (public.is_admin());

-- === LESSONS ===
DROP POLICY IF EXISTS "Enrolled students can view lessons" ON lessons;
DROP POLICY IF EXISTS "Admins can manage lessons" ON lessons;
DROP POLICY IF EXISTS "View lessons" ON lessons;
DROP POLICY IF EXISTS "Admin manage lessons" ON lessons;

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
DROP POLICY IF EXISTS "Manage own progress" ON lesson_progress;

CREATE POLICY "Manage own progress"
  ON lesson_progress FOR ALL
  USING (auth.uid() = user_id OR public.is_admin());

-- === TESTIMONIALS ===
DROP POLICY IF EXISTS "Anyone can view testimonials" ON testimonials;
DROP POLICY IF EXISTS "Admins can manage testimonials" ON testimonials;
DROP POLICY IF EXISTS "View testimonials" ON testimonials;
DROP POLICY IF EXISTS "Admin manage testimonials" ON testimonials;

CREATE POLICY "View testimonials"
  ON testimonials FOR SELECT
  USING (is_active = TRUE OR public.is_admin());

CREATE POLICY "Admin manage testimonials"
  ON testimonials FOR ALL
  USING (public.is_admin());

-- === WEBSITE CONTENT ===
DROP POLICY IF EXISTS "Anyone can view website content" ON website_content;
DROP POLICY IF EXISTS "Admins can manage website content" ON website_content;
DROP POLICY IF EXISTS "View website content" ON website_content;
DROP POLICY IF EXISTS "Admin manage website content" ON website_content;

CREATE POLICY "View website content"
  ON website_content FOR SELECT
  USING (TRUE);

CREATE POLICY "Admin manage website content"
  ON website_content FOR ALL
  USING (public.is_admin());


-- ─── STEP 7: STORAGE BUCKET ──────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public) 
VALUES ('images', 'images', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Add payment-receipts bucket for receipt uploads
INSERT INTO storage.buckets (id, name, public) 
VALUES ('payment-receipts', 'payment-receipts', FALSE)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public image access" ON storage.objects;
DROP POLICY IF EXISTS "Admin image upload" ON storage.objects;
DROP POLICY IF EXISTS "Admin image update" ON storage.objects;
DROP POLICY IF EXISTS "Admin image delete" ON storage.objects;

-- Payment receipts storage policies
DROP POLICY IF EXISTS "Users can upload receipts" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own receipts" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view all receipts" ON storage.objects;

CREATE POLICY "Public image access" ON storage.objects
  FOR SELECT USING (bucket_id = 'images');

CREATE POLICY "Admin image upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'images' AND public.is_admin());

CREATE POLICY "Admin image update" ON storage.objects
  FOR UPDATE USING (bucket_id = 'images' AND public.is_admin());

CREATE POLICY "Admin image delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'images' AND public.is_admin());

-- Payment receipts policies
CREATE POLICY "Users can upload receipts" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'payment-receipts' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view own receipts" ON storage.objects
  FOR SELECT USING (bucket_id = 'payment-receipts' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Admins can view all receipts" ON storage.objects
  FOR SELECT USING (bucket_id = 'payment-receipts' AND public.is_admin());


-- ─── STEP 8: SET ADMIN ACCOUNT ───────────────────────────────────────────
-- Set admin based on email instead of UUID (more reliable)
UPDATE profiles 
SET role = 'admin', is_approved = TRUE 
WHERE id IN (
  SELECT id FROM auth.users 
  WHERE email = 'c.chikomo@alumni.alueducation.com'
);

-- Also update any existing profile with the old UUID if it exists
UPDATE profiles 
SET role = 'admin', is_approved = TRUE 
WHERE id = '92543f53-96b2-42e2-8bbd-20ba1eb9a9f6';


-- ─── STEP 9: SEED PROGRAMS (only if table is empty) ──────────────────────
INSERT INTO programs (name, slug, short_description, level, price, currency, duration, delivery_mode, is_active)
SELECT * FROM (VALUES
  ('Public Speaking Foundations', 'public-speaking-foundations', 'Master the basics of confident public speaking', 'beginner'::student_level, 150::DECIMAL, 'USD', '6 weeks', 'In-Person & Online', TRUE),
  ('Persuasive Communication', 'persuasive-communication', 'Learn to influence and persuade through powerful messaging', 'beginner'::student_level, 150::DECIMAL, 'USD', '6 weeks', 'In-Person & Online', TRUE),
  ('Advanced Presentation Skills', 'advanced-presentation-skills', 'Elevate your presentation delivery to executive level', 'intermediate'::student_level, 250::DECIMAL, 'USD', '8 weeks', 'In-Person & Online', TRUE),
  ('Leadership Communication', 'leadership-communication', 'Develop the communication skills of exceptional leaders', 'intermediate'::student_level, 250::DECIMAL, 'USD', '8 weeks', 'In-Person & Online', TRUE),
  ('Executive Presence Mastery', 'executive-presence-mastery', 'Command any room with authority and authenticity', 'advanced'::student_level, 400::DECIMAL, 'USD', '12 weeks', 'In-Person & Online', TRUE),
  ('Strategic Influence & Negotiation', 'strategic-influence-negotiation', 'Master high-stakes communication and deal-making', 'advanced'::student_level, 400::DECIMAL, 'USD', '12 weeks', 'In-Person & Online', TRUE)
) AS seed(name, slug, short_description, level, price, currency, duration, delivery_mode, is_active)
WHERE NOT EXISTS (SELECT 1 FROM programs LIMIT 1);


-- ═══════════════════════════════════════════════════════════════════════════
-- ✅ DONE! All tables, policies, storage, and admin account are set up.
-- ═══════════════════════════════════════════════════════════════════════════
