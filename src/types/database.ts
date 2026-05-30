export type Role =
  | 'superadmin'
  | 'admin'
  | 'accountant'
  | 'hr'
  | 'chief_eng'
  | 'project_manager'
  | 'foreman'
  | 'staff'

export type ProjectStatus = 'active' | 'completed' | 'paused'
export type WeeklyPlanStatus = 'draft' | 'submitted' | 'approved' | 'rejected'
export type DailyReportStatus = 'draft' | 'submitted' | 'reviewed' | 'approved'
export type ClarificationStatus = 'open' | 'in_progress' | 'resolved' | 'closed'
export type ImportType = 'job_library' | 'project_jobs' | 'salary' | 'project_performance'
export type ImportStatus = 'pending' | 'processing' | 'success' | 'failed'
export type StaffType = 'Үндсэн' | 'Туршилт' | 'Дадлага'
export type Shift = 'Өдөр' | 'Шөнө'

export interface Project {
  project_id: string
  project_name: string
  client_name: string
  contract_start: string
  contract_end: string
  status: ProjectStatus
  task_sheet_url: string | null
  contract_doc_url: string | null
  warranty_doc_url: string | null
  completion_date: string | null
  created_at: string
  updated_at: string
}

export interface JobLibrary {
  job_id: string
  version: number
  job_name: string
  group_code: string
  group_name: string
  unit: string | null
  man_hours: number
  description: string | null
  is_active: boolean
  created_at: string
}

export interface ProjectJob {
  id: number
  project_id: string
  building_no: string
  floor_no: number
  group_code: string
  group_name: string
  job_id: string
  job_library_ver: number
  man_hours_unit: number | null
  planned_qty: number
  total_man_hours: number | null
  import_batch_id: string | null
  created_at: string
}

export interface Staff {
  staff_id: number
  register_no: string | null
  last_name: string | null
  first_name: string
  department: string
  staff_type: StaffType
  role: Role
  email: string | null
  phone: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface WeeklyPlan {
  weekly_id: string
  project_id: string
  week_start: string
  week_end: string
  shift: Shift
  status: WeeklyPlanStatus
  created_by: number | null
  approved_by: number | null
  approved_at: string | null
  notes: string | null
  created_at: string
}

export interface WeeklyPlanItem {
  id: number
  weekly_id: string
  building_no: string
  floor_no: number
  job_id: string
  planned_qty: number
  created_at: string
}

export interface DailyReport {
  daily_report_id: string
  project_id: string
  report_date: string
  shift: Shift
  work_start: string | null
  work_end: string | null
  safety_briefing: boolean
  ventilation_ok: boolean
  notes: string | null
  status: DailyReportStatus
  created_by: number | null
  reviewed_by: number | null
  reviewed_at: string | null
  created_at: string
  updated_at: string
}

export interface DailyReportItem {
  id: number
  daily_report_id: string
  staff_id: number
  building_no: string
  floor_no: number
  job_id: string
  performed_qty: number
  performed_hrs: number | null
  notes: string | null
  photo_urls: string[] | null
  photo_captions: string[] | null
  created_at: string
}

export interface ProjectPerformance {
  id: number
  project_id: string
  building_no: string
  floor_no: number
  staff_id: number
  job_id: string
  performed_date: string
  performed_qty: number
  performed_hrs: number | null
  daily_report_id: string | null
  daily_report_item_id: number | null
  is_reviewed: boolean
  is_approved: boolean
  approved_by: number | null
  approved_at: string | null
  rejection_reason: string | null
  created_at: string
}

export interface SalaryRecord {
  id: number
  staff_id: number
  salary_month: string
  base_hours: number | null
  overtime_hours: number
  travel_hours: number
  night_hours: number
  total_calc_hrs: number | null
  hourly_rate: number | null
  gross_salary: number | null
  pension: number | null
  income_tax: number | null
  deductions: number
  net_salary: number | null
  import_batch_id: string | null
  created_by: number | null
  created_at: string
}

export interface SalaryPerformanceBonus {
  id: number
  staff_id: number
  salary_month: string
  project_id: string | null
  building_no: string | null
  floor_no: number | null
  job_id: string | null
  performed_qty: number | null
  man_hours_unit: number | null
  total_man_hours: number | null
  approval_status: string | null
  perform_man_hours: number | null
  unit_bonus_rate: number | null
  perform_bonus: number | null
  pension: number | null
  income_tax: number | null
  total_bonus: number | null
  created_at: string
}

export interface ClarificationRequest {
  id: number
  staff_id: number
  project_performance_id: number | null
  message: string
  status: ClarificationStatus
  response: string | null
  responded_by: number | null
  responded_at: string | null
  created_at: string
}

export interface Setting {
  key: string
  value: string
  description: string | null
  updated_by: number | null
  updated_at: string
}

export interface ImportBatch {
  id: string
  import_type: ImportType
  project_id: string | null
  version: number | null
  file_name: string | null
  row_count: number | null
  status: ImportStatus
  error_log: Record<string, unknown> | null
  created_by: number | null
  created_at: string
}

export interface Notification {
  id: number
  recipient_id: number
  type: string
  title: string
  body: string | null
  is_read: boolean
  reference_id: string | null
  reference_type: string | null
  created_at: string
}

export interface AuditLog {
  id: number
  staff_id: number | null
  action: string
  table_name: string
  record_id: string | null
  old_data: Record<string, unknown> | null
  new_data: Record<string, unknown> | null
  ip_address: string | null
  created_at: string
}

// =====================
// Extended / Join types
// =====================

export interface DailyReportWithDetails extends DailyReport {
  project?: Project
  creator?: Staff
  reviewer?: Staff
  items?: DailyReportItemWithStaff[]
}

export interface DailyReportItemWithStaff extends DailyReportItem {
  staff?: Staff
}

export interface ProjectPerformanceWithDetails extends ProjectPerformance {
  project?: Project
  staff?: Staff
  approver?: Staff
}

export interface WeeklyPlanWithDetails extends WeeklyPlan {
  project?: Project
  creator?: Staff
  approver?: Staff
  items?: WeeklyPlanItem[]
}

export interface StaffWithSalary extends Staff {
  salary_record?: SalaryRecord
  performance_bonus?: SalaryPerformanceBonus
}
