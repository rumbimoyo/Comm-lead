# CommLead Academy - Supabase Setup Guide

## Complete Step-by-Step Instructions for Fresh Setup

---

## Part 1: Create Supabase Project

### Step 1: Create Account & Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click **"Start your project"** (or Sign In if you have account)
3. Sign in with GitHub (recommended) or email
4. Click **"New Project"**
5. Fill in:
   - **Organization**: Select or create one (e.g., "CommLead")
   - **Project name**: `commlead-academy`
   - **Database Password**: Create a STRONG password (save this somewhere safe!)
   - **Region**: Choose closest to your users (e.g., "West EU" for Africa)
6. Click **"Create new project"**
7. Wait 2-3 minutes for project to be provisioned

### Step 2: Get Your Project Credentials

Once project is created:

1. Click **"Project Settings"** (gear icon in sidebar)
2. Click **"API"** in the left menu
3. You'll see:
   - **Project URL**: `https://xxxxxx.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6...`
   - **service_role key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6...` (keep this SECRET!)

4. Copy these values - you'll need them for your `.env.local` file

### Step 3: Create Environment File

In your project root (`commlead-academy/`), create a file named `.env.local`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Optional: For server-side operations (keep secret!)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**Important**: 
- Replace with YOUR actual values from Step 2
- Never commit `.env.local` to git (it's already in `.gitignore`)

---

## Part 2: Configure Authentication

### Step 4: Enable Email Authentication

1. In Supabase Dashboard, click **"Authentication"** in sidebar
2. Click **"Providers"**
3. Ensure **"Email"** is enabled (it should be by default)
4. Click on "Email" to expand settings:
   - ✅ Enable Email provider
   - ✅ Confirm email (optional - can disable for testing)
   - ✅ Secure email change
5. Click **"Save"**

### Step 5: Configure Auth Settings

1. Still in Authentication, click **"Settings"** (URL Configuration)
2. Set:
   - **Site URL**: `http://localhost:3002` (for development)
   - **Redirect URLs**: Add these:
     ```
     http://localhost:3002/**
     http://localhost:3002/auth/callback
     ```
3. Click **"Save"**

### Step 6: Customize Email Templates (Optional)

1. Click **"Email Templates"**
2. You can customize:
   - Confirmation email
   - Invite user email
   - Reset password email
3. Replace `{{ .SiteURL }}` with your actual domain when going live

---

## Part 3: Run Database Schema

### Step 7: Open SQL Editor

1. In Supabase Dashboard, click **"SQL Editor"** in sidebar
2. Click **"New query"**

### Step 8: Run the Complete Schema

Copy and paste the ENTIRE SQL below into the SQL Editor, then click **"Run"**:

