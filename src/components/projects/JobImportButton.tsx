'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Upload, Loader2, X, CheckCircle2, AlertTriangle } from 'lucide-react'
import * as XLSX from 'xlsx'

interface Props {
  projectId: string
}

interface ImportRow {
  project_id: string
  building_no: string
  floor_no: number
  group_code: string
  group_name: string
  job_id: string
  man_hours_unit: number
  planned_qty: number
  error?: string
}

export default function JobImportButton({ projectId }: Props) {
  const [open, setOpen] = useState(false)
  const [preview, setPreview] = useState<ImportRow[]>([])
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: number; failed: number } | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (evt) => {
      const wb = XLSX.read(evt.target?.result, { type: 'binary' })
      const ws = wb.Sheets[wb.SheetNames[0]]
      const raw: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 })

      const rows: ImportRow[] = raw.slice(1).map((row, i) => {
        const r: ImportRow = {
          project_id: String(row[0] || projectId),
          building_no: String(row[1] || '').trim(),
          floor_no: parseInt(row[2]) || 0,
          group_code: String(row[3] || '').trim(),
          group_name: String(row[4] || '').trim(),
          job_id: String(row[5] || '').trim(),
          man_hours_unit: parseFloat(row[6]) || 0,
          planned_qty: parseFloat(row[7]) || 0,
        }

        if (!r.building_no) r.error = 'Барилгын дугаар байхгүй'
        else if (!r.job_id) r.error = 'JobID байхгүй'
        else if (r.planned_qty <= 0) r.error = 'Тоо хэмжээ буруу'

        return r
      }).filter((r) => r.building_no || r.job_id)

      setPreview(rows)
      setResult(null)
    }
    reader.readAsBinaryString(file)
  }

  async function handleImport() {
    setLoading(true)
    const supabase = createClient()

    const validRows = preview.filter((r) => !r.error)
    const batchId = crypto.randomUUID()

    const { error } = await supabase.from('project_jobs').insert(
      validRows.map((r) => ({
        project_id: projectId,
        building_no: r.building_no,
        floor_no: r.floor_no,
        group_code: r.group_code,
        group_name: r.group_name,
        job_id: r.job_id,
        job_library_ver: 1,
        man_hours_unit: r.man_hours_unit,
        planned_qty: r.planned_qty,
        import_batch_id: batchId,
      }))
    )

    if (error) {
      toast.error('Импорт амжилтгүй', { description: error.message })
    } else {
      setResult({ success: validRows.length, failed: preview.length - validRows.length })
      toast.success(`${validRows.length} мөр амжилттай оруулагдлаа`)
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
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100">
                Ажлын Тоо Хэмжээ Excel Импорт
              </h2>
              <button onClick={() => { setOpen(false); setPreview([]); setResult(null) }}>
                <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              {/* Template */}
              <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-4 text-sm text-blue-700 dark:text-blue-300">
                <p className="font-medium mb-1">Template баганын дараалал:</p>
                <p className="text-xs font-mono">
                  ProjectID | Барилгын дугаар | Давхрын дугаар | Бүлгийн код | Бүлгийн нэр | JobID | Хүн.цаг | Тоо хэмжээ
                </p>
              </div>

              {/* Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Excel файл сонгох (.xlsx)
                </label>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFile}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>

              {/* Result */}
              {result && (
                <div className="flex gap-3">
                  <div className="flex-1 bg-green-50 dark:bg-green-950 rounded-lg p-4 flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-lg font-bold text-green-700">{result.success}</p>
                      <p className="text-xs text-green-600">Амжилттай</p>
                    </div>
                  </div>
                  <div className="flex-1 bg-red-50 dark:bg-red-950 rounded-lg p-4 flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    <div>
                      <p className="text-lg font-bold text-red-600">{result.failed}</p>
                      <p className="text-xs text-red-500">Алдаатай</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Preview table */}
              {preview.length > 0 && !result && (
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Урьдчилан харах ({preview.length} мөр):
                  </p>
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-auto max-h-64">
                    <table className="w-full text-xs">
                      <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0">
                        <tr>
                          <th className="text-left px-3 py-2 text-gray-500">#</th>
                          <th className="text-left px-3 py-2 text-gray-500">Барилга</th>
                          <th className="text-left px-3 py-2 text-gray-500">Давхар</th>
                          <th className="text-left px-3 py-2 text-gray-500">JobID</th>
                          <th className="text-right px-3 py-2 text-gray-500">Тоо хэмжээ</th>
                          <th className="text-left px-3 py-2 text-gray-500">Алдаа</th>
                        </tr>
                      </thead>
                      <tbody>
                        {preview.map((row, i) => (
                          <tr key={i} className={row.error ? 'bg-red-50 dark:bg-red-950' : ''}>
                            <td className="px-3 py-1.5 text-gray-400">{i + 1}</td>
                            <td className="px-3 py-1.5">{row.building_no}</td>
                            <td className="px-3 py-1.5">{row.floor_no}</td>
                            <td className="px-3 py-1.5 font-mono text-blue-600">{row.job_id}</td>
                            <td className="px-3 py-1.5 text-right">{row.planned_qty}</td>
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
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3">
              {preview.length > 0 && !result && (
                <button
                  onClick={handleImport}
                  disabled={loading || preview.filter((r) => !r.error).length === 0}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Оруулах ({preview.filter((r) => !r.error).length} мөр)
                </button>
              )}
              <button
                onClick={() => { setOpen(false); setPreview([]); setResult(null) }}
                className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
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
