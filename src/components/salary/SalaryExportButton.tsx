'use client'

import { Download } from 'lucide-react'
import * as XLSX from 'xlsx'

interface Props {
  month: string
  records: any[]
  bonusMap: Record<number, any>
}

export default function SalaryExportButton({ month, records, bonusMap }: Props) {
  function handleExport() {
    const rows = records.map((r) => {
      const bonus = bonusMap[r.staff_id]
      return {
        'StaffID': r.staff_id,
        'Овог': r.staff?.last_name || '',
        'Нэр': r.staff?.first_name || '',
        'Алба': r.staff?.department || '',
        'Сар': r.salary_month,
        'Үндсэн цаг': r.base_hours,
        'Илүү цаг': r.overtime_hours,
        'Томилолтын цаг': r.travel_hours,
        'Шөнийн цаг': r.night_hours,
        'Нийт цаг': r.total_calc_hrs,
        'Нэгж цалин': r.hourly_rate,
        'НДШ': r.pension,
        'ХХОАТ': r.income_tax,
        'Суутгал': r.deductions,
        'Гарт олгосон цалин': r.net_salary,
        'Хийснээрх хүн.цаг': bonus?.perform_man_hours || 0,
        'Хийснээрх олговор': bonus?.perform_bonus || 0,
        'Хийснээрх НДШ': bonus?.pension || 0,
        'Хийснээрх ХХОАТ': bonus?.income_tax || 0,
        'Нийт олговор': bonus?.total_bonus || 0,
      }
    })

    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Цалин')
    XLSX.writeFile(wb, `salary-${month}.xlsx`)
  }

  return (
    <button
      onClick={handleExport}
      className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
    >
      <Download className="w-4 h-4" />
      Excel Export
    </button>
  )
}
