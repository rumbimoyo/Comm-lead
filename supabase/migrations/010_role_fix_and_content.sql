-- ============================================================================
-- MIGRATION 010: Fix Role Assignment & Create Cohort Content System
-- ============================================================================

-- ─── FIX: UPDATE handle_new_user TO READ ROLE FROM METADATA ─────────────────
-- This fixes the issue where lecturers were being registered as students

DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role_text TEXT;
  final_role user_role;
BEGIN
  -- Read role from user metadata
  user_role_text := COALESCE(NEW.raw_user_meta_data->>'role', 'student');
  
  -- Validate and convert to enum - only allow student or lecturer from registration
  IF user_role_text = 'lecturer' THEN
    final_role := 'lecturer'::user_role;
  ELSE
    final_role := 'student'::user_role;
  END IF;

  INSERT INTO public.profiles (id, email, full_name, phone, role, is_approved, is_active)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
    NEW.raw_user_meta_data->>'phone',
    final_role,
    FALSE, -- Both students and lecturers need approval
    TRUE
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    role = EXCLUDED.role;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-create trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ─── COHORT CONTENT TABLES ──────────────────────────────────────────────────

-- Cohort Announcements (Lecturer posts to specific cohort)
CREATE TABLE IF NOT EXISTS cohort_announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cohort_id UUID NOT NULL REFERENCES cohorts(id) ON DELETE CASCADE,
  lecturer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  is_pinned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cohort Materials (Notes, Slides, Resources)
CREATE TABLE IF NOT EXISTS cohort_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cohort_id UUID NOT NULL REFERENCES cohorts(id) ON DELETE CASCADE,
  lecturer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  material_type TEXT NOT NULL CHECK (material_type IN ('notes', 'slides', 'video', 'document', 'link', 'other')),
  file_url TEXT,
  external_url TEXT,
  order_index INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cohort Tasks/Assignments (Lecturer assigns to cohort)
CREATE TABLE IF NOT EXISTS cohort_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cohort_id UUID NOT NULL REFERENCES cohorts(id) ON DELETE CASCADE,
  lecturer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  instructions TEXT,
  due_date TIMESTAMPTZ,
  points INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Student Task Submissions
CREATE TABLE IF NOT EXISTS task_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES cohort_tasks(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT,
  file_url TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  grade NUMERIC(5, 2),
  feedback TEXT,
  graded_at TIMESTAMPTZ,
  graded_by UUID REFERENCES profiles(id),
  status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted', 'graded', 'returned', 'resubmitted')),
  UNIQUE(task_id, student_id)
);

-- ─── INDEXES ────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_cohort_announcements_cohort ON cohort_announcements(cohort_id);
CREATE INDEX IF NOT EXISTS idx_cohort_materials_cohort ON cohort_materials(cohort_id);
CREATE INDEX IF NOT EXISTS idx_cohort_tasks_cohort ON cohort_tasks(cohort_id);
CREATE INDEX IF NOT EXISTS idx_task_submissions_task ON task_submissions(task_id);
CREATE INDEX IF NOT EXISTS idx_task_submissions_student ON task_submissions(student_id);

-- ─── RLS POLICIES ───────────────────────────────────────────────────────────

-- Enable RLS
ALTER TABLE cohort_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE cohort_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE cohort_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_submissions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "view_cohort_announcements" ON cohort_announcements;
DROP POLICY IF EXISTS "manage_cohort_announcements" ON cohort_announcements;
DROP POLICY IF EXISTS "view_cohort_materials" ON cohort_materials;
DROP POLICY IF EXISTS "manage_cohort_materials" ON cohort_materials;
DROP POLICY IF EXISTS "view_cohort_tasks" ON cohort_tasks;
DROP POLICY IF EXISTS "manage_cohort_tasks" ON cohort_tasks;
DROP POLICY IF EXISTS "view_own_submissions" ON task_submissions;
DROP POLICY IF EXISTS "create_submission" ON task_submissions;
DROP POLICY IF EXISTS "lecturer_view_submissions" ON task_submissions;
DROP POLICY IF EXISTS "lecturer_grade_submissions" ON task_submissions;

