-- ═══════════════════════════════════════════════════════════════════════════
-- EMERGENCY FIX - REMOVE RECURSIVE RLS POLICIES
-- ═══════════════════════════════════════════════════════════════════════════
-- This will temporarily remove ALL RLS policies to break the recursive loops
-- and create simple non-recursive ones for testing
-- ═══════════════════════════════════════════════════════════════════════════

-- Step 1: Remove ALL existing policies FIRST (they depend on is_admin function)
-- PROFILES
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;

-- PROGRAMS
DROP POLICY IF EXISTS "Anyone can view active programs" ON programs;
DROP POLICY IF EXISTS "Admins can manage programs" ON programs;
DROP POLICY IF EXISTS "View programs" ON programs;
DROP POLICY IF EXISTS "Admin manage programs" ON programs;
DROP POLICY IF EXISTS "Admin update programs" ON programs;
DROP POLICY IF EXISTS "Admin delete programs" ON programs;

-- EVENTS
DROP POLICY IF EXISTS "Anyone can view events" ON events;
DROP POLICY IF EXISTS "Admins can manage events" ON events;
DROP POLICY IF EXISTS "View events" ON events;
DROP POLICY IF EXISTS "Admin manage events" ON events;
DROP POLICY IF EXISTS "Admin update events" ON events;
DROP POLICY IF EXISTS "Admin delete events" ON events;

-- TEAM MEMBERS
DROP POLICY IF EXISTS "Anyone can view team members" ON team_members;
DROP POLICY IF EXISTS "Admins can manage team members" ON team_members;
DROP POLICY IF EXISTS "View team members" ON team_members;
DROP POLICY IF EXISTS "Admin manage team members" ON team_members;
DROP POLICY IF EXISTS "Admin update team members" ON team_members;
DROP POLICY IF EXISTS "Admin delete team members" ON team_members;

-- ENROLLMENTS
DROP POLICY IF EXISTS "Users can view own enrollments" ON enrollments;
DROP POLICY IF EXISTS "Users can create own enrollments" ON enrollments;
DROP POLICY IF EXISTS "Admins can manage all enrollments" ON enrollments;
DROP POLICY IF EXISTS "View own enrollments" ON enrollments;
DROP POLICY IF EXISTS "Create own enrollment" ON enrollments;
DROP POLICY IF EXISTS "Admin update enrollments" ON enrollments;
DROP POLICY IF EXISTS "Admin delete enrollments" ON enrollments;

-- PAYMENT LOGS
DROP POLICY IF EXISTS "Users can view own payments" ON payment_logs;
DROP POLICY IF EXISTS "Admins can manage all payments" ON payment_logs;
DROP POLICY IF EXISTS "View own payments" ON payment_logs;
DROP POLICY IF EXISTS "Admin manage payments" ON payment_logs;

-- LESSONS
DROP POLICY IF EXISTS "Enrolled students can view lessons" ON lessons;
DROP POLICY IF EXISTS "Admins can manage lessons" ON lessons;
DROP POLICY IF EXISTS "View lessons" ON lessons;
DROP POLICY IF EXISTS "Admin manage lessons" ON lessons;

-- LESSON PROGRESS
DROP POLICY IF EXISTS "Users can manage own progress" ON lesson_progress;
DROP POLICY IF EXISTS "Admins can view all progress" ON lesson_progress;
DROP POLICY IF EXISTS "Manage own progress" ON lesson_progress;

-- TESTIMONIALS
DROP POLICY IF EXISTS "Anyone can view testimonials" ON testimonials;
DROP POLICY IF EXISTS "Admins can manage testimonials" ON testimonials;
DROP POLICY IF EXISTS "View testimonials" ON testimonials;
DROP POLICY IF EXISTS "Admin manage testimonials" ON testimonials;

-- WEBSITE CONTENT
DROP POLICY IF EXISTS "Anyone can view website content" ON website_content;
DROP POLICY IF EXISTS "Admins can manage website content" ON website_content;
DROP POLICY IF EXISTS "View website content" ON website_content;
DROP POLICY IF EXISTS "Admin manage website content" ON website_content;

-- STORAGE POLICIES
DROP POLICY IF EXISTS "Public image access" ON storage.objects;
DROP POLICY IF EXISTS "Admin image upload" ON storage.objects;
DROP POLICY IF EXISTS "Admin image update" ON storage.objects;
DROP POLICY IF EXISTS "Admin image delete" ON storage.objects;

-- Step 2: NOW drop the problematic is_admin function
DROP FUNCTION IF EXISTS public.is_admin();

-- Step 3: Create simple policies WITHOUT recursion
-- Allow all authenticated users to view profiles (temporary fix)
CREATE POLICY "Allow authenticated users to view profiles"
  ON profiles FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users can update own profile only"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Step 4: Set your specific user as admin directly
-- This will set whoever runs this query as admin
UPDATE profiles 
SET role = 'admin', is_approved = TRUE 
WHERE id = auth.uid();

-- Step 5: Simple program policies
CREATE POLICY "Anyone can view programs" ON programs FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage programs" ON programs FOR ALL USING (auth.role() = 'authenticated');

-- Step 6: Simple event policies  
CREATE POLICY "Anyone can view events" ON events FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage events" ON events FOR ALL USING (auth.role() = 'authenticated');

-- Step 7: Simple team policies
CREATE POLICY "Anyone can view team" ON team_members FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage team" ON team_members FOR ALL USING (auth.role() = 'authenticated');

-- Step 8: Simple enrollment policies
CREATE POLICY "Users can view enrollments" ON enrollments FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can manage enrollments" ON enrollments FOR ALL USING (auth.role() = 'authenticated');

-- Step 9: Simple payment policies
CREATE POLICY "Users can view payments" ON payment_logs FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can manage payments" ON payment_logs FOR ALL USING (auth.role() = 'authenticated');

-- Step 10: Simple lesson policies
CREATE POLICY "Users can view lessons" ON lessons FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can manage lessons" ON lessons FOR ALL USING (auth.role() = 'authenticated');

-- Step 11: Simple progress policies
CREATE POLICY "Users can manage progress" ON lesson_progress FOR ALL USING (auth.role() = 'authenticated');

-- Step 12: Simple testimonial policies
CREATE POLICY "Anyone can view testimonials" ON testimonials FOR SELECT USING (true);
CREATE POLICY "Users can manage testimonials" ON testimonials FOR ALL USING (auth.role() = 'authenticated');

-- Step 13: Simple content policies
CREATE POLICY "Anyone can view content" ON website_content FOR SELECT USING (true);
CREATE POLICY "Users can manage content" ON website_content FOR ALL USING (auth.role() = 'authenticated');

-- Step 14: Simple storage policies
CREATE POLICY "Anyone can view images" ON storage.objects FOR SELECT USING (bucket_id = 'images');
CREATE POLICY "Authenticated users can manage images" ON storage.objects FOR ALL USING (bucket_id = 'images' AND auth.role() = 'authenticated');

-- ═══════════════════════════════════════════════════════════════════════════
-- ✅ This should eliminate the infinite recursion error completely
-- ═══════════════════════════════════════════════════════════════════════════