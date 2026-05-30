-- ================================================================
-- ГУС — Гүйцэтгэлийн Удирдлагын Систем
-- Database Schema v1.0
-- Supabase (PostgreSQL) дээр ажиллана
-- ================================================================

-- ================================================================
-- Цэвэр суулгалт: өмнөх хүснэгтүүдийг устгах
-- (Өгөгдлөө хадгалахыг хүсвэл эдгээр мөрүүдийг comment болгоно)
-- ================================================================
DROP TABLE IF EXISTS audit_log CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS import_batches CASCADE;
DROP TABLE IF EXISTS clarification_requests CASCADE;
DROP TABLE IF EXISTS salary_performance_bonus CASCADE;
DROP TABLE IF EXISTS salary_records CASCADE;
DROP TABLE IF EXISTS project_performance CASCADE;
DROP TABLE IF EXISTS daily_report_items CASCADE;
DROP TABLE IF EXISTS daily_reports CASCADE;
DROP TABLE IF EXISTS weekly_plan_items CASCADE;
DROP TABLE IF EXISTS weekly_plans CASCADE;
DROP TABLE IF EXISTS project_jobs CASCADE;
DROP TABLE IF EXISTS settings CASCADE;
DROP TABLE IF EXISTS staffs CASCADE;
DROP TABLE IF EXISTS job_library CASCADE;
DROP TABLE IF EXISTS projects CASCADE;

DROP FUNCTION IF EXISTS update_updated_at() CASCADE;
DROP FUNCTION IF EXISTS sync_daily_report_to_performance() CASCADE;

