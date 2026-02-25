-- ═══════════════════════════════════════════════════════════════════════════
-- COMMLEAD ACADEMY DATABASE SCHEMA
-- Run this in your Supabase SQL Editor to set up all required tables
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── ENUMS ─────────────────────────────────────────────────────────────────
CREATE TYPE user_role AS ENUM ('student', 'admin');
CREATE TYPE enrollment_status AS ENUM ('pending', 'approved', 'rejected', 'suspended');
CREATE TYPE student_level AS ENUM ('beginner', 'intermediate', 'advanced');
CREATE TYPE payment_method AS ENUM ('ecocash', 'innbucks', 'bank_transfer', 'scholarship');
CREATE TYPE payment_status AS ENUM ('pending', 'confirmed', 'failed', 'refunded');
CREATE TYPE lesson_type AS ENUM ('video', 'text', 'quiz', 'assignment');

-- ─── PROFILES TABLE ────────────────────────────────────────────────────────
-- Stores user profile information (linked to auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT,
  city TEXT,
  avatar_url TEXT,
  role user_role DEFAULT 'student',
  is_approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile when user signs up
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

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ─── PROGRAMS TABLE ────────────────────────────────────────────────────────
-- Stores program/course information
CREATE TABLE programs (
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

-- ─── ENROLLMENTS TABLE ─────────────────────────────────────────────────────
-- Tracks student enrollments in programs
CREATE TABLE enrollments (
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

-- ─── PAYMENT LOGS TABLE ────────────────────────────────────────────────────
-- Records all payment transactions
CREATE TABLE payment_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id UUID REFERENCES enrollments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  method payment_method,
  status payment_status DEFAULT 'pending',
  reference TEXT,
  confirmed_by UUID REFERENCES profiles(id),
  confirmed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── LESSONS TABLE ─────────────────────────────────────────────────────────
-- Course content/lessons
CREATE TABLE lessons (
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

-- ─── LESSON PROGRESS TABLE ─────────────────────────────────────────────────
-- Tracks student progress through lessons
CREATE TABLE lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT FALSE,
  score INTEGER,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- ─── TEAM MEMBERS TABLE ────────────────────────────────────────────────────
-- Website team display
CREATE TABLE team_members (
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

-- ─── EVENTS TABLE ──────────────────────────────────────────────────────────
-- Events and workshops
CREATE TABLE events (
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

-- ─── TESTIMONIALS TABLE ────────────────────────────────────────────────────
-- Student testimonials
CREATE TABLE testimonials (
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

-- ─── WEBSITE CONTENT TABLE ─────────────────────────────────────────────────
-- Dynamic website content (about, etc.)
CREATE TABLE website_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section TEXT UNIQUE NOT NULL,
  content JSONB DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY POLICIES
-- ═══════════════════════════════════════════════════════════════════════════

-- Enable RLS on all tables
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

-- ─── PROFILES POLICIES ─────────────────────────────────────────────────────
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ─── PROGRAMS POLICIES ─────────────────────────────────────────────────────
CREATE POLICY "Anyone can view active programs"
  ON programs FOR SELECT
  USING (is_active = TRUE);

CREATE POLICY "Admins can manage programs"
  ON programs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ─── ENROLLMENTS POLICIES ──────────────────────────────────────────────────
CREATE POLICY "Users can view own enrollments"
  ON enrollments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own enrollments"
  ON enrollments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all enrollments"
  ON enrollments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ─── PAYMENT LOGS POLICIES ─────────────────────────────────────────────────
CREATE POLICY "Users can view own payments"
  ON payment_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all payments"
  ON payment_logs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ─── LESSONS POLICIES ──────────────────────────────────────────────────────
CREATE POLICY "Enrolled students can view lessons"
  ON lessons FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM enrollments e
      WHERE e.user_id = auth.uid()
      AND e.program_id = lessons.program_id
      AND e.status = 'approved'
      AND e.payment_status = 'confirmed'
    )
  );

CREATE POLICY "Admins can manage lessons"
  ON lessons FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ─── LESSON PROGRESS POLICIES ──────────────────────────────────────────────
CREATE POLICY "Users can manage own progress"
  ON lesson_progress FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all progress"
  ON lesson_progress FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ─── PUBLIC CONTENT POLICIES ───────────────────────────────────────────────
CREATE POLICY "Anyone can view team members"
  ON team_members FOR SELECT
  USING (is_active = TRUE);

CREATE POLICY "Anyone can view events"
  ON events FOR SELECT
  USING (is_active = TRUE);

CREATE POLICY "Anyone can view testimonials"
  ON testimonials FOR SELECT
  USING (is_active = TRUE);

CREATE POLICY "Anyone can view website content"
  ON website_content FOR SELECT
  USING (TRUE);

CREATE POLICY "Admins can manage team members"
  ON team_members FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage events"
  ON events FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage testimonials"
  ON testimonials FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage website content"
  ON website_content FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ═══════════════════════════════════════════════════════════════════════════
-- SEED DATA - INITIAL PROGRAMS
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO programs (name, slug, short_description, level, price, currency, duration, delivery_mode, is_active) VALUES
('Public Speaking Foundations', 'public-speaking-foundations', 'Master the basics of confident public speaking', 'beginner', 150, 'USD', '6 weeks', 'In-Person & Online', TRUE),
('Persuasive Communication', 'persuasive-communication', 'Learn to influence and persuade through powerful messaging', 'beginner', 150, 'USD', '6 weeks', 'In-Person & Online', TRUE),
('Advanced Presentation Skills', 'advanced-presentation-skills', 'Elevate your presentation delivery to executive level', 'intermediate', 250, 'USD', '8 weeks', 'In-Person & Online', TRUE),
('Leadership Communication', 'leadership-communication', 'Develop the communication skills of exceptional leaders', 'intermediate', 250, 'USD', '8 weeks', 'In-Person & Online', TRUE),
('Executive Presence Mastery', 'executive-presence-mastery', 'Command any room with authority and authenticity', 'advanced', 400, 'USD', '12 weeks', 'In-Person & Online', TRUE),
('Strategic Influence & Negotiation', 'strategic-influence-negotiation', 'Master high-stakes communication and deal-making', 'advanced', 400, 'USD', '12 weeks', 'In-Person & Online', TRUE);

-- ═══════════════════════════════════════════════════════════════════════════
-- CREATE YOUR ADMIN ACCOUNT
-- Run this after you've signed up with your email to make yourself admin
-- Replace 'your-email@example.com' with your actual email
-- ═══════════════════════════════════════════════════════════════════════════

-- UPDATE profiles 
-- SET role = 'admin', is_approved = TRUE 
-- WHERE email = 'your-email@example.com';
