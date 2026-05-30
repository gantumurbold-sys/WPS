-- ================================================================
-- Row Level Security (RLS) Policies
-- Supabase Auth-тай ажиллана
-- ================================================================

-- Helper function: одоогийн нэвтэрсэн хэрэглэгчийн role авах
CREATE OR REPLACE FUNCTION get_current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM staffs WHERE email = auth.email()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION get_current_staff_id()
RETURNS INTEGER AS $$
  SELECT staff_id FROM staffs WHERE email = auth.email()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ================================================================
-- PROJECTS
-- ================================================================
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "projects_select" ON projects FOR SELECT
  USING (get_current_user_role() IN ('superadmin','admin','chief_eng','project_manager','foreman','accountant'));

CREATE POLICY "projects_insert" ON projects FOR INSERT
  WITH CHECK (get_current_user_role() IN ('superadmin','admin'));

CREATE POLICY "projects_update" ON projects FOR UPDATE
  USING (get_current_user_role() IN ('superadmin','admin'));

-- ================================================================
-- JOB_LIBRARY
-- ================================================================
ALTER TABLE job_library ENABLE ROW LEVEL SECURITY;

CREATE POLICY "job_library_select" ON job_library FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "job_library_insert" ON job_library FOR INSERT
  WITH CHECK (get_current_user_role() IN ('superadmin','admin'));

CREATE POLICY "job_library_update" ON job_library FOR UPDATE
  USING (get_current_user_role() IN ('superadmin','admin'));

-- ================================================================
-- PROJECT_JOBS
-- ================================================================
ALTER TABLE project_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "project_jobs_select" ON project_jobs FOR SELECT
  USING (get_current_user_role() IN ('superadmin','admin','chief_eng','project_manager','foreman','accountant'));

CREATE POLICY "project_jobs_insert" ON project_jobs FOR INSERT
  WITH CHECK (get_current_user_role() IN ('superadmin','admin'));

-- ================================================================
-- STAFFS
-- ================================================================
ALTER TABLE staffs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "staffs_select_own" ON staffs FOR SELECT
  USING (
    email = auth.email()
    OR get_current_user_role() IN ('superadmin','admin','hr','chief_eng','project_manager','foreman','accountant')
  );

CREATE POLICY "staffs_insert" ON staffs FOR INSERT
  WITH CHECK (get_current_user_role() IN ('superadmin','admin'));

CREATE POLICY "staffs_update" ON staffs FOR UPDATE
  USING (
    email = auth.email()
    OR get_current_user_role() IN ('superadmin','admin','hr')
  );

-- ================================================================
-- WEEKLY_PLANS
-- ================================================================
ALTER TABLE weekly_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "weekly_plans_select" ON weekly_plans FOR SELECT
  USING (get_current_user_role() IN ('superadmin','admin','chief_eng','project_manager','foreman'));

CREATE POLICY "weekly_plans_insert" ON weekly_plans FOR INSERT
  WITH CHECK (get_current_user_role() IN ('superadmin','admin','project_manager','foreman'));

CREATE POLICY "weekly_plans_update" ON weekly_plans FOR UPDATE
  USING (get_current_user_role() IN ('superadmin','admin','chief_eng','project_manager'));

-- ================================================================
-- DAILY_REPORTS
-- ================================================================
ALTER TABLE daily_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "daily_reports_select" ON daily_reports FOR SELECT
  USING (
    created_by = get_current_staff_id()
    OR get_current_user_role() IN ('superadmin','admin','chief_eng','project_manager','accountant')
  );

CREATE POLICY "daily_reports_insert" ON daily_reports FOR INSERT
  WITH CHECK (get_current_user_role() IN ('superadmin','admin','foreman'));

CREATE POLICY "daily_reports_update" ON daily_reports FOR UPDATE
  USING (
    (created_by = get_current_staff_id() AND status = 'draft')
    OR get_current_user_role() IN ('superadmin','admin','chief_eng','project_manager')
  );

-- ================================================================
-- DAILY_REPORT_ITEMS
-- ================================================================
ALTER TABLE daily_report_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "daily_report_items_select" ON daily_report_items FOR SELECT
  USING (
    staff_id = get_current_staff_id()
    OR get_current_user_role() IN ('superadmin','admin','chief_eng','project_manager','foreman','accountant')
  );