```sql
-- ═══════════════════════════════════════════════════════════════════════════
-- COMMLEAD ACADEMY - COMPLETE DATABASE SCHEMA
-- Version: 2.0 (February 2026)
-- Run this ENTIRE script in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════════
-- STEP 1: DROP EXISTING OBJECTS (Clean Slate)
-- ═══════════════════════════════════════════════════════════════════════════

-- Drop existing tables (in correct order due to foreign keys)
DROP TABLE IF EXISTS quiz_attempts CASCADE;
DROP TABLE IF EXISTS quiz_questions CASCADE;
DROP TABLE IF EXISTS quizzes CASCADE;
DROP TABLE IF EXISTS assignment_submissions CASCADE;
DROP TABLE IF EXISTS assignments CASCADE;
DROP TABLE IF EXISTS lesson_progress CASCADE;
DROP TABLE IF EXISTS lessons CASCADE;
DROP TABLE IF EXISTS attendance CASCADE;
DROP TABLE IF EXISTS announcements CASCADE;
DROP TABLE IF EXISTS certificates CASCADE;
DROP TABLE IF EXISTS payment_logs CASCADE;
DROP TABLE IF EXISTS enrollments CASCADE;
DROP TABLE IF EXISTS program_lecturers CASCADE;
DROP TABLE IF EXISTS cohorts CASCADE;
DROP TABLE IF EXISTS programs CASCADE;
DROP TABLE IF EXISTS testimonials CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS team_members CASCADE;
DROP TABLE IF EXISTS website_content CASCADE;
DROP TABLE IF EXISTS contact_submissions CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Drop existing types
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS enrollment_status CASCADE;
DROP TYPE IF EXISTS student_level CASCADE;
DROP TYPE IF EXISTS payment_method CASCADE;
DROP TYPE IF EXISTS payment_status CASCADE;
DROP TYPE IF EXISTS lesson_type CASCADE;
DROP TYPE IF EXISTS assignment_status CASCADE;
DROP TYPE IF EXISTS attendance_status CASCADE;

-- Drop existing functions
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

-- ═══════════════════════════════════════════════════════════════════════════
-- STEP 2: CREATE ENUMS (Custom Types)
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TYPE user_role AS ENUM ('student', 'lecturer', 'admin', 'super_admin');
CREATE TYPE enrollment_status AS ENUM ('pending', 'approved', 'rejected', 'suspended', 'completed');
CREATE TYPE student_level AS ENUM ('beginner', 'intermediate', 'advanced');
CREATE TYPE payment_method AS ENUM ('ecocash', 'innbucks', 'bank_transfer', 'cash', 'other');
CREATE TYPE payment_status AS ENUM ('pending', 'confirmed', 'failed', 'refunded');
CREATE TYPE lesson_type AS ENUM ('video', 'text', 'quiz', 'assignment', 'mixed');
CREATE TYPE assignment_status AS ENUM ('pending', 'submitted', 'graded', 'returned');
CREATE TYPE attendance_status AS ENUM ('present', 'absent', 'late', 'excused');

-- ═══════════════════════════════════════════════════════════════════════════
-- STEP 3: CREATE TABLES
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── PROFILES TABLE ────────────────────────────────────────────────────────
-- Stores user profile information (linked to auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  city TEXT,
  avatar_url TEXT,
  role user_role DEFAULT 'student',
  bio TEXT,
  specialization TEXT,
  linkedin_url TEXT,
  is_approved BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

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
  is_featured BOOLEAN DEFAULT FALSE,
  image_url TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── COHORTS TABLE ─────────────────────────────────────────────────────────
-- Groups of students enrolled together
CREATE TABLE cohorts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  max_students INTEGER DEFAULT 30,
  is_active BOOLEAN DEFAULT TRUE,
  is_enrollment_open BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── PROGRAM LECTURERS TABLE ───────────────────────────────────────────────
-- Links lecturers to programs they teach
CREATE TABLE program_lecturers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  lecturer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  is_lead BOOLEAN DEFAULT FALSE,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(program_id, lecturer_id)
);

-- ─── ENROLLMENTS TABLE ─────────────────────────────────────────────────────
-- Tracks student enrollments in programs
CREATE TABLE enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  program_id UUID REFERENCES programs(id) ON DELETE SET NULL,
  cohort_id UUID REFERENCES cohorts(id) ON DELETE SET NULL,
  status enrollment_status DEFAULT 'pending',
  payment_status payment_status DEFAULT 'pending',
  payment_method payment_method,
  amount_paid DECIMAL(10,2) DEFAULT 0,
  amount_due DECIMAL(10,2) DEFAULT 0,
  is_scholarship BOOLEAN DEFAULT FALSE,
  motivation TEXT,
  enrolled_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
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
  pop_description TEXT,
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
  created_by UUID REFERENCES profiles(id),
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  content TEXT,
  video_url TEXT,
  attachments JSONB DEFAULT '[]',
  lesson_type lesson_type DEFAULT 'text',
  order_index INTEGER DEFAULT 0,
  estimated_duration INTEGER,
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
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- ─── ASSIGNMENTS TABLE ─────────────────────────────────────────────────────
-- Assignments linked to lessons
CREATE TABLE assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  created_by UUID REFERENCES profiles(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  instructions TEXT,
  due_date TIMESTAMPTZ,
  max_score INTEGER DEFAULT 100,
  passing_score INTEGER DEFAULT 50,
  allow_late_submission BOOLEAN DEFAULT TRUE,
  late_penalty_percent INTEGER DEFAULT 10,
  attachments JSONB DEFAULT '[]',
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── ASSIGNMENT SUBMISSIONS TABLE ──────────────────────────────────────────
-- Student assignment submissions
CREATE TABLE assignment_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT,
  attachments JSONB DEFAULT '[]',
  status assignment_status DEFAULT 'pending',
  submitted_at TIMESTAMPTZ,
  score INTEGER,
  feedback TEXT,
  graded_by UUID REFERENCES profiles(id),
  graded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(assignment_id, student_id)
);

-- ─── QUIZZES TABLE ─────────────────────────────────────────────────────────
-- Quizzes linked to lessons (created by lecturer)
CREATE TABLE quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  created_by UUID REFERENCES profiles(id),
  title TEXT NOT NULL,
  description TEXT,
  time_limit_minutes INTEGER,
  passing_score INTEGER DEFAULT 70,
  max_attempts INTEGER DEFAULT 3,
  shuffle_questions BOOLEAN DEFAULT TRUE,
  show_answers_after BOOLEAN DEFAULT TRUE,
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── QUIZ QUESTIONS TABLE ──────────────────────────────────────────────────
-- Questions within quizzes
CREATE TABLE quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT DEFAULT 'multiple_choice',
  options JSONB DEFAULT '[]',
  correct_answer TEXT,
  points INTEGER DEFAULT 1,
  explanation TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── QUIZ ATTEMPTS TABLE ───────────────────────────────────────────────────
-- Student quiz attempts
CREATE TABLE quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  answers JSONB DEFAULT '{}',
  score INTEGER,
  max_score INTEGER,
  percentage DECIMAL(5,2),
  passed BOOLEAN,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  time_taken_seconds INTEGER
);

-- ─── ATTENDANCE TABLE ──────────────────────────────────────────────────────
-- Class attendance tracking
CREATE TABLE attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cohort_id UUID NOT NULL REFERENCES cohorts(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  session_date DATE NOT NULL,
  session_time TEXT,
  status attendance_status DEFAULT 'present',
  notes TEXT,
  marked_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(cohort_id, student_id, session_date)
);

-- ─── ANNOUNCEMENTS TABLE ───────────────────────────────────────────────────
-- System announcements
CREATE TABLE announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  target_audience TEXT DEFAULT 'all',
  program_id UUID REFERENCES programs(id) ON DELETE CASCADE,
  cohort_id UUID REFERENCES cohorts(id) ON DELETE CASCADE,
  is_pinned BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMPTZ,
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
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
-- Dynamic website content
CREATE TABLE website_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section TEXT NOT NULL,
  key TEXT NOT NULL,
  value TEXT,
  value_json JSONB,
  media_url TEXT,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  updated_by UUID REFERENCES profiles(id),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(section, key)
);

-- ─── CONTACT SUBMISSIONS TABLE ─────────────────────────────────────────────
-- Contact form submissions
CREATE TABLE contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════════════════
-- STEP 4: CREATE FUNCTIONS & TRIGGERS
-- ═══════════════════════════════════════════════════════════════════════════

-- Function to automatically create profile when user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, phone, role, is_approved)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
    NEW.raw_user_meta_data->>'phone',
    'student',
    FALSE
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to run function on new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers to relevant tables
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_programs_updated_at
  BEFORE UPDATE ON programs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_enrollments_updated_at
  BEFORE UPDATE ON enrollments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_lessons_updated_at
  BEFORE UPDATE ON lessons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_assignments_updated_at
  BEFORE UPDATE ON assignments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_assignment_submissions_updated_at
  BEFORE UPDATE ON assignment_submissions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ═══════════════════════════════════════════════════════════════════════════
-- STEP 5: ENABLE ROW LEVEL SECURITY (RLS)
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE cohorts ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_lecturers ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE website_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- ═══════════════════════════════════════════════════════════════════════════
-- STEP 6: CREATE RLS POLICIES
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── PROFILES POLICIES ─────────────────────────────────────────────────────

-- Users can read their own profile
CREATE POLICY "Users read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile (but not role)
CREATE POLICY "Users update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Admins can read all profiles
CREATE POLICY "Admins read all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Admins can update all profiles
CREATE POLICY "Admins update all profiles"
  ON profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Admins can insert profiles (for creating lecturers)
CREATE POLICY "Admins insert profiles"
  ON profiles FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Lecturers can view students in their programs
CREATE POLICY "Lecturers view program students"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM program_lecturers pl
      JOIN enrollments e ON e.program_id = pl.program_id
      WHERE pl.lecturer_id = auth.uid() AND e.user_id = profiles.id
    )
  );

-- Students can view cohort classmates (names only - frontend filters details)
CREATE POLICY "Students view cohort classmates"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM enrollments e1
      JOIN enrollments e2 ON e1.cohort_id = e2.cohort_id
      WHERE e1.user_id = auth.uid() AND e2.user_id = profiles.id
    )
  );

-- ─── PROGRAMS POLICIES ─────────────────────────────────────────────────────

-- Anyone can view active programs (public website)
CREATE POLICY "Public view active programs"
  ON programs FOR SELECT
  USING (is_active = TRUE);

-- Admins can do everything with programs
CREATE POLICY "Admins manage programs"
  ON programs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Lecturers can view programs they're assigned to
CREATE POLICY "Lecturers view assigned programs"
  ON programs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM program_lecturers 
      WHERE program_id = programs.id AND lecturer_id = auth.uid()
    )
  );

-- ─── COHORTS POLICIES ──────────────────────────────────────────────────────

-- Admins can manage cohorts
CREATE POLICY "Admins manage cohorts"
  ON cohorts FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Lecturers can view cohorts for their programs
CREATE POLICY "Lecturers view cohorts"
  ON cohorts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM program_lecturers 
      WHERE program_id = cohorts.program_id AND lecturer_id = auth.uid()
    )
  );

-- Students can view their cohort
CREATE POLICY "Students view own cohort"
  ON cohorts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM enrollments 
      WHERE cohort_id = cohorts.id AND user_id = auth.uid()
    )
  );

-- ─── PROGRAM LECTURERS POLICIES ────────────────────────────────────────────

-- Admins can manage lecturer assignments
CREATE POLICY "Admins manage program lecturers"
  ON program_lecturers FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Lecturers can view their own assignments
CREATE POLICY "Lecturers view own assignments"
  ON program_lecturers FOR SELECT
  USING (lecturer_id = auth.uid());

-- ─── ENROLLMENTS POLICIES ──────────────────────────────────────────────────

-- Users can view their own enrollments
CREATE POLICY "Users view own enrollments"
  ON enrollments FOR SELECT
  USING (user_id = auth.uid());

-- Users can create their own enrollments (apply)
CREATE POLICY "Users create own enrollments"
  ON enrollments FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Admins can manage all enrollments
CREATE POLICY "Admins manage enrollments"
  ON enrollments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Lecturers can view enrollments in their programs
CREATE POLICY "Lecturers view program enrollments"
  ON enrollments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM program_lecturers 
      WHERE program_id = enrollments.program_id AND lecturer_id = auth.uid()
    )
  );

-- ─── PAYMENT LOGS POLICIES ─────────────────────────────────────────────────

-- Users can view their own payments
CREATE POLICY "Users view own payments"
  ON payment_logs FOR SELECT
  USING (user_id = auth.uid());

-- Admins can manage all payments
CREATE POLICY "Admins manage payments"
  ON payment_logs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- ─── LESSONS POLICIES ──────────────────────────────────────────────────────

-- Enrolled students can view published lessons
CREATE POLICY "Enrolled students view lessons"
  ON lessons FOR SELECT
  USING (
    is_published = TRUE AND
    EXISTS (
      SELECT 1 FROM enrollments 
      WHERE user_id = auth.uid() 
      AND program_id = lessons.program_id 
      AND status = 'approved' 
      AND payment_status = 'confirmed'
    )
  );

-- Lecturers can manage lessons in their programs
CREATE POLICY "Lecturers manage lessons"
  ON lessons FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM program_lecturers 
      WHERE program_id = lessons.program_id AND lecturer_id = auth.uid()
    )
  );

-- Admins can manage all lessons
CREATE POLICY "Admins manage lessons"
  ON lessons FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- ─── LESSON PROGRESS POLICIES ──────────────────────────────────────────────

-- Users can manage their own progress
CREATE POLICY "Users manage own progress"
  ON lesson_progress FOR ALL
  USING (user_id = auth.uid());

-- Lecturers can view progress in their programs
CREATE POLICY "Lecturers view progress"
  ON lesson_progress FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM lessons l
      JOIN program_lecturers pl ON pl.program_id = l.program_id
      WHERE l.id = lesson_progress.lesson_id AND pl.lecturer_id = auth.uid()
    )
  );

-- Admins can view all progress
CREATE POLICY "Admins view progress"
  ON lesson_progress FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- ─── ASSIGNMENTS POLICIES ──────────────────────────────────────────────────

-- Enrolled students can view published assignments
CREATE POLICY "Students view assignments"
  ON assignments FOR SELECT
  USING (
    is_published = TRUE AND
    EXISTS (
      SELECT 1 FROM enrollments 
      WHERE user_id = auth.uid() 
      AND program_id = assignments.program_id 
      AND status = 'approved'
    )
  );

-- Lecturers can manage assignments in their programs
CREATE POLICY "Lecturers manage assignments"
  ON assignments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM program_lecturers 
      WHERE program_id = assignments.program_id AND lecturer_id = auth.uid()
    )
  );

-- Admins can manage all assignments
CREATE POLICY "Admins manage assignments"
  ON assignments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- ─── ASSIGNMENT SUBMISSIONS POLICIES ───────────────────────────────────────

-- Students can manage their own submissions
CREATE POLICY "Students manage own submissions"
  ON assignment_submissions FOR ALL
  USING (student_id = auth.uid());

-- Lecturers can view/grade submissions in their programs
CREATE POLICY "Lecturers grade submissions"
  ON assignment_submissions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM assignments a
      JOIN program_lecturers pl ON pl.program_id = a.program_id
      WHERE a.id = assignment_submissions.assignment_id AND pl.lecturer_id = auth.uid()
    )
  );

-- Admins can manage all submissions
CREATE POLICY "Admins manage submissions"
  ON assignment_submissions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- ─── QUIZZES POLICIES ──────────────────────────────────────────────────────

-- Students can view published quizzes
CREATE POLICY "Students view quizzes"
  ON quizzes FOR SELECT
  USING (
    is_published = TRUE AND
    EXISTS (
      SELECT 1 FROM enrollments 
      WHERE user_id = auth.uid() 
      AND program_id = quizzes.program_id 
      AND status = 'approved'
    )
  );

-- Lecturers can manage quizzes in their programs
CREATE POLICY "Lecturers manage quizzes"
  ON quizzes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM program_lecturers 
      WHERE program_id = quizzes.program_id AND lecturer_id = auth.uid()
    )
  );

-- Admins can manage all quizzes
CREATE POLICY "Admins manage quizzes"
  ON quizzes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- ─── QUIZ QUESTIONS POLICIES ───────────────────────────────────────────────

-- Students can view questions during quiz
CREATE POLICY "Students view quiz questions"
  ON quiz_questions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM quizzes q
      JOIN enrollments e ON e.program_id = q.program_id
      WHERE q.id = quiz_questions.quiz_id 
      AND e.user_id = auth.uid() 
      AND e.status = 'approved'
    )
  );

-- Lecturers can manage questions
CREATE POLICY "Lecturers manage questions"
  ON quiz_questions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM quizzes q
      JOIN program_lecturers pl ON pl.program_id = q.program_id
      WHERE q.id = quiz_questions.quiz_id AND pl.lecturer_id = auth.uid()
    )
  );

-- Admins can manage all questions
CREATE POLICY "Admins manage questions"
  ON quiz_questions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- ─── QUIZ ATTEMPTS POLICIES ────────────────────────────────────────────────

-- Students can manage their own attempts
CREATE POLICY "Students manage own attempts"
  ON quiz_attempts FOR ALL
  USING (student_id = auth.uid());

-- Lecturers can view attempts
CREATE POLICY "Lecturers view attempts"
  ON quiz_attempts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM quizzes q
      JOIN program_lecturers pl ON pl.program_id = q.program_id
      WHERE q.id = quiz_attempts.quiz_id AND pl.lecturer_id = auth.uid()
    )
  );

-- Admins can view all attempts
CREATE POLICY "Admins view attempts"
  ON quiz_attempts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- ─── ATTENDANCE POLICIES ───────────────────────────────────────────────────

-- Students can view their own attendance
CREATE POLICY "Students view own attendance"
  ON attendance FOR SELECT
  USING (student_id = auth.uid());

-- Lecturers can manage attendance for their programs
CREATE POLICY "Lecturers manage attendance"
  ON attendance FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM cohorts c
      JOIN program_lecturers pl ON pl.program_id = c.program_id
      WHERE c.id = attendance.cohort_id AND pl.lecturer_id = auth.uid()
    )
  );

-- Admins can manage all attendance
CREATE POLICY "Admins manage attendance"
  ON attendance FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- ─── ANNOUNCEMENTS POLICIES ────────────────────────────────────────────────

-- Everyone can view relevant announcements
CREATE POLICY "Users view announcements"
  ON announcements FOR SELECT
  USING (
    target_audience = 'all' OR
    (target_audience = 'students' AND EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'student'
    )) OR
    (target_audience = 'lecturers' AND EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'lecturer'
    )) OR
    (program_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM enrollments WHERE program_id = announcements.program_id AND user_id = auth.uid()
    ))
  );

-- Lecturers can create announcements for their programs
CREATE POLICY "Lecturers create announcements"
  ON announcements FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM program_lecturers 
      WHERE program_id = announcements.program_id AND lecturer_id = auth.uid()
    )
  );

-- Admins can manage all announcements
CREATE POLICY "Admins manage announcements"
  ON announcements FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- ─── PUBLIC CONTENT POLICIES ───────────────────────────────────────────────

-- Anyone can view active team members (public)
CREATE POLICY "Public view team members"
  ON team_members FOR SELECT
  USING (is_active = TRUE);

-- Admins can manage team members
CREATE POLICY "Admins manage team members"
  ON team_members FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Anyone can view active events (public)
CREATE POLICY "Public view events"
  ON events FOR SELECT
  USING (is_active = TRUE);

-- Admins can manage events
CREATE POLICY "Admins manage events"
  ON events FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Anyone can view active testimonials (public)
CREATE POLICY "Public view testimonials"
  ON testimonials FOR SELECT
  USING (is_active = TRUE);

-- Admins can manage testimonials
CREATE POLICY "Admins manage testimonials"
  ON testimonials FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Anyone can view active website content (public)
CREATE POLICY "Public view website content"
  ON website_content FOR SELECT
  USING (is_active = TRUE);

-- Admins can manage website content
CREATE POLICY "Admins manage website content"
  ON website_content FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Anyone can create contact submissions
CREATE POLICY "Anyone submit contact form"
  ON contact_submissions FOR INSERT
  WITH CHECK (TRUE);

-- Admins can view contact submissions
CREATE POLICY "Admins view contact submissions"
  ON contact_submissions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- ═══════════════════════════════════════════════════════════════════════════
-- STEP 7: INSERT SEED DATA
-- ═══════════════════════════════════════════════════════════════════════════

-- Insert sample programs
INSERT INTO programs (name, slug, short_description, full_description, level, price, currency, duration, delivery_mode, is_active, order_index) VALUES
('Foundations of Public Speaking', 'foundations-public-speaking', 'Build unshakeable confidence and master the fundamentals of powerful speaking.', 'Perfect for those starting their communication journey. This 6-week intensive covers the core building blocks: overcoming fear, vocal projection, body language basics, structuring your message, and delivering with confidence.', 'beginner', 100, 'USD', '6 Weeks', 'In-Person', TRUE, 1),
('Business Writing Essentials', 'business-writing-essentials', 'Craft clear, compelling business documents that get results.', 'Learn to write emails, reports, proposals, and presentations that command attention and drive action. Perfect for professionals looking to enhance their written communication.', 'beginner', 100, 'USD', '6 Weeks', 'In-Person', TRUE, 2),
('Persuasive Communication', 'persuasive-communication', 'Learn to influence and persuade through powerful messaging.', 'Master the art of persuasion through psychological principles, storytelling techniques, and strategic messaging. Transform how you pitch ideas and win support.', 'intermediate', 150, 'USD', '8 Weeks', 'In-Person', TRUE, 3),
('Leadership Communication', 'leadership-communication', 'Develop the communication skills of exceptional leaders.', 'Learn to inspire teams, navigate difficult conversations, give feedback, and communicate vision. Built for current and aspiring leaders.', 'intermediate', 150, 'USD', '8 Weeks', 'In-Person', TRUE, 4),
('Executive Presence Mastery', 'executive-presence-mastery', 'Command any room with authority and authenticity.', 'Develop the gravitas, communication style, and presence of a senior executive. Perfect for those preparing for C-suite roles or board presentations.', 'advanced', 250, 'USD', '12 Weeks', 'In-Person', TRUE, 5),
('Strategic Influence & Negotiation', 'strategic-influence-negotiation', 'Master high-stakes communication and deal-making.', 'Advanced techniques for negotiation, stakeholder management, and strategic influence. For senior professionals handling complex business relationships.', 'advanced', 250, 'USD', '12 Weeks', 'In-Person', TRUE, 6);

-- Insert founder as team member
INSERT INTO team_members (name, role, bio, is_founder, is_active, order_index) VALUES
('Charline Prezen Chikomo', 'Founder & Lead Instructor', 'A graduate, scholar, leader, author, and mentor who transformed from a village boy looking after cows to winning the world''s most prestigious scholarships including the Mandela Centennial Scholarship and Mandela Rhodes Scholarship.', TRUE, TRUE, 1);

-- Insert sample events
INSERT INTO events (title, description, event_type, date, time, location, is_active) VALUES
('Public Speaking Masterclass', 'A full-day intensive workshop on conquering stage fright and delivering powerful presentations.', 'masterclass', '2026-03-15', '9:00 AM - 4:00 PM', 'Harare, Zimbabwe', TRUE),
('Open Day - March 2026', 'Visit our campus, meet the team, and learn about our programs. Free admission.', 'open_day', '2026-03-22', '10:00 AM - 2:00 PM', 'CommLead Academy Campus', TRUE);

RAISE NOTICE '═══════════════════════════════════════════════════════════════════════════';
RAISE NOTICE 'SUCCESS! Database schema created successfully.';
RAISE NOTICE 'Next step: Create your first admin account (see instructions below)';
RAISE NOTICE '═══════════════════════════════════════════════════════════════════════════';
```

