-- =====================================================
-- FIX RLS POLICIES FOR COHORT MANAGEMENT
-- Run this in Supabase SQL Editor if adding students/lecturers to cohorts fails
-- =====================================================

-- First, ensure the is_admin_user function exists
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'super_admin')
  );
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.is_admin_user() TO authenticated;

-- =====================================================
-- FIX ENROLLMENTS POLICIES
-- =====================================================

-- Drop all existing enrollment policies
DROP POLICY IF EXISTS "enrollments_select_all" ON enrollments;
DROP POLICY IF EXISTS "enrollments_insert_auth" ON enrollments;
DROP POLICY IF EXISTS "enrollments_update_admin" ON enrollments;
DROP POLICY IF EXISTS "enrollments_delete_admin" ON enrollments;
DROP POLICY IF EXISTS "Users view own enrollments" ON enrollments;
DROP POLICY IF EXISTS "Users create own enrollments" ON enrollments;
DROP POLICY IF EXISTS "Admins manage enrollments" ON enrollments;
DROP POLICY IF EXISTS "Authenticated read enrollments" ON enrollments;
DROP POLICY IF EXISTS "Authenticated update enrollments" ON enrollments;

-- Enable RLS
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can view enrollments
CREATE POLICY "enrollments_select_policy"
ON enrollments FOR SELECT
TO authenticated
USING (true);

-- Users can create their own enrollments, admins can create any
CREATE POLICY "enrollments_insert_policy"
ON enrollments FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid() 
  OR is_admin_user()
);

-- Admins can update any enrollment
CREATE POLICY "enrollments_update_policy"
ON enrollments FOR UPDATE
TO authenticated
USING (is_admin_user())
WITH CHECK (is_admin_user());

-- Admins can delete enrollments
CREATE POLICY "enrollments_delete_policy"
ON enrollments FOR DELETE
TO authenticated
USING (is_admin_user());

-- =====================================================
-- FIX COHORT_LECTURERS POLICIES
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "cohort_lecturers_select_all" ON cohort_lecturers;
DROP POLICY IF EXISTS "cohort_lecturers_admin_manage" ON cohort_lecturers;

-- Enable RLS
ALTER TABLE cohort_lecturers ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can view
CREATE POLICY "cohort_lecturers_select_policy"
ON cohort_lecturers FOR SELECT
TO authenticated
USING (true);

-- Admins can insert
CREATE POLICY "cohort_lecturers_insert_policy"
ON cohort_lecturers FOR INSERT
TO authenticated
WITH CHECK (is_admin_user());

-- Admins can update
CREATE POLICY "cohort_lecturers_update_policy"
ON cohort_lecturers FOR UPDATE
TO authenticated
USING (is_admin_user())
WITH CHECK (is_admin_user());

-- Admins can delete
CREATE POLICY "cohort_lecturers_delete_policy"
ON cohort_lecturers FOR DELETE
TO authenticated
USING (is_admin_user());

-- =====================================================
-- VERIFY
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE '✅ RLS policies fixed for cohort management!';
  RAISE NOTICE 'Enrollments: select, insert, update, delete policies created';
  RAISE NOTICE 'Cohort_lecturers: select, insert, update, delete policies created';
END $$;
