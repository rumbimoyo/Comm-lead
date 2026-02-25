-- ═══════════════════════════════════════════════════════════════════════════
-- COMMLEAD ACADEMY - COMPLETE DATABASE SCHEMA
-- Version: 2.0 (February 2026)
-- 
-- INSTRUCTIONS:
-- 1. Go to Supabase Dashboard → SQL Editor
-- 2. Click "New query"
-- 3. Copy this ENTIRE file and paste it
-- 4. Click "Run"
-- 5. Wait for completion message
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
DROP FUNCTION IF EXISTS update_updated_at() CASCADE;

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
CREATE TABLE program_lecturers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  lecturer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  is_lead BOOLEAN DEFAULT FALSE,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(program_id, lecturer_id)
);

-- ─── ENROLLMENTS TABLE ─────────────────────────────────────────────────────
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

CREATE POLICY "Users read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins read all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins update all profiles"
  ON profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins insert profiles"
  ON profiles FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Lecturers view program students"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM program_lecturers pl
      JOIN enrollments e ON e.program_id = pl.program_id
      WHERE pl.lecturer_id = auth.uid() AND e.user_id = profiles.id
    )
  );

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

CREATE POLICY "Public view active programs"
  ON programs FOR SELECT
  USING (is_active = TRUE);

CREATE POLICY "Admins manage programs"
  ON programs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Lecturers view assigned programs"
  ON programs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM program_lecturers 
      WHERE program_id = programs.id AND lecturer_id = auth.uid()
    )
  );

-- ─── COHORTS POLICIES ──────────────────────────────────────────────────────

CREATE POLICY "Admins manage cohorts"
  ON cohorts FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Lecturers view cohorts"
  ON cohorts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM program_lecturers 
      WHERE program_id = cohorts.program_id AND lecturer_id = auth.uid()
    )
  );

CREATE POLICY "Students view own cohort"
  ON cohorts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM enrollments 
      WHERE cohort_id = cohorts.id AND user_id = auth.uid()
    )
  );

-- ─── PROGRAM LECTURERS POLICIES ────────────────────────────────────────────

CREATE POLICY "Admins manage program lecturers"
  ON program_lecturers FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Lecturers view own assignments"
  ON program_lecturers FOR SELECT
  USING (lecturer_id = auth.uid());

-- ─── ENROLLMENTS POLICIES ──────────────────────────────────────────────────

CREATE POLICY "Users view own enrollments"
  ON enrollments FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users create own enrollments"
  ON enrollments FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins manage enrollments"
  ON enrollments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Lecturers view program enrollments"
  ON enrollments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM program_lecturers 
      WHERE program_id = enrollments.program_id AND lecturer_id = auth.uid()
    )
  );

-- ─── PAYMENT LOGS POLICIES ─────────────────────────────────────────────────

CREATE POLICY "Users view own payments"
  ON payment_logs FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Admins manage payments"
  ON payment_logs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- ─── LESSONS POLICIES ──────────────────────────────────────────────────────

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

CREATE POLICY "Lecturers manage lessons"
  ON lessons FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM program_lecturers 
      WHERE program_id = lessons.program_id AND lecturer_id = auth.uid()
    )
  );

CREATE POLICY "Admins manage lessons"
  ON lessons FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- ─── LESSON PROGRESS POLICIES ──────────────────────────────────────────────

CREATE POLICY "Users manage own progress"
  ON lesson_progress FOR ALL
  USING (user_id = auth.uid());

CREATE POLICY "Lecturers view progress"
  ON lesson_progress FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM lessons l
      JOIN program_lecturers pl ON pl.program_id = l.program_id
      WHERE l.id = lesson_progress.lesson_id AND pl.lecturer_id = auth.uid()
    )
  );

CREATE POLICY "Admins view progress"
  ON lesson_progress FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- ─── ASSIGNMENTS POLICIES ──────────────────────────────────────────────────

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

CREATE POLICY "Lecturers manage assignments"
  ON assignments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM program_lecturers 
      WHERE program_id = assignments.program_id AND lecturer_id = auth.uid()
    )
  );

CREATE POLICY "Admins manage assignments"
  ON assignments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- ─── ASSIGNMENT SUBMISSIONS POLICIES ───────────────────────────────────────

CREATE POLICY "Students manage own submissions"
  ON assignment_submissions FOR ALL
  USING (student_id = auth.uid());

