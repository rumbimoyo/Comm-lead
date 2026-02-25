-- EMERGENCY FIX - RUN THIS NOW
-- This disables problematic policies and creates simple ones

-- Drop ALL policies on profiles to stop recursion
DROP POLICY IF EXISTS "Users read own profile" ON profiles;
DROP POLICY IF EXISTS "Users update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins read all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins update all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins insert profiles" ON profiles;
DROP POLICY IF EXISTS "Lecturers view program students" ON profiles;
DROP POLICY IF EXISTS "Students view cohort classmates" ON profiles;
DROP POLICY IF EXISTS "Allow users to read own profile" ON profiles;
DROP POLICY IF EXISTS "Allow users to update own profile" ON profiles;
DROP POLICY IF EXISTS "Allow authenticated to read all profiles" ON profiles;
DROP POLICY IF EXISTS "Service role full access" ON profiles;

-- Create simple non-recursive policies for profiles
CREATE POLICY "Allow users to read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Allow users to update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Allow authenticated to read all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role full access profiles"
  ON profiles FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Fix enrollments policies
DROP POLICY IF EXISTS "Users view own enrollments" ON enrollments;
DROP POLICY IF EXISTS "Users create own enrollments" ON enrollments;
DROP POLICY IF EXISTS "Admins manage enrollments" ON enrollments;
DROP POLICY IF EXISTS "Lecturers view program enrollments" ON enrollments;

-- Allow users to view their own enrollments
CREATE POLICY "Users view own enrollments"
  ON enrollments FOR SELECT
  USING (auth.uid() = user_id);

-- Allow users to create their own enrollments (for registration)
CREATE POLICY "Users create own enrollments"
  ON enrollments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to read all enrollments (for admin)
CREATE POLICY "Authenticated read enrollments"
  ON enrollments FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated to update enrollments (for admin)
CREATE POLICY "Authenticated update enrollments"
  ON enrollments FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Service role has full access
CREATE POLICY "Service role full access enrollments"
  ON enrollments FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