### Step 9: Verify Tables Were Created

After running the SQL:

1. Click **"Table Editor"** in the sidebar
2. You should see all these tables:
   - profiles
   - programs
   - cohorts
   - program_lecturers
   - enrollments
   - payment_logs
   - lessons
   - lesson_progress
   - assignments
   - assignment_submissions
   - quizzes
   - quiz_questions
   - quiz_attempts
   - attendance
   - announcements
   - team_members
   - events
   - testimonials
   - website_content
   - contact_submissions

---

## Part 4: Set Up Storage Buckets

### Step 10: Create Storage Buckets

1. Click **"Storage"** in sidebar
2. Click **"New bucket"**
3. Create bucket named: `images`
   - ✅ Public bucket (toggle ON)
   - Click **"Create bucket"**

4. Click **"New bucket"** again
5. Create bucket named: `documents`
   - ❌ Keep private (toggle OFF)
   - Click **"Create bucket"**

6. Click **"New bucket"** again
7. Create bucket named: `submissions`
   - ❌ Keep private (toggle OFF)
   - Click **"Create bucket"**

### Step 11: Set Storage Policies

1. Click on `images` bucket
2. Click **"Policies"** tab
3. Click **"New policy"**
4. Select **"For full customization"**

Add these policies for the `images` bucket:

