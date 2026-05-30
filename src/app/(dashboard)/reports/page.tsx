'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { FileText, Download, Loader2 } from 'lucide-react'
import * as XLSX from 'xlsx'

interface ExportConfig {
  id: string
  title: string
  description: string
  icon: string
}

const exports: ExportConfig[] = [
  { id: 'performance', title: 'Гүйцэтгэлийн Тайлан', description: 'Ажилтан, огноо, ажил, гүйцэтгэл, батлагдсан эсэх', icon: '📊' },
  { id: 'salary_bonus', title: 'Хийснээрх Цалингийн Карт', description: 'StaffID, сар, гүйцэтгэл, хийснээрх тооцоо', icon: '💰' },
  { id: 'monthly_summary', title: 'Сарын Нэгтгэл', description: 'Төсөл > Барилга > Давхар > Ажил бүрийн гүйцэтгэл', icon: '📋' },
]

export default function ReportsPage() {
  const [loading, setLoading] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    month: new Date().toISOString().slice(0, 7).replace('-', '.'),
    project_id: '',
  })

  async function handleExport(type: string) {
    setLoading(type)
    const supabase = createClient()

    try {
      if (type === 'performance') {
        const [year, mon] = filters.month.split('.').map(Number)
        const startDate = `${year}-${String(mon).padStart(2, '0')}-01`
        const endDate = new Date(year, mon, 0).toISOString().split('T')[0]

        let query = supabase
          .from('project_performance')
          .select('*, staff:staffs(first_name, last_name, department), project:projects(project_name)')
          .gte('performed_date', startDate)
          .lte('performed_date', endDate)

        if (filters.project_id) query = query.eq('project_id', filters.project_id)

        const { data } = await query

        const rows = (data || []).map((p: any) => ({
          'StaffID': p.staff_id,
          'Овог': p.staff?.last_name || '',
          'Нэр': p.staff?.first_name || '',
          'Алба': p.staff?.department || '',
          'Огноо': p.performed_date,
          'Төсөл': p.project_id,
          'JobID': p.job_id,
          'Барилга': p.building_no,
          'Давхар': p.floor_no,
          'Тоо хэмжээ': p.performed_qty,
          'Хүн.цаг': p.performed_hrs || 0,
          'Батлагдсан': p.is_approved ? 'Тийм' : 'Үгүй',
          'Буцаасан шалтгаан': p.rejection_reason || '',
        }))

        exportToExcel(rows, `performance-${filters.month}.xlsx`)
      }

      else if (type === 'salary_bonus') {
        const { data } = await supabase
          .from('salary_performance_bonus')
          .select('*, staff:staffs(first_name, last_name, department)')
          .eq('salary_month', filters.month)

        const rows = (data || []).map((b: any) => ({
          'StaffID': b.staff_id,
          'Нэр': [b.staff?.last_name, b.staff?.first_name].filter(Boolean).join(' '),
          'Алба': b.staff?.department || '',
          'Сар': b.salary_month,
          'Хийснээрх хүн.цаг': b.perform_man_hours || 0,
          'Нэгж олговор': b.unit_bonus_rate || 0,
          'Хийснээрх олговор': b.perform_bonus || 0,
          'НДШ': b.pension || 0,
          'ХХОАТ': b.income_tax || 0,
          'Нийт олговор': b.total_bonus || 0,
        }))

        exportToExcel(rows, `salary-bonus-${filters.month}.xlsx`)
      }

      else if (type === 'monthly_summary') {
        const [year, mon] = filters.month.split('.').map(Number)
        const startDate = `${year}-${String(mon).padStart(2, '0')}-01`
        const endDate = new Date(year, mon, 0).toISOString().split('T')[0]

        const { data } = await supabase
          .from('project_performance')
          .select('*')
          .gte('performed_date', startDate)
          .lte('performed_date', endDate)
          .eq('is_approved', true)

        // Group by project + building + floor + job
        const grouped: Record<string, { qty: number; hrs: number }> = {}
        data?.forEach((p) => {
          const key = `${p.project_id}|${p.building_no}|${p.floor_no}|${p.job_id}`
          if (!grouped[key]) grouped[key] = { qty: 0, hrs: 0 }
          grouped[key].qty += p.performed_qty
          grouped[key].hrs += p.performed_hrs || 0
        })

        const rows = Object.entries(grouped).map(([key, v]) => {
          const [project_id, building_no, floor_no, job_id] = key.split('|')
          return { 'Төсөл': project_id, 'Барилга': building_no, 'Давхар': floor_no, 'JobID': job_id, 'Нийт тоо хэмжээ': v.qty, 'Нийт хүн.цаг': v.hrs }
        })

        exportToExcel(rows, `monthly-summary-${filters.month}.xlsx`)
      }

      toast.success('Excel экспорт амжилттай')
    } catch (e) {
      toast.error('Экспортод алдаа гарлаа')
    }

    setLoading(null)
  }

  function exportToExcel(data: any[], filename: string) {
    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1')
    XLSX.writeFile(wb, filename)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <FileText className="w-5 h-5 text-blue-600" />
        <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">Тайлан Экспорт</h1>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Шүүлтүүр</h2>
        <div className="flex gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Сар (YYYY.MM)</label>
            <input
              type="text"
              value={filters.month}
              onChange={(e) => setFilters((p) => ({ ...p, month: e.target.value }))}
              placeholder="2026.05"
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Төслийн ID</label>
            <input
              type="text"
              value={filters.project_id}
              onChange={(e) => setFilters((p) => ({ ...p, project_id: e.target.value }))}
              placeholder="MCU (заавал биш)"
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Export buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {exports.map((exp) => (
          <div
            key={exp.id}
            className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="text-3xl mb-3">{exp.icon}</div>
            <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-1">{exp.title}</h3>
            <p className="text-xs text-gray-400 mb-5">{exp.description}</p>
            <button
              onClick={() => handleExport(exp.id)}
              disabled={!!loading}
              className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition disabled:opacity-60"
            >
              {loading === exp.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              Excel татах
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
