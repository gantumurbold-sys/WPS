'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { ArrowLeft, Plus, Trash2, Loader2, Upload } from 'lucide-react'
import { generateDailyReportId, getWeekId } from '@/lib/utils'
import { Staff, Project, ProjectJob } from '@/types/database'

interface ReportItem {
  staff_id: number | ''
  building_no: string
  floor_no: number | ''
  job_id: string
  performed_qty: number | ''
  performed_hrs: number | ''
  notes: string
}

export default function NewDailyReportPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [projects, setProjects] = useState<Project[]>([])
  const [staffList, setStaffList] = useState<Staff[]>([])
  const [projectJobs, setProjectJobs] = useState<ProjectJob[]>([])

  const [form, setForm] = useState({
    project_id: '',
    report_date: new Date().toISOString().split('T')[0],
    shift: 'Өдөр',
    work_start: '08:00',
    work_end: '17:00',
    safety_briefing: false,
    ventilation_ok: false,
    notes: '',
  })

  const [items, setItems] = useState<ReportItem[]>([
    { staff_id: '', building_no: '', floor_no: '', job_id: '', performed_qty: '', performed_hrs: '', notes: '' }
  ])

  useEffect(() => {
    const supabase = createClient()
    supabase.from('projects').select('*').eq('status', 'active').then(({ data }) => {
      if (data) setProjects(data)
    })
    supabase.from('staffs').select('*').eq('is_active', true).order('first_name').then(({ data }) => {
      if (data) setStaffList(data)
    })
  }, [])

  useEffect(() => {
    if (!form.project_id) return
    const supabase = createClient()
    supabase
      .from('project_jobs')
      .select('*')
      .eq('project_id', form.project_id)
      .then(({ data }) => {
        if (data) setProjectJobs(data)
      })
  }, [form.project_id])

  function addItem() {
    setItems((prev) => [
      ...prev,
      { staff_id: '', building_no: '', floor_no: '', job_id: '', performed_qty: '', performed_hrs: '', notes: '' }
    ])
  }

  function removeItem(idx: number) {
    setItems((prev) => prev.filter((_, i) => i !== idx))
  }

  function updateItem(idx: number, field: keyof ReportItem, value: any) {
    setItems((prev) => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item))
  }

  // Job сонгоход барилга, давхар автомат
  function onJobChange(idx: number, jobId: string) {
    const job = projectJobs.find((j) => j.job_id === jobId)
    updateItem(idx, 'job_id', jobId)
    if (job) {
      updateItem(idx, 'building_no', job.building_no)
      updateItem(idx, 'floor_no', job.floor_no)
    }
  }

  const buildings = [...new Set(projectJobs.map((j) => j.building_no))]
  const floors = (building: string) => [...new Set(projectJobs.filter((j) => j.building_no === building).map((j) => j.floor_no))]

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (items.some((item) => !item.staff_id || !item.job_id || !item.performed_qty)) {
      toast.error('Бүх мөрийг бүрэн бөглөнө үү')
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const { data: staff } = await supabase.from('staffs').select('staff_id').eq('email', user?.email).single()

    const weekId = getWeekId(new Date(form.report_date))
    const reportId = generateDailyReportId(form.project_id, weekId, new Date(form.report_date), 1)

    const { error: reportError } = await supabase.from('daily_reports').insert({
      daily_report_id: reportId,
      project_id: form.project_id,
      report_date: form.report_date,
      shift: form.shift,
      work_start: form.work_start,
      work_end: form.work_end,
      safety_briefing: form.safety_briefing,
      ventilation_ok: form.ventilation_ok,
      notes: form.notes || null,
      status: 'draft',
      created_by: staff?.staff_id,
    })

    if (reportError) {
      toast.error('Алдаа', { description: reportError.message })
      setLoading(false)
      return
    }

    const { error: itemsError } = await supabase.from('daily_report_items').insert(
      items.map((item) => ({
        daily_report_id: reportId,
        staff_id: item.staff_id,
        building_no: item.building_no,
        floor_no: Number(item.floor_no),
        job_id: item.job_id,
        performed_qty: Number(item.performed_qty),
        performed_hrs: item.performed_hrs ? Number(item.performed_hrs) : null,
        notes: item.notes || null,
      }))
    )

    if (itemsError) {
      toast.error('Мөрүүд оруулахад алдаа', { description: itemsError.message })
      setLoading(false)
      return
    }

    toast.success('Тайлан амжилттай үүслээ')
    router.push(`/daily-reports/${reportId}`)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/daily-reports" className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">Шинэ Өдрийн Тайлан</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Үндсэн мэдээлэл</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Төсөл *</label>
              <select
                value={form.project_id}
                onChange={(e) => setForm((p) => ({ ...p, project_id: e.target.value }))}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">— Төсөл сонгох —</option>
                {projects.map((p) => (
                  <option key={p.project_id} value={p.project_id}>
                    {p.project_id} — {p.project_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Огноо *</label>
              <input
                type="date"
                value={form.report_date}
                onChange={(e) => setForm((p) => ({ ...p, report_date: e.target.value }))}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Ээлж</label>
              <select
                value={form.shift}
                onChange={(e) => setForm((p) => ({ ...p, shift: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Өдөр">Өдөр</option>
                <option value="Шөнө">Шөнө</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Ажлын эхлэх цаг</label>
              <input
                type="time"
                value={form.work_start}
                onChange={(e) => setForm((p) => ({ ...p, work_start: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Дуусах цаг</label>
              <input
                type="time"
                value={form.work_end}
                onChange={(e) => setForm((p) => ({ ...p, work_end: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.safety_briefing}
                onChange={(e) => setForm((p) => ({ ...p, safety_briefing: e.target.checked }))}
                className="w-4 h-4 rounded border-gray-300 text-blue-600"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Хөдөлмөр хамгаалал зааварчилгаа өгсөн</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.ventilation_ok}
                onChange={(e) => setForm((p) => ({ ...p, ventilation_ok: e.target.checked }))}
                className="w-4 h-4 rounded border-gray-300 text-blue-600"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Агааржуулалт хангалттай</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Тэмдэглэл</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
        </div>

        {/* Items */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
              Ажилтны Гүйцэтгэл ({items.length} мөр)
            </h2>
            <button
              type="button"
              onClick={addItem}
              className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              <Plus className="w-4 h-4" /> Мөр нэмэх
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
                <tr>
                  <th className="text-left px-3 py-2.5 text-xs text-gray-500 font-medium">Ажилтан *</th>
                  <th className="text-left px-3 py-2.5 text-xs text-gray-500 font-medium">Ажил (JobID) *</th>
                  <th className="text-left px-3 py-2.5 text-xs text-gray-500 font-medium">Барилга</th>
                  <th className="text-left px-3 py-2.5 text-xs text-gray-500 font-medium">Давхар</th>
                  <th className="text-right px-3 py-2.5 text-xs text-gray-500 font-medium">Тоо хэмжээ *</th>
                  <th className="text-right px-3 py-2.5 text-xs text-gray-500 font-medium">Цаг</th>
                  <th className="px-3 py-2.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="px-3 py-2">
                      <select
                        value={item.staff_id}
                        onChange={(e) => updateItem(idx, 'staff_id', e.target.value ? Number(e.target.value) : '')}
                        className="w-40 px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded text-xs bg-white dark:bg-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="">— Сонгох —</option>
                        {staffList.map((s) => (
                          <option key={s.staff_id} value={s.staff_id}>
                            {[s.last_name, s.first_name].filter(Boolean).join(' ')}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <select
                        value={item.job_id}
                        onChange={(e) => onJobChange(idx, e.target.value)}
                        className="w-40 px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded text-xs bg-white dark:bg-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="">— JobID —</option>
                        {[...new Set(projectJobs.map((j) => j.job_id))].map((jid) => (
                          <option key={jid} value={jid}>{jid}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <input
                        value={item.building_no}
                        onChange={(e) => updateItem(idx, 'building_no', e.target.value)}
                        className="w-24 px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded text-xs bg-white dark:bg-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="А блок"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        value={item.floor_no}
                        onChange={(e) => updateItem(idx, 'floor_no', e.target.value)}
                        className="w-16 px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded text-xs bg-white dark:bg-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="1"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.performed_qty}
                        onChange={(e) => updateItem(idx, 'performed_qty', e.target.value)}
                        className="w-24 px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded text-xs bg-white dark:bg-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500 text-right"
                        placeholder="0.00"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        value={item.performed_hrs}
                        onChange={(e) => updateItem(idx, 'performed_hrs', e.target.value)}
                        className="w-20 px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded text-xs bg-white dark:bg-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500 text-right"
                        placeholder="8"
                      />
                    </td>
                    <td className="px-3 py-2">
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem(idx)}
                          className="text-gray-400 hover:text-red-500 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Тайлан Хадгалах
          </button>
          <Link
            href="/daily-reports"
            className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 text-center"
          >
            Цуцлах
          </Link>
        </div>
      </form>
    </div>
  )
}