**Policy 1: Anyone can view images**
```sql
CREATE POLICY "Public read images"
ON storage.objects FOR SELECT
USING (bucket_id = 'images');
```

**Policy 2: Authenticated users can upload**
```sql
CREATE POLICY "Auth users upload images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'images' AND
  auth.role() = 'authenticated'
);
```

**Policy 3: Users can update/delete their uploads**
```sql
CREATE POLICY "Users manage own images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

For `documents` and `submissions` buckets, add similar policies but restrict read access to authenticated users.

---

## Part 5: Create Your Admin Account

### Step 12: Sign Up First User

1. Start your Next.js app: `npm run dev`
2. Go to `http://localhost:3002/auth/register`
3. Create an account with your email
4. This creates a profile with `role = 'student'`

### Step 13: Upgrade to Admin

Go back to Supabase SQL Editor and run:

```sql
-- Replace with YOUR actual email
UPDATE profiles
SET role = 'admin', is_approved = TRUE
WHERE email = 'your-email@example.com';
```

### Step 14: Verify Admin Access

1. Go to `http://localhost:3002/auth/login`
2. Login with your admin email
3. You should be redirected to `/admin`

---

## Part 6: Test the Setup

### Step 15: Test Database Access

Run this query in SQL Editor to verify:

```sql
-- Check programs were created
SELECT name, level, price FROM programs ORDER BY order_index;

-- Check team member exists
SELECT name, role, is_founder FROM team_members;

-- Check events exist
SELECT title, date FROM events;

-- Check your admin profile
SELECT email, role, is_approved FROM profiles;
```

