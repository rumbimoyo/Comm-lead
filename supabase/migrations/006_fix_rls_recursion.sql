-- ═══════════════════════════════════════════════════════════════════════════
-- FIX: Infinite Recursion in Profiles RLS Policies
-- Run this AFTER the main migration
-- ═══════════════════════════════════════════════════════════════════════════

-- Step 1: Create a security definer function to safely get user role
-- This bypasses RLS to avoid recursion
CREATE OR REPLACE FUNCTION get_current_user_role()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT role::text FROM profiles WHERE id = auth.uid();
$$;

-- Step 2: Drop the problematic policies
DROP POLICY IF EXISTS "Admins read all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins update all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins insert profiles" ON profiles;
DROP POLICY IF EXISTS "Lecturers view program students" ON profiles;
DROP POLICY IF EXISTS "Students view cohort classmates" ON profiles;

-- Step 3: Recreate policies using the safe function
CREATE POLICY "Admins read all profiles"
  ON profiles FOR SELECT
  USING (get_current_user_role() IN ('admin', 'super_admin'));

CREATE POLICY "Admins update all profiles"
  ON profiles FOR UPDATE
  USING (get_current_user_role() IN ('admin', 'super_admin'));

CREATE POLICY "Admins insert profiles"
  ON profiles FOR INSERT
  WITH CHECK (get_current_user_role() IN ('admin', 'super_admin'));

CREATE POLICY "Lecturers view program students"
  ON profiles FOR SELECT
  USING (
    get_current_user_role() = 'lecturer' AND
    EXISTS (
      SELECT 1 FROM program_lecturers pl
      JOIN enrollments e ON e.program_id = pl.program_id
      WHERE pl.lecturer_id = auth.uid() AND e.user_id = profiles.id
    )
  );

CREATE POLICY "Students view cohort classmates"
  ON profiles FOR SELECT
  USING (
    get_current_user_role() = 'student' AND
    EXISTS (
      SELECT 1 FROM enrollments e1
      JOIN enrollments e2 ON e1.cohort_id = e2.cohort_id
      WHERE e1.user_id = auth.uid() AND e2.user_id = profiles.id
    )
  );

-- Step 4: Also fix any other policies that reference profiles table recursively
-- Check enrollments policies
DROP POLICY IF EXISTS "Admins manage enrollments" ON enrollments;
DROP POLICY IF EXISTS "Lecturers view program enrollments" ON enrollments;

CREATE POLICY "Admins manage enrollments"
  ON enrollments FOR ALL
  USING (get_current_user_role() IN ('admin', 'super_admin'))
  WITH CHECK (get_current_user_role() IN ('admin', 'super_admin'));

CREATE POLICY "Lecturers view program enrollments"
  ON enrollments FOR SELECT
  USING (
    get_current_user_role() = 'lecturer' AND
    EXISTS (
      SELECT 1 FROM program_lecturers pl
      WHERE pl.lecturer_id = auth.uid() AND pl.program_id = enrollments.program_id
    )
  );

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION get_current_user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION get_current_user_role() TO anon;
