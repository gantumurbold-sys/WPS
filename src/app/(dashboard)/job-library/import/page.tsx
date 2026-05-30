'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { ArrowLeft, Upload, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react'
import * as XLSX from 'xlsx'

interface JobRow {
  job_id: string
  job_name: string
  group_code: string
  group_name: string
  unit: string
  man_hours: number
  description: string
  error?: string
}

export default function JobLibraryImportPage() {
  const router = useRouter()
  const [preview, setPreview] = useState<JobRow[]>([])
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: number; failed: number } | null>(null)
  const [version, setVersion] = useState(1)

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (evt) => {
      const wb = XLSX.read(evt.target?.result, { type: 'binary' })
      const ws = wb.Sheets[wb.SheetNames[0]]
      const raw: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 })

      const rows: JobRow[] = raw.slice(1).map((row) => {
        const r: JobRow = {
          job_id: String(row[0] || '').trim(),
          job_name: String(row[1] || '').trim(),
          group_code: String(row[2] || '').trim(),
          group_name: String(row[3] || '').trim(),
          unit: String(row[4] || '').trim(),
          man_hours: parseFloat(row[5]) || 0,
          description: String(row[6] || '').trim(),
        }
        if (!r.job_id) r.error = 'JobID байхгүй'
        else if (!r.job_name) r.error = 'Ажлын нэр байхгүй'
        else if (r.man_hours <= 0) r.error = 'Хүн.цаг буруу'
        return r
      }).filter((r) => r.job_id || r.job_name)

      setPreview(rows)
      setResult(null)
    }
    reader.readAsBinaryString(file)
  }

  async function handleImport() {
    setLoading(true)
    const supabase = createClient()

    // Одоогийн хамгийн өндөр version авах
    const { data: latest } = await supabase
      .from('job_library')
      .select('version')
      .order('version', { ascending: false })
      .limit(1)
      .single()

    const newVersion = (latest?.version || 0) + 1
    setVersion(newVersion)

    const validRows = preview.filter((r) => !r.error)
    const { data: { user } } = await supabase.auth.getUser()
    const { data: staff } = await supabase.from('staffs').select('staff_id').eq('email', user?.email).single()

    const { error } = await supabase.from('job_library').insert(
      validRows.map((r) => ({
        job_id: r.job_id,
        version: newVersion,
        job_name: r.job_name,
        group_code: r.group_code,
        group_name: r.group_name,
        unit: r.unit || null,
        man_hours: r.man_hours,
        description: r.description || null,
        is_active: true,
      }))
    )

    // Import batch бүртгэх
    await supabase.from('import_batches').insert({
      import_type: 'job_library',
      version: newVersion,
      row_count: validRows.length,
      status: error ? 'failed' : 'success',
      created_by: staff?.staff_id,
    })

    if (error) {
      toast.error('Импорт амжилтгүй', { description: error.message })
    } else {
      setResult({ success: validRows.length, failed: preview.length - validRows.length })
      toast.success(`v${newVersion}: ${validRows.length} ажил оруулагдлаа`)
    }
    setLoading(false)
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/job-library" className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">Ажлын Сан Excel Импорт</h1>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-5">
        <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-4 text-sm text-blue-700 dark:text-blue-300">
          <p className="font-medium mb-1">Template баганын дараалал:</p>
          <p className="text-xs font-mono">JobID | Ажлын нэр | Бүлгийн код | Бүлгийн нэр | Хэмжих нэгж | Хүн.цаг | Тайлбар</p>
          <p className="text-xs mt-2 opacity-70">Импорт хийх бүрт шинэ version үүснэ. Өмнөх version хадгалагдана.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Excel файл (.xlsx)
          </label>
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFile}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        {result && (
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-50 dark:bg-green-950 rounded-lg p-4 flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
              <div>
                <p className="text-xl font-bold text-green-700">{result.success}</p>
                <p className="text-xs text-green-600">Амжилттай оруулагдсан</p>
              </div>
            </div>
            <div className="bg-red-50 dark:bg-red-950 rounded-lg p-4 flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-red-500" />
              <div>
                <p className="text-xl font-bold text-red-600">{result.failed}</p>
                <p className="text-xs text-red-500">Алдаатай мөр</p>
              </div>
            </div>
          </div>
        )}

        {preview.length > 0 && !result && (
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Урьдчилан харах ({preview.length} мөр):
            </p>
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-auto max-h-72">
              <table className="w-full text-xs">
                <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0">
                  <tr>
                    <th className="text-left px-3 py-2 text-gray-500">JobID</th>
                    <th className="text-left px-3 py-2 text-gray-500">Нэр</th>
                    <th className="text-left px-3 py-2 text-gray-500">Бүлэг</th>
                    <th className="text-right px-3 py-2 text-gray-500">Хүн.цаг</th>
                    <th className="text-left px-3 py-2 text-gray-500">Алдаа</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.map((row, i) => (
                    <tr key={i} className={row.error ? 'bg-red-50 dark:bg-red-950' : ''}>
                      <td className="px-3 py-1.5 font-mono text-blue-600">{row.job_id}</td>
                      <td className="px-3 py-1.5 max-w-48 truncate">{row.job_name}</td>
                      <td className="px-3 py-1.5">{row.group_code}</td>
                      <td className="px-3 py-1.5 text-right">{row.man_hours}</td>
                      <td className="px-3 py-1.5 text-red-500">{row.error || ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Алдаагүй: {preview.filter((r) => !r.error).length} | Алдаатай: {preview.filter((r) => r.error).length}
            </p>
          </div>
        )}

        <div className="flex gap-3">
          {preview.length > 0 && !result && (
            <button
              onClick={handleImport}
              disabled={loading || preview.filter((r) => !r.error).length === 0}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Оруулах ({preview.filter((r) => !r.error).length} ажил)
            </button>
          )}
          {result && (
            <button
              onClick={() => router.push('/job-library')}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 rounded-lg"
            >
              Ажлын Сан руу буцах
            </button>
          )}
          <Link
            href="/job-library"
            className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 text-center"
          >
            Цуцлах
          </Link>
        </div>
      </div>
    </div>
  )
}