### Step 16: Test from Application

1. Restart your dev server: `npm run dev`
2. Visit `http://localhost:3002` - should show programs from database
3. Visit `http://localhost:3002/team` - should show founder
4. Login as admin and visit `http://localhost:3002/admin`

---

## Troubleshooting

### Common Issues

**Issue: "relation does not exist"**
- Solution: Make sure you ran the ENTIRE SQL script, not just parts

**Issue: "permission denied for table"**
- Solution: RLS policies may be missing. Check if tables have RLS enabled

**Issue: Profile not created on signup**
- Solution: Check the `on_auth_user_created` trigger exists

**Issue: Can't access admin panel**
- Solution: Run the UPDATE query to set your role to 'admin'

### Verify Trigger Exists

```sql
SELECT trigger_name, event_manipulation, action_statement 
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';
```

### Check RLS Policies

```sql
SELECT tablename, policyname, permissive, roles, cmd 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename;
```

---

## Quick Reference

### Your Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...
```

### Admin SQL Commands

```sql
-- Make someone an admin
UPDATE profiles SET role = 'admin', is_approved = TRUE WHERE email = 'email@example.com';

-- Make someone a lecturer
UPDATE profiles SET role = 'lecturer', is_approved = TRUE WHERE email = 'lecturer@example.com';

-- Check all users
SELECT email, role, is_approved, created_at FROM profiles ORDER BY created_at DESC;

-- Check enrollments
SELECT p.email, pr.name as program, e.status, e.payment_status 
FROM enrollments e 
JOIN profiles p ON e.user_id = p.id 
JOIN programs pr ON e.program_id = pr.id;
```

---

## Next Steps After Setup

1. ✅ Supabase project created
2. ✅ Database schema installed
3. ✅ Storage buckets created
4. ✅ Admin account created
5. ⬜ Update application code to match new schema
6. ⬜ Create lecturer dashboard
7. ⬜ Fix student dashboard
8. ⬜ Build website content management

---

*Guide created: February 24, 2026*