CREATE POLICY "daily_report_items_insert" ON daily_report_items FOR INSERT
  WITH CHECK (get_current_user_role() IN ('superadmin','admin','foreman'));

CREATE POLICY "daily_report_items_update" ON daily_report_items FOR UPDATE
  USING (get_current_user_role() IN ('superadmin','admin','foreman'));

-- ================================================================
-- PROJECT_PERFORMANCE
-- ================================================================
ALTER TABLE project_performance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pp_select_own" ON project_performance FOR SELECT
  USING (
    staff_id = get_current_staff_id()
    OR get_current_user_role() IN ('superadmin','admin','chief_eng','project_manager','foreman','accountant')
  );

CREATE POLICY "pp_update_approval" ON project_performance FOR UPDATE
  USING (get_current_user_role() IN ('superadmin','admin','chief_eng','project_manager'));

-- ================================================================
-- SALARY_RECORDS
-- ================================================================
ALTER TABLE salary_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "salary_select" ON salary_records FOR SELECT
  USING (
    staff_id = get_current_staff_id()
    OR get_current_user_role() IN ('superadmin','admin','accountant','chief_eng')
  );

CREATE POLICY "salary_insert" ON salary_records FOR INSERT
  WITH CHECK (get_current_user_role() IN ('superadmin','admin','accountant'));

CREATE POLICY "salary_update" ON salary_records FOR UPDATE
  USING (get_current_user_role() IN ('superadmin','admin','accountant'));

-- ================================================================
-- SALARY_PERFORMANCE_BONUS
-- ================================================================
ALTER TABLE salary_performance_bonus ENABLE ROW LEVEL SECURITY;

CREATE POLICY "spb_select" ON salary_performance_bonus FOR SELECT
  USING (
    staff_id = get_current_staff_id()
    OR get_current_user_role() IN ('superadmin','admin','accountant','chief_eng')
  );

CREATE POLICY "spb_insert" ON salary_performance_bonus FOR INSERT
  WITH CHECK (get_current_user_role() IN ('superadmin','admin','accountant'));

-- ================================================================
-- CLARIFICATION_REQUESTS
-- ================================================================
ALTER TABLE clarification_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cr_select" ON clarification_requests FOR SELECT
  USING (
    staff_id = get_current_staff_id()
    OR get_current_user_role() IN ('superadmin','admin','chief_eng','project_manager','foreman')
  );

CREATE POLICY "cr_insert" ON clarification_requests FOR INSERT
  WITH CHECK (staff_id = get_current_staff_id());

CREATE POLICY "cr_update_response" ON clarification_requests FOR UPDATE
  USING (get_current_user_role() IN ('superadmin','admin','chief_eng','project_manager','foreman'));

-- ================================================================
-- SETTINGS
-- ================================================================
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "settings_select" ON settings FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "settings_update" ON settings FOR UPDATE
  USING (get_current_user_role() = 'superadmin');

-- ================================================================
-- NOTIFICATIONS
-- ================================================================
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notif_select_own" ON notifications FOR SELECT
  USING (recipient_id = get_current_staff_id());

CREATE POLICY "notif_update_own" ON notifications FOR UPDATE
  USING (recipient_id = get_current_staff_id());

-- ================================================================
-- IMPORT_BATCHES
-- ================================================================
ALTER TABLE import_batches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "import_batches_select" ON import_batches FOR SELECT
  USING (get_current_user_role() IN ('superadmin','admin','accountant'));

CREATE POLICY "import_batches_insert" ON import_batches FOR INSERT
  WITH CHECK (get_current_user_role() IN ('superadmin','admin','accountant'));

-- ================================================================
-- AUDIT_LOG
-- ================================================================
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audit_select" ON audit_log FOR SELECT
  USING (get_current_user_role() = 'superadmin');

-- ================================================================
-- Supabase Realtime идэвхжүүлэх
-- ================================================================
ALTER PUBLICATION supabase_realtime ADD TABLE daily_reports;
ALTER PUBLICATION supabase_realtime ADD TABLE project_performance;
ALTER PUBLICATION supabase_realtime ADD TABLE clarification_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
