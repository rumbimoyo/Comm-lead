-- =====================================================
-- MIGRATION 015: Emergency Unblock Signup Trigger
-- Goal: NEVER let profile trigger block auth signup
-- =====================================================

-- Ensure enum includes lecturer/super_admin if enum exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_enum e
      JOIN pg_type t ON t.oid = e.enumtypid
      WHERE t.typname = 'user_role' AND e.enumlabel = 'lecturer'
    ) THEN
      ALTER TYPE user_role ADD VALUE 'lecturer';
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_enum e
      JOIN pg_type t ON t.oid = e.enumtypid
      WHERE t.typname = 'user_role' AND e.enumlabel = 'super_admin'
    ) THEN
      ALTER TYPE user_role ADD VALUE 'super_admin';
    END IF;
  END IF;
END $$;

-- Ensure commonly used profile columns exist
ALTER TABLE IF EXISTS public.profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE IF EXISTS public.profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE IF EXISTS public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE IF EXISTS public.profiles ADD COLUMN IF NOT EXISTS role TEXT;
ALTER TABLE IF EXISTS public.profiles ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT FALSE;
ALTER TABLE IF EXISTS public.profiles ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Replace trigger function with defensive logic that never throws
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role_text TEXT;
  final_role_text TEXT;
BEGIN
  user_role_text := COALESCE(NEW.raw_user_meta_data->>'role', 'student');

  IF user_role_text IN ('lecturer', 'admin', 'super_admin', 'student') THEN
    final_role_text := user_role_text;
  ELSE
    final_role_text := 'student';
  END IF;

  BEGIN
    INSERT INTO public.profiles (id, email, full_name, phone, role, is_approved, is_active)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
      NEW.raw_user_meta_data->>'phone',
      final_role_text,
      FALSE,
      TRUE
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      full_name = EXCLUDED.full_name,
      phone = EXCLUDED.phone,
      role = EXCLUDED.role;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'handle_new_user profile upsert failed for user %: %', NEW.id, SQLERRM;
    -- Never block auth signup
    RETURN NEW;
  END;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
