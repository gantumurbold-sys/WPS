'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Upload, Loader2, X, CheckCircle2, AlertTriangle } from 'lucide-react'
import * as XLSX from 'xlsx'
import { useRouter } from 'next/navigation'

interface SalaryRow {
  staff_id: number
  salary_month: string
  base_hours: number
  overtime_hours: number
  travel_hours: number
  night_hours: number
  total_calc_hrs: number
  hourly_rate: number
  gross_salary: number
  pension: number
  income_tax: number
  deductions: number
  net_salary: number
  error?: string
}

export default function SalaryImportButton() {
  const [open, setOpen] = useState(false)
  const [preview, setPreview] = useState<SalaryRow[]>([])
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: number; failed: number } | null>(null)
  const router = useRouter()

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (evt) => {
      const wb = XLSX.read(evt.target?.result, { type: 'binary' })
      const ws = wb.Sheets[wb.SheetNames[0]]
      const raw: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 })

      const rows: SalaryRow[] = raw.slice(1).map((row) => {
        const r: SalaryRow = {
          staff_id: parseInt(row[0]) || 0,
          salary_month: String(row[1] || '').trim(),
          base_hours: parseFloat(row[2]) || 0,
          overtime_hours: parseFloat(row[3]) || 0,
          travel_hours: parseFloat(row[4]) || 0,
          night_hours: parseFloat(row[5]) || 0,
          total_calc_hrs: parseFloat(row[6]) || 0,
          hourly_rate: parseFloat(row[7]) || 0,
          gross_salary: parseFloat(row[8]) || 0,
          pension: parseFloat(row[9]) || 0,
          income_tax: parseFloat(row[10]) || 0,
          deductions: parseFloat(row[11]) || 0,
          net_salary: parseFloat(row[12]) || 0,
        }
        if (!r.staff_id) r.error = 'StaffID байхгүй'
        else if (!r.salary_month.match(/^\d{4}\.\d{2}$/)) r.error = 'Сар буруу формат (YYYY.MM)'
        return r
      }).filter((r) => r.staff_id || r.salary_month)

      setPreview(rows)
      setResult(null)
    }
    reader.readAsBinaryString(file)
  }

  async function handleImport() {
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const { data: staff } = await supabase.from('staffs').select('staff_id').eq('email', user?.email).single()

    const validRows = preview.filter((r) => !r.error)
    const batchId = crypto.randomUUID()

    const { error } = await supabase.from('salary_records').insert(
      validRows.map((r) => ({ ...r, import_batch_id: batchId, created_by: staff?.staff_id }))
    )

    if (error) {
      toast.error('Импорт амжилтгүй', { description: error.message })
    } else {
      setResult({ success: validRows.length, failed: preview.length - validRows.length })
      toast.success(`${validRows.length} мөр оруулагдлаа`)
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
      >
        <Upload className="w-4 h-4" />
        Excel Импорт
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-2xl flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100">Цалингийн Мэдээлэл Импорт</h2>
              <button onClick={() => { setOpen(false); setPreview([]); setResult(null) }}>
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-3 text-xs font-mono text-blue-700 dark:text-blue-300">
                StaffID | Сар (YYYY.MM) | Үндсэн цаг | Илүү цаг | Томилолт | Шөнийн цаг | Нийт цаг | Нэгж цалин | НДШ | ХХОАТ | Суутгал | Гарт олгосон
              </div>

              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFile}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700"
              />

              {result && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-green-50 dark:bg-green-950 rounded-lg p-4 flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <div><p className="text-lg font-bold text-green-700">{result.success}</p><p className="text-xs text-green-600">Амжилттай</p></div>
                  </div>
                  <div className="bg-red-50 dark:bg-red-950 rounded-lg p-4 flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    <div><p className="text-lg font-bold text-red-600">{result.failed}</p><p className="text-xs text-red-500">Алдаатай</p></div>
                  </div>
                </div>
              )}

              {preview.length > 0 && !result && (
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-auto max-h-56">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0">
                      <tr>
                        <th className="text-left px-3 py-2 text-gray-500">StaffID</th>
                        <th className="text-left px-3 py-2 text-gray-500">Сар</th>
                        <th className="text-right px-3 py-2 text-gray-500">Нийт цаг</th>
                        <th className="text-right px-3 py-2 text-gray-500">Гарт олгосон</th>
                        <th className="text-left px-3 py-2 text-gray-500">Алдаа</th>
                      </tr>
                    </thead>
                    <tbody>
                      {preview.map((row, i) => (
                        <tr key={i} className={row.error ? 'bg-red-50 dark:bg-red-950' : ''}>
                          <td className="px-3 py-1.5 font-mono">{row.staff_id}</td>
                          <td className="px-3 py-1.5">{row.salary_month}</td>
                          <td className="px-3 py-1.5 text-right">{row.total_calc_hrs}</td>
                          <td className="px-3 py-1.5 text-right">{row.net_salary.toLocaleString()}</td>
                          <td className="px-3 py-1.5 text-red-500">{row.error || ''}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3">
              {preview.length > 0 && !result && (
                <button
                  onClick={handleImport}
                  disabled={loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Оруулах ({preview.filter((r) => !r.error).length})
                </button>
              )}
              <button
                onClick={() => { setOpen(false); setPreview([]); setResult(null) }}
                className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-600 dark:text-gray-400"
              >
                {result ? 'Хаах' : 'Цуцлах'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
