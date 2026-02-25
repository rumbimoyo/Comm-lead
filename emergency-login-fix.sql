-- ═══════════════════════════════════════════════════════════════════════════
-- EMERGENCY LOGIN FIX - Run this first if login is failing
-- ═══════════════════════════════════════════════════════════════════════════

-- Drop all existing policies that might be causing issues
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;

-- Drop the old problematic admin function
DROP FUNCTION IF EXISTS public.is_admin();

-- Create the SECURITY DEFINER admin function (key fix for RLS recursion)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Create simple working policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id OR public.is_admin());

-- Set your admin account based on email
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

-- If no admin account exists, create a manual profile entry
-- Note: You'll still need to create the auth.users entry via Supabase Auth or registration
INSERT INTO profiles (id, full_name, role, is_approved, created_at)
SELECT 
  id,
  'Admin User',
  'admin'::user_role,
  TRUE,
  NOW()
FROM auth.users 
WHERE email = 'c.chikomo@alumni.alueducation.com'
  AND NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.users.id);

-- ═══════════════════════════════════════════════════════════════════════════
-- ✅ This should fix login immediately
-- ═══════════════════════════════════════════════════════════════════════════