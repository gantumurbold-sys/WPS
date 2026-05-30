import { Role } from '@/types/database'

export const ROLE_LABELS: Record<Role, string> = {
  superadmin: 'Супер Админ',
  admin: 'Админ',
  chief_eng: 'Ерөнхий Инженер',
  project_manager: 'Төслийн Менежер',
  foreman: 'Форман',
  staff: 'Ажилтан',
  accountant: 'Нягтлан Бодогч',
  hr: 'HR',
}

export const MODULE_PERMISSIONS: Record<string, Role[]> = {
  projects: ['superadmin', 'admin'],
  job_library: ['superadmin', 'admin'],
  weekly_plans: ['superadmin', 'admin', 'chief_eng', 'project_manager', 'foreman'],
  daily_reports: ['superadmin', 'admin', 'foreman'],
  performance: ['superadmin', 'admin', 'chief_eng', 'project_manager'],
  my_performance: ['staff', 'foreman'],
  salary: ['superadmin', 'admin', 'accountant'],
  staff: ['superadmin', 'admin', 'hr'],
  reports: ['superadmin', 'admin', 'chief_eng', 'project_manager', 'accountant'],
  settings: ['superadmin'],
  dashboard: ['superadmin', 'admin', 'chief_eng'],
}

export const GROUP_CODES = [
  'NET', 'CAM', 'FAS', 'PAS', 'DES', 'OTH', 'EL',
  'HVAC', 'PLB', 'STR', 'FIN', 'EXT', 'INT',
]

export const DEPARTMENTS = [
  'ИТА-1', 'ИТА-2', 'ИТА-3',
  'Захиргаа', 'Санхүү', 'HR', 'IT',
]

export const SHIFTS: Array<{ value: string; label: string }> = [
  { value: 'Өдөр', label: 'Өдрийн ээлж' },
  { value: 'Шөнө', label: 'Шөнийн ээлж' },
]

export const STAFF_TYPES: Array<{ value: string; label: string }> = [
  { value: 'Үндсэн', label: 'Үндсэн' },
  { value: 'Туршилт', label: 'Туршилтын' },
  { value: 'Дадлага', label: 'Дадлага' },
]

export const DEFAULT_SETTINGS = {
  perform_bonus_rate: 5000,
  pension_rate: 0.115,
  income_tax_rate: 0.10,
}
