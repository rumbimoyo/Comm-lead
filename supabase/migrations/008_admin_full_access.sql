-- =====================================================
-- ADMIN FULL ACCESS FIX
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor)
-- This removes problematic recursive policies and grants proper access
-- =====================================================

-- Step 1: Drop ALL existing policies on enrollments
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'enrollments' LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || pol.policyname || '" ON enrollments';
    END LOOP;
END $$;

-- Step 2: Drop ALL existing policies on profiles
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'profiles' LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || pol.policyname || '" ON profiles';
    END LOOP;
END $$;

-- Step 3: Create a safe function to check admin role (SECURITY DEFINER bypasses RLS)
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'super_admin')
  );
$$;

-- Step 4: Create a function to get current user role
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$;

-- Step 5: Simple, non-recursive profiles policies
CREATE POLICY "profiles_select_all"
ON profiles FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "profiles_insert_own"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_update_own_or_admin"
ON profiles FOR UPDATE
TO authenticated
USING (
  id = auth.uid() OR is_admin_user()
)
WITH CHECK (
  id = auth.uid() OR is_admin_user()
);

CREATE POLICY "profiles_delete_admin"
ON profiles FOR DELETE
TO authenticated
USING (is_admin_user());

-- Step 6: Simple enrollments policies
CREATE POLICY "enrollments_select_all"
ON enrollments FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "enrollments_insert_auth"
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

-- Step 7: Make sure RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;

-- Step 8: Verify the setup
DO $$
BEGIN
  RAISE NOTICE '✅ Admin access fix applied successfully!';
  RAISE NOTICE 'Policies created:';
  RAISE NOTICE '  - profiles: select_all, insert_own, update_own_or_admin, delete_admin';
  RAISE NOTICE '  - enrollments: select_all, insert_auth, update_admin, delete_admin';
END $$;
