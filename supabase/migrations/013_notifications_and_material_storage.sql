-- =====================================================
-- MIGRATION 013: Notifications + Cohort Material Storage
-- =====================================================

-- Create app-level notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  target_role TEXT NOT NULL DEFAULT 'all' CHECK (target_role IN ('all', 'students', 'lecturers', 'admins')),
  target_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  cohort_id UUID REFERENCES cohorts(id) ON DELETE CASCADE,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_target_role ON notifications(target_role);
CREATE INDEX IF NOT EXISTS idx_notifications_target_user ON notifications(target_user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_cohort ON notifications(cohort_id);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notifications_select" ON notifications;
DROP POLICY IF EXISTS "notifications_admin_manage" ON notifications;
DROP POLICY IF EXISTS "notifications_lecturer_create" ON notifications;
DROP POLICY IF EXISTS "notifications_user_update_own" ON notifications;

CREATE POLICY "notifications_select"
ON notifications FOR SELECT
TO authenticated
USING (
  target_role = 'all'
  OR (target_role = 'students' AND EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'student'))
  OR (target_role = 'lecturers' AND EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'lecturer'))
  OR (target_role = 'admins' AND EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'super_admin')))
  OR target_user_id = auth.uid()
);

CREATE POLICY "notifications_admin_manage"
ON notifications FOR ALL
TO authenticated
USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'super_admin')))
WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'super_admin')));

CREATE POLICY "notifications_lecturer_create"
ON notifications FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'lecturer')
  AND target_role = 'students'
  AND cohort_id IS NOT NULL
);

CREATE POLICY "notifications_user_update_own"
ON notifications FOR UPDATE
TO authenticated
USING (target_user_id = auth.uid())
WITH CHECK (target_user_id = auth.uid());

-- Storage bucket for cohort materials (slides, notes, docs)
INSERT INTO storage.buckets (id, name, public)
VALUES ('cohort-materials', 'cohort-materials', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public cohort materials read" ON storage.objects;
DROP POLICY IF EXISTS "Lecturer/Admin cohort materials upload" ON storage.objects;
DROP POLICY IF EXISTS "Lecturer/Admin cohort materials update" ON storage.objects;
DROP POLICY IF EXISTS "Lecturer/Admin cohort materials delete" ON storage.objects;

CREATE POLICY "Public cohort materials read"
ON storage.objects FOR SELECT
USING (bucket_id = 'cohort-materials');

CREATE POLICY "Lecturer/Admin cohort materials upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'cohort-materials'
  AND EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid()
    AND p.role IN ('lecturer', 'admin', 'super_admin')
    AND p.is_active = true
  )
);

CREATE POLICY "Lecturer/Admin cohort materials update"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'cohort-materials'
  AND EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid()
    AND p.role IN ('lecturer', 'admin', 'super_admin')
    AND p.is_active = true
  )
);

CREATE POLICY "Lecturer/Admin cohort materials delete"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'cohort-materials'
  AND EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid()
    AND p.role IN ('lecturer', 'admin', 'super_admin')
    AND p.is_active = true
  )
);
