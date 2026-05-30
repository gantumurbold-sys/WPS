import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, parseISO } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date, fmt = 'yyyy-MM-dd') {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, fmt)
}

export function formatMNT(amount: number) {
  return new Intl.NumberFormat('mn-MN', {
    style: 'currency',
    currency: 'MNT',
    minimumFractionDigits: 0,
  }).format(amount)
}

export function formatNumber(n: number, decimals = 2) {
  return n.toFixed(decimals)
}

export function getWeekId(date: Date = new Date()) {
  const year = date.getFullYear().toString().slice(-2)
  const startOfYear = new Date(date.getFullYear(), 0, 1)
  const week = Math.ceil(
    ((date.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7
  )
  return `${year}-W${week.toString().padStart(2, '0')}`
}

export function getWeekDates(weekId: string): { start: Date; end: Date } {
  const [yearStr, weekStr] = weekId.split('-W')
  const year = 2000 + parseInt(yearStr)
  const week = parseInt(weekStr)
  const jan1 = new Date(year, 0, 1)
  const daysOffset = (week - 1) * 7
  const start = new Date(jan1.getTime() + daysOffset * 86400000)
  start.setDate(start.getDate() - start.getDay() + 1)
  const end = new Date(start.getTime() + 6 * 86400000)
  return { start, end }
}

export function generateDailyReportId(
  projectId: string,
  weekId: string,
  date: Date,
  shift: number
) {
  const dateStr = format(date, 'yyyy-MM-dd')
  return `DR-${projectId}-${weekId}-${dateStr}-${shift}`
}

export function getRoleName(role: string): string {
  const names: Record<string, string> = {
    superadmin: 'Супер Админ',
    admin: 'Админ',
    chief_eng: 'Ерөнхий Инженер',
    project_manager: 'Төслийн Менежер',
    foreman: 'Форман',
    staff: 'Ажилтан',
    accountant: 'Нягтлан Бодогч',
    hr: 'HR',
  }
  return names[role] || role
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    active: 'Явагдаж байна',
    completed: 'Дууссан',
    paused: 'Түдгэлзсэн',
    draft: 'Ноорог',
    submitted: 'Илгээсэн',
    reviewed: 'Хянасан',
    approved: 'Батлагдсан',
    rejected: 'Буцаагдсан',
    open: 'Нээлттэй',
    in_progress: 'Явагдаж байна',
    resolved: 'Шийдвэрлэсэн',
    closed: 'Хаагдсан',
    pending: 'Хүлээгдэж байна',
    processing: 'Боловсруулж байна',
    success: 'Амжилттай',
    failed: 'Алдаатай',
  }
  return labels[status] || status
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    active: 'bg-green-100 text-green-800',
    completed: 'bg-gray-100 text-gray-800',
    paused: 'bg-yellow-100 text-yellow-800',
    draft: 'bg-gray-100 text-gray-600',
    submitted: 'bg-blue-100 text-blue-800',
    reviewed: 'bg-purple-100 text-purple-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    open: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-yellow-100 text-yellow-800',
    resolved: 'bg-green-100 text-green-800',
    closed: 'bg-gray-100 text-gray-600',
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    success: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

export function hasPermission(userRole: string, allowedRoles: string[]): boolean {
  return allowedRoles.includes(userRole)
}

export function calculatePerformanceBonus(
  performManHours: number,
  bonusRate: number,
  pensionRate: number,
  incomeTaxRate: number
) {
  const performBonus = performManHours * bonusRate
  const pension = performBonus * pensionRate
  const incomeBase = performBonus - pension
  const incomeTax = incomeBase * incomeTaxRate
  const totalBonus = performBonus - pension - incomeTax
  return { performBonus, pension, incomeTax, totalBonus }
}
