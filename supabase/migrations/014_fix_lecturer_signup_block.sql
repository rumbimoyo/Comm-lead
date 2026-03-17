-- =====================================================
-- MIGRATION 014: Fix Lecturer Signup Block
-- Safe hotfix for projects that started with limited user_role enum
-- =====================================================

-- 1) Ensure user_role enum exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('student', 'lecturer', 'admin', 'super_admin');
  END IF;
END $$;

-- 2) Ensure required enum values exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'user_role' AND e.enumlabel = 'lecturer'
  ) THEN
    ALTER TYPE user_role ADD VALUE 'lecturer';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'user_role' AND e.enumlabel = 'super_admin'
  ) THEN
    ALTER TYPE user_role ADD VALUE 'super_admin';
  END IF;
END $$;

-- 3) Ensure profiles has columns used by signup/update flows
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS specialization TEXT;

-- 4) Recreate trigger function to map auth metadata role safely
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role_text TEXT;
  final_role user_role;
BEGIN
  user_role_text := COALESCE(NEW.raw_user_meta_data->>'role', 'student');

  IF user_role_text = 'lecturer' THEN
    final_role := 'lecturer'::user_role;
  ELSIF user_role_text = 'admin' THEN
    final_role := 'admin'::user_role;
  ELSIF user_role_text = 'super_admin' THEN
    final_role := 'super_admin'::user_role;
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
    FALSE,
    TRUE
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    role = EXCLUDED.role;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 5) Optional backfill: promote accounts that registered as lecturer in metadata but profile stayed student
UPDATE profiles p
SET role = 'lecturer'::user_role
WHERE p.role = 'student'::user_role
  AND EXISTS (
    SELECT 1
    FROM auth.users u
    WHERE u.id = p.id
      AND COALESCE(u.raw_user_meta_data->>'role', 'student') = 'lecturer'
  );