CREATE POLICY "Lecturers grade submissions"
  ON assignment_submissions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM assignments a
      JOIN program_lecturers pl ON pl.program_id = a.program_id
      WHERE a.id = assignment_submissions.assignment_id AND pl.lecturer_id = auth.uid()
    )
  );

CREATE POLICY "Admins manage submissions"
  ON assignment_submissions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- ─── QUIZZES POLICIES ──────────────────────────────────────────────────────

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

CREATE POLICY "Lecturers manage quizzes"
  ON quizzes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM program_lecturers 
      WHERE program_id = quizzes.program_id AND lecturer_id = auth.uid()
    )
  );

CREATE POLICY "Admins manage quizzes"
  ON quizzes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- ─── QUIZ QUESTIONS POLICIES ───────────────────────────────────────────────

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

CREATE POLICY "Lecturers manage questions"
  ON quiz_questions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM quizzes q
      JOIN program_lecturers pl ON pl.program_id = q.program_id
      WHERE q.id = quiz_questions.quiz_id AND pl.lecturer_id = auth.uid()
    )
  );

CREATE POLICY "Admins manage questions"
  ON quiz_questions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- ─── QUIZ ATTEMPTS POLICIES ────────────────────────────────────────────────

CREATE POLICY "Students manage own attempts"
  ON quiz_attempts FOR ALL
  USING (student_id = auth.uid());

CREATE POLICY "Lecturers view attempts"
  ON quiz_attempts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM quizzes q
      JOIN program_lecturers pl ON pl.program_id = q.program_id
      WHERE q.id = quiz_attempts.quiz_id AND pl.lecturer_id = auth.uid()
    )
  );

CREATE POLICY "Admins view attempts"
  ON quiz_attempts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- ─── ATTENDANCE POLICIES ───────────────────────────────────────────────────

CREATE POLICY "Students view own attendance"
  ON attendance FOR SELECT
  USING (student_id = auth.uid());

CREATE POLICY "Lecturers manage attendance"
  ON attendance FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM cohorts c
      JOIN program_lecturers pl ON pl.program_id = c.program_id
      WHERE c.id = attendance.cohort_id AND pl.lecturer_id = auth.uid()
    )
  );

CREATE POLICY "Admins manage attendance"
  ON attendance FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- ─── ANNOUNCEMENTS POLICIES ────────────────────────────────────────────────

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

CREATE POLICY "Lecturers create announcements"
  ON announcements FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM program_lecturers 
      WHERE program_id = announcements.program_id AND lecturer_id = auth.uid()
    )
  );

CREATE POLICY "Admins manage announcements"
  ON announcements FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- ─── PUBLIC CONTENT POLICIES ───────────────────────────────────────────────

CREATE POLICY "Public view team members"
  ON team_members FOR SELECT
  USING (is_active = TRUE);

CREATE POLICY "Admins manage team members"
  ON team_members FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Public view events"
  ON events FOR SELECT
  USING (is_active = TRUE);

CREATE POLICY "Admins manage events"
  ON events FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Public view testimonials"
  ON testimonials FOR SELECT
  USING (is_active = TRUE);

CREATE POLICY "Admins manage testimonials"
  ON testimonials FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Public view website content"
  ON website_content FOR SELECT
  USING (is_active = TRUE);

CREATE POLICY "Admins manage website content"
  ON website_content FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Anyone submit contact form"
  ON contact_submissions FOR INSERT
  WITH CHECK (TRUE);

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

-- ═══════════════════════════════════════════════════════════════════════════
-- DONE! 
-- ═══════════════════════════════════════════════════════════════════════════

-- Verify the setup
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════════════════════════════════';
  RAISE NOTICE '✅ SUCCESS! Database schema created successfully.';
  RAISE NOTICE '═══════════════════════════════════════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE 'Tables created: 20';
  RAISE NOTICE 'RLS policies: 50+';
  RAISE NOTICE 'Seed data: 6 programs, 1 team member, 2 events';
  RAISE NOTICE '';
  RAISE NOTICE 'NEXT STEPS:';
  RAISE NOTICE '1. Sign up a new user at /auth/register';
  RAISE NOTICE '2. Run this to make yourself admin:';
  RAISE NOTICE '   UPDATE profiles SET role = ''admin'', is_approved = TRUE WHERE email = ''your@email.com'';';
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════════════════════════════════';
END $$;