-- ===========================
-- PROJECTS (Барилгын төслүүд)
-- ===========================
CREATE TABLE projects (
  project_id        TEXT PRIMARY KEY,
  project_name      TEXT NOT NULL,
  client_name       TEXT NOT NULL,
  contract_start    DATE NOT NULL,
  contract_end      DATE NOT NULL,
  status            TEXT DEFAULT 'active'
    CHECK (status IN ('active','completed','paused')),
  task_sheet_url    TEXT,
  contract_doc_url  TEXT,
  warranty_doc_url  TEXT,
  completion_date   DATE,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ===================================
-- JOB_LIBRARY (Ажлын сан - Норматив)
-- ===================================
CREATE TABLE job_library (
  job_id          TEXT NOT NULL,
  version         INTEGER NOT NULL DEFAULT 1,
  job_name        TEXT NOT NULL,
  group_code      TEXT NOT NULL,
  group_name      TEXT NOT NULL,
  unit            TEXT,
  man_hours       NUMERIC(10,4) NOT NULL,
  description     TEXT,
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (job_id, version)
);

-- ============================================
-- PROJECT_JOBS (Төслийн ажлын тоо хэмжээний төлөвлөгөө)
-- ============================================
CREATE TABLE project_jobs (
  id              BIGSERIAL PRIMARY KEY,
  project_id      TEXT NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
  building_no     TEXT NOT NULL,
  floor_no        INTEGER NOT NULL,
  group_code      TEXT NOT NULL,
  group_name      TEXT NOT NULL,
  job_id          TEXT NOT NULL,
  job_library_ver INTEGER NOT NULL DEFAULT 1,
  man_hours_unit  NUMERIC(10,4),
  planned_qty     NUMERIC(12,3) NOT NULL,
  total_man_hours NUMERIC(14,4)
    GENERATED ALWAYS AS (planned_qty * man_hours_unit) STORED,
  import_batch_id TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  FOREIGN KEY (job_id, job_library_ver) REFERENCES job_library(job_id, version)
);

-- ============================
-- STAFFS (Ажилтнуудын мэдээлэл)
-- ============================
CREATE TABLE staffs (
  staff_id        INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  register_no     TEXT UNIQUE,
  last_name       TEXT,
  first_name      TEXT NOT NULL,
  department      TEXT NOT NULL,
  staff_type      TEXT DEFAULT 'Үндсэн'
    CHECK (staff_type IN ('Үндсэн','Туршилт','Дадлага')),
  role            TEXT NOT NULL
    CHECK (role IN ('superadmin','admin','accountant','hr','chief_eng',
                    'project_manager','foreman','staff')),
  email           TEXT UNIQUE,
  phone           TEXT,
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================
-- WEEKLY_PLANS (7 хоногийн төлөвлөгөө)
-- ===========================
CREATE TABLE weekly_plans (
  weekly_id       TEXT PRIMARY KEY,
  project_id      TEXT NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
  week_start      DATE NOT NULL,
  week_end        DATE NOT NULL,
  shift           TEXT DEFAULT 'Өдөр'
    CHECK (shift IN ('Өдөр','Шөнө')),
  status          TEXT DEFAULT 'draft'
    CHECK (status IN ('draft','submitted','approved','rejected')),
  created_by      INTEGER REFERENCES staffs(staff_id),
  approved_by     INTEGER REFERENCES staffs(staff_id),
  approved_at     TIMESTAMPTZ,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE weekly_plan_items (
  id              BIGSERIAL PRIMARY KEY,
  weekly_id       TEXT NOT NULL REFERENCES weekly_plans(weekly_id) ON DELETE CASCADE,
  building_no     TEXT NOT NULL,
  floor_no        INTEGER NOT NULL,
  job_id          TEXT NOT NULL,
  planned_qty     NUMERIC(12,3) NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ===============================
-- DAILY_REPORTS (Өдрийн тайлан)
-- ===============================
CREATE TABLE daily_reports (
  daily_report_id TEXT PRIMARY KEY,
  project_id      TEXT NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
  report_date     DATE NOT NULL,
  shift           TEXT DEFAULT 'Өдөр',
  work_start      TIME,
  work_end        TIME,
  safety_briefing BOOLEAN DEFAULT FALSE,
  ventilation_ok  BOOLEAN DEFAULT FALSE,
  notes           TEXT,
  status          TEXT DEFAULT 'draft'
    CHECK (status IN ('draft','submitted','reviewed','approved')),
  created_by      INTEGER REFERENCES staffs(staff_id),
  reviewed_by     INTEGER REFERENCES staffs(staff_id),
  reviewed_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE daily_report_items (
  id              BIGSERIAL PRIMARY KEY,
  daily_report_id TEXT NOT NULL REFERENCES daily_reports(daily_report_id) ON DELETE CASCADE,
  staff_id        INTEGER REFERENCES staffs(staff_id),
  building_no     TEXT NOT NULL,
  floor_no        INTEGER NOT NULL,
  job_id          TEXT NOT NULL,
  performed_qty   NUMERIC(12,3) NOT NULL,
  performed_hrs   NUMERIC(6,2),
  notes           TEXT,
  photo_urls      TEXT[],
  photo_captions  TEXT[],
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- PROJECT_PERFORMANCE (Нэгтгэсэн гүйцэтгэл)
-- ==========================================
CREATE TABLE project_performance (
  id                    BIGSERIAL PRIMARY KEY,
  project_id            TEXT NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
  building_no           TEXT NOT NULL,
  floor_no              INTEGER NOT NULL,
  staff_id              INTEGER REFERENCES staffs(staff_id),
  job_id                TEXT NOT NULL,
  performed_date        DATE NOT NULL,
  performed_qty         NUMERIC(12,3) NOT NULL,
  performed_hrs         NUMERIC(6,2),
  daily_report_id       TEXT REFERENCES daily_reports(daily_report_id),
  daily_report_item_id  BIGINT REFERENCES daily_report_items(id),
  is_reviewed           BOOLEAN DEFAULT FALSE,
  is_approved           BOOLEAN DEFAULT FALSE,
  approved_by           INTEGER REFERENCES staffs(staff_id),
  approved_at           TIMESTAMPTZ,
  rejection_reason      TEXT,
  created_at            TIMESTAMPTZ DEFAULT NOW()
);

-- ================================
-- SALARY_RECORDS (Цалингийн бүртгэл)
-- ================================
CREATE TABLE salary_records (
  id              BIGSERIAL PRIMARY KEY,
  staff_id        INTEGER REFERENCES staffs(staff_id),
  salary_month    TEXT NOT NULL,
  base_hours      NUMERIC(6,2),
  overtime_hours  NUMERIC(6,2) DEFAULT 0,
  travel_hours    NUMERIC(6,2) DEFAULT 0,
  night_hours     NUMERIC(6,2) DEFAULT 0,
  total_calc_hrs  NUMERIC(6,2),
  hourly_rate     NUMERIC(10,2),
  gross_salary    NUMERIC(12,2),
  pension         NUMERIC(12,2),
  income_tax      NUMERIC(12,2),
  deductions      NUMERIC(12,2) DEFAULT 0,
  net_salary      NUMERIC(12,2),
  import_batch_id TEXT,
  created_by      INTEGER REFERENCES staffs(staff_id),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ======================================
-- SALARY_PERFORMANCE_BONUS (Хийснээрх цалин)
-- ======================================
CREATE TABLE salary_performance_bonus (
  id                  BIGSERIAL PRIMARY KEY,
  staff_id            INTEGER REFERENCES staffs(staff_id),
  salary_month        TEXT NOT NULL,
  project_id          TEXT REFERENCES projects(project_id),
  building_no         TEXT,
  floor_no            INTEGER,
  job_id              TEXT,
  performed_qty       NUMERIC(12,3),
  man_hours_unit      NUMERIC(10,4),
  total_man_hours     NUMERIC(14,4),
  approval_status     TEXT,
  perform_man_hours   NUMERIC(14,4),
  unit_bonus_rate     NUMERIC(10,2),
  perform_bonus       NUMERIC(12,2),
  pension             NUMERIC(12,2),
  income_tax          NUMERIC(12,2),
  total_bonus         NUMERIC(12,2),
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ================================
-- CLARIFICATION_REQUESTS
-- ================================
CREATE TABLE clarification_requests (
  id                      BIGSERIAL PRIMARY KEY,
  staff_id                INTEGER REFERENCES staffs(staff_id),
  project_performance_id  BIGINT REFERENCES project_performance(id),
  message                 TEXT NOT NULL,
  status                  TEXT DEFAULT 'open'
    CHECK (status IN ('open','in_progress','resolved','closed')),
  response                TEXT,
  responded_by            INTEGER REFERENCES staffs(staff_id),
  responded_at            TIMESTAMPTZ,
  created_at              TIMESTAMPTZ DEFAULT NOW()
);

-- ================================
-- SETTINGS (Системийн тохиргоо)
-- ================================
CREATE TABLE settings (
  key             TEXT PRIMARY KEY,
  value           TEXT NOT NULL,
  description     TEXT,
  updated_by      INTEGER REFERENCES staffs(staff_id),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO settings (key, value, description) VALUES
  ('perform_bonus_rate', '5000', 'Хийснээрх нэгж олговор (₮/хүн.цаг)'),
  ('pension_rate', '0.115', 'НДШ хувь (11.5%)'),
  ('income_tax_rate', '0.10', 'ХХОАТ хувь (10%)')
ON CONFLICT (key) DO NOTHING;

-- ================================
-- IMPORT_BATCHES (Excel импортын бүртгэл)
-- ================================
CREATE TABLE import_batches (
  id            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  import_type   TEXT NOT NULL
    CHECK (import_type IN ('job_library','project_jobs','salary','project_performance')),
  project_id    TEXT,
  version       INTEGER,
  file_name     TEXT,
  row_count     INTEGER,
  status        TEXT DEFAULT 'pending'
    CHECK (status IN ('pending','processing','success','failed')),
  error_log     JSONB,
  created_by    INTEGER REFERENCES staffs(staff_id),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ================================
-- NOTIFICATIONS (Мэдэгдэл)
-- ================================
CREATE TABLE notifications (
  id              BIGSERIAL PRIMARY KEY,
  recipient_id    INTEGER REFERENCES staffs(staff_id),
  type            TEXT NOT NULL,
  title           TEXT NOT NULL,
  body            TEXT,
  is_read         BOOLEAN DEFAULT FALSE,
  reference_id    TEXT,
  reference_type  TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ================================
-- AUDIT_LOG (Аудит бүртгэл)
-- ================================
CREATE TABLE audit_log (
  id          BIGSERIAL PRIMARY KEY,
  staff_id    INTEGER REFERENCES staffs(staff_id),
  action      TEXT NOT NULL,
  table_name  TEXT NOT NULL,
  record_id   TEXT,
  old_data    JSONB,
  new_data    JSONB,
  ip_address  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ================================
-- Triggers: updated_at автомат шинэчлэх
-- ================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_staffs_updated_at
  BEFORE UPDATE ON staffs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_daily_reports_updated_at
  BEFORE UPDATE ON daily_reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ================================
-- Function: Өдрийн тайлан → project_performance автомат шилжүүлэх
-- ================================
CREATE OR REPLACE FUNCTION sync_daily_report_to_performance()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'submitted' AND OLD.status = 'draft' THEN
    INSERT INTO project_performance (
      project_id, building_no, floor_no, staff_id, job_id,
      performed_date, performed_qty, performed_hrs,
      daily_report_id, daily_report_item_id
    )
    SELECT
      dr.project_id,
      dri.building_no,
      dri.floor_no,
      dri.staff_id,
      dri.job_id,
      dr.report_date,
      dri.performed_qty,
      dri.performed_hrs,
      dr.daily_report_id,
      dri.id
    FROM daily_report_items dri
    JOIN daily_reports dr ON dr.daily_report_id = dri.daily_report_id
    WHERE dri.daily_report_id = NEW.daily_report_id
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_sync_performance
  AFTER UPDATE OF status ON daily_reports
  FOR EACH ROW EXECUTE FUNCTION sync_daily_report_to_performance();

-- ================================
-- Indexes — performance
-- ================================
CREATE INDEX idx_project_performance_staff ON project_performance(staff_id);
CREATE INDEX idx_project_performance_project ON project_performance(project_id);
CREATE INDEX idx_project_performance_date ON project_performance(performed_date);
CREATE INDEX idx_daily_reports_project ON daily_reports(project_id);
CREATE INDEX idx_daily_reports_date ON daily_reports(report_date);
CREATE INDEX idx_notifications_recipient ON notifications(recipient_id, is_read);
CREATE INDEX idx_salary_records_month ON salary_records(salary_month);
CREATE INDEX idx_project_jobs_project ON project_jobs(project_id);
