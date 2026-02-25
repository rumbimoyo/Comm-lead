-- =====================================================
-- COMPREHENSIVE COHORT MANAGEMENT FIX
-- Run this ENTIRE script in Supabase SQL Editor
-- =====================================================

-- Step 1: Create or replace admin check function
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
    AND is_approved = true
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_admin_user() TO authenticated;

-- Step 2: Drop ALL existing policies completely
DO $$
DECLARE
    pol RECORD;
BEGIN
    -- Drop all enrollment policies
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'enrollments' LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || pol.policyname || '" ON enrollments';
    END LOOP;
    
    -- Drop all cohort_lecturers policies  
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'cohort_lecturers' LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || pol.policyname || '" ON cohort_lecturers';
    END LOOP;
    
    -- Drop all profiles policies
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'profiles' LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || pol.policyname || '" ON profiles';
    END LOOP;
END $$;

-- Step 3: Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE cohort_lecturers ENABLE ROW LEVEL SECURITY;
ALTER TABLE cohorts ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;

-- Step 4: Create SIMPLE, PERMISSIVE policies for profiles
CREATE POLICY "profiles_select_all"
ON profiles FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "profiles_insert_own"
ON profiles FOR INSERT  
TO authenticated
WITH CHECK (id = auth.uid() OR is_admin_user());

CREATE POLICY "profiles_update_own_or_admin"
ON profiles FOR UPDATE
TO authenticated
USING (id = auth.uid() OR is_admin_user())
WITH CHECK (id = auth.uid() OR is_admin_user());

CREATE POLICY "profiles_delete_admin"
ON profiles FOR DELETE
TO authenticated
USING (is_admin_user());

-- Step 5: Create SIMPLE, PERMISSIVE policies for enrollments
CREATE POLICY "enrollments_select_all"
ON enrollments FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "enrollments_insert_user_or_admin"
ON enrollments FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid() OR is_admin_user());

CREATE POLICY "enrollments_update_admin"
ON enrollments FOR UPDATE  
TO authenticated
USING (is_admin_user())
WITH CHECK (is_admin_user());

CREATE POLICY "enrollments_delete_admin"
ON enrollments FOR DELETE
TO authenticated
USING (is_admin_user());

-- Step 6: Create SIMPLE, PERMISSIVE policies for cohort_lecturers
CREATE POLICY "cohort_lecturers_select_all"
ON cohort_lecturers FOR SELECT
TO authenticated  
USING (true);

CREATE POLICY "cohort_lecturers_insert_admin"
ON cohort_lecturers FOR INSERT
TO authenticated
WITH CHECK (is_admin_user());

CREATE POLICY "cohort_lecturers_update_admin" 
ON cohort_lecturers FOR UPDATE
TO authenticated
USING (is_admin_user())
WITH CHECK (is_admin_user());

CREATE POLICY "cohort_lecturers_delete_admin"
ON cohort_lecturers FOR DELETE
TO authenticated
USING (is_admin_user());

-- Step 7: Create SIMPLE, PERMISSIVE policies for cohorts
CREATE POLICY "cohorts_select_all"
ON cohorts FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "cohorts_manage_admin"
ON cohorts FOR ALL
TO authenticated  
USING (is_admin_user())
WITH CHECK (is_admin_user());

-- Step 8: Create SIMPLE, PERMISSIVE policies for programs
CREATE POLICY "programs_select_all"
ON programs FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "programs_manage_admin"
ON programs FOR ALL
TO authenticated
USING (is_admin_user())
WITH CHECK (is_admin_user());

-- Step 9: Grant additional permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Step 10: Final verification
DO $$
BEGIN
  RAISE NOTICE '🔧 COMPREHENSIVE COHORT FIX APPLIED';
  RAISE NOTICE '✅ All RLS policies recreated with permissive rules';
  RAISE NOTICE '✅ Admin function updated and granted to authenticated users';
  RAISE NOTICE '✅ Full permissions granted to authenticated users';
  RAISE NOTICE '🎯 Try adding students/lecturers to cohorts now!';
END $$;