-- Cohort Announcements Policies
CREATE POLICY "view_cohort_announcements" ON cohort_announcements
  FOR SELECT USING (
    -- Admins can view all
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
    OR
    -- Lecturers assigned to this cohort
    EXISTS (SELECT 1 FROM cohort_lecturers WHERE cohort_id = cohort_announcements.cohort_id AND lecturer_id = auth.uid())
    OR
    -- Students enrolled in this cohort
    EXISTS (SELECT 1 FROM enrollments WHERE cohort_id = cohort_announcements.cohort_id AND user_id = auth.uid())
  );

CREATE POLICY "manage_cohort_announcements" ON cohort_announcements
  FOR ALL USING (
    -- Admins can manage all
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
    OR
    -- Lecturers assigned to this cohort can manage
    EXISTS (SELECT 1 FROM cohort_lecturers WHERE cohort_id = cohort_announcements.cohort_id AND lecturer_id = auth.uid())
  );

-- Cohort Materials Policies
CREATE POLICY "view_cohort_materials" ON cohort_materials
  FOR SELECT USING (
    -- Admins can view all
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
    OR
    -- Lecturers assigned to this cohort
    (is_published = TRUE OR EXISTS (SELECT 1 FROM cohort_lecturers WHERE cohort_id = cohort_materials.cohort_id AND lecturer_id = auth.uid()))
    AND
    -- Students enrolled can see published materials
    (
      EXISTS (SELECT 1 FROM cohort_lecturers WHERE cohort_id = cohort_materials.cohort_id AND lecturer_id = auth.uid())
      OR EXISTS (SELECT 1 FROM enrollments WHERE cohort_id = cohort_materials.cohort_id AND user_id = auth.uid() AND is_published = TRUE)
    )
  );

CREATE POLICY "manage_cohort_materials" ON cohort_materials
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
    OR EXISTS (SELECT 1 FROM cohort_lecturers WHERE cohort_id = cohort_materials.cohort_id AND lecturer_id = auth.uid())
  );

-- Cohort Tasks Policies
CREATE POLICY "view_cohort_tasks" ON cohort_tasks
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
    OR EXISTS (SELECT 1 FROM cohort_lecturers WHERE cohort_id = cohort_tasks.cohort_id AND lecturer_id = auth.uid())
    OR (
      is_published = TRUE 
      AND EXISTS (SELECT 1 FROM enrollments WHERE cohort_id = cohort_tasks.cohort_id AND user_id = auth.uid())
    )
  );

CREATE POLICY "manage_cohort_tasks" ON cohort_tasks
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
    OR EXISTS (SELECT 1 FROM cohort_lecturers WHERE cohort_id = cohort_tasks.cohort_id AND lecturer_id = auth.uid())
  );

-- Task Submissions Policies
CREATE POLICY "view_own_submissions" ON task_submissions
  FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "create_submission" ON task_submissions
  FOR INSERT WITH CHECK (
    student_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM cohort_tasks t
      JOIN enrollments e ON e.cohort_id = t.cohort_id
      WHERE t.id = task_id AND e.user_id = auth.uid()
    )
  );

CREATE POLICY "lecturer_view_submissions" ON task_submissions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM cohort_tasks t
      JOIN cohort_lecturers cl ON cl.cohort_id = t.cohort_id
      WHERE t.id = task_id AND cl.lecturer_id = auth.uid()
    )
  );

CREATE POLICY "lecturer_grade_submissions" ON task_submissions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM cohort_tasks t
      JOIN cohort_lecturers cl ON cl.cohort_id = t.cohort_id
      WHERE t.id = task_id AND cl.lecturer_id = auth.uid()
    )
  );

-- ─── GRANT ADMIN FULL ACCESS ────────────────────────────────────────────────
DROP POLICY IF EXISTS "admin_full_access_cohort_announcements" ON cohort_announcements;
DROP POLICY IF EXISTS "admin_full_access_cohort_materials" ON cohort_materials;
DROP POLICY IF EXISTS "admin_full_access_cohort_tasks" ON cohort_tasks;
DROP POLICY IF EXISTS "admin_full_access_task_submissions" ON task_submissions;

CREATE POLICY "admin_full_access_cohort_announcements" ON cohort_announcements
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

CREATE POLICY "admin_full_access_cohort_materials" ON cohort_materials
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

CREATE POLICY "admin_full_access_cohort_tasks" ON cohort_tasks
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

CREATE POLICY "admin_full_access_task_submissions" ON task_submissions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );
