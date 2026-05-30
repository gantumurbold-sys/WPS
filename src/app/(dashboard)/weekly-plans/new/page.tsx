'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { ArrowLeft, Plus, Trash2, Loader2 } from 'lucide-react'
import { getWeekId, getWeekDates, formatDate } from '@/lib/utils'
import { Project } from '@/types/database'

interface PlanItem {
  building_no: string
  floor_no: number | ''
  job_id: string
  planned_qty: number | ''
}

export default function NewWeeklyPlanPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [projects, setProjects] = useState<Project[]>([])

  const now = new Date()
  const weekId = getWeekId(now)
  const { start, end } = getWeekDates(weekId)

  const [form, setForm] = useState({
    project_id: '',
    week_start: formatDate(start),
    week_end: formatDate(end),
    shift: 'Өдөр',
    notes: '',
  })

  const [items, setItems] = useState<PlanItem[]>([
    { building_no: '', floor_no: '', job_id: '', planned_qty: '' }
  ])

  useEffect(() => {
    const supabase = createClient()
    supabase.from('projects').select('*').eq('status', 'active').then(({ data }) => {
      if (data) setProjects(data)
    })
  }, [])

  function addItem() {
    setItems((prev) => [...prev, { building_no: '', floor_no: '', job_id: '', planned_qty: '' }])
  }

  function removeItem(idx: number) {
    setItems((prev) => prev.filter((_, i) => i !== idx))
  }

  function updateItem(idx: number, field: keyof PlanItem, value: any) {
    setItems((prev) => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const { data: staff } = await supabase.from('staffs').select('staff_id, role').eq('email', user?.email).single()

    const status = staff?.role === 'foreman' ? 'submitted' : 'draft'
    const currentWeekId = `${form.week_start.slice(2, 4)}-W${getWeekNumber(new Date(form.week_start))}`

    const { error: planError } = await supabase.from('weekly_plans').insert({
      weekly_id: currentWeekId,
      project_id: form.project_id,
      week_start: form.week_start,
      week_end: form.week_end,
      shift: form.shift,
      status,
      notes: form.notes || null,
      created_by: staff?.staff_id,
    })

    if (planError) {
      toast.error('Алдаа', { description: planError.message })
      setLoading(false)
      return
    }

    const validItems = items.filter((i) => i.building_no && i.job_id && i.planned_qty)
    if (validItems.length > 0) {
      await supabase.from('weekly_plan_items').insert(
        validItems.map((i) => ({
          weekly_id: currentWeekId,
          building_no: i.building_no,
          floor_no: Number(i.floor_no) || 1,
          job_id: i.job_id,
          planned_qty: Number(i.planned_qty),
        }))
      )
    }

    toast.success('7 хоногийн төлөвлөгөө үүслээ')
    router.push(`/weekly-plans/${currentWeekId}`)
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/weekly-plans" className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">Шинэ 7 Хоногийн Төлөвлөгөө</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
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
                {projects.map((p) => <option key={p.project_id} value={p.project_id}>{p.project_id} — {p.project_name}</option>)}
              </select>
            </div>
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Эхлэх огноо</label>
              <input type="date" value={form.week_start}
                onChange={(e) => setForm((p) => ({ ...p, week_start: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Дуусах огноо</label>
              <input type="date" value={form.week_end}
                onChange={(e) => setForm((p) => ({ ...p, week_end: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
        </div>

        {/* Plan items */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="flex justify-between items-center px-5 py-3 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Ажлуудын Жагсаалт</h2>
            <button type="button" onClick={addItem} className="text-sm text-blue-600 font-medium inline-flex items-center gap-1">
              <Plus className="w-4 h-4" /> Нэмэх
            </button>
          </div>
          <div className="p-4 space-y-2">
            {items.map((item, idx) => (
              <div key={idx} className="grid grid-cols-5 gap-2 items-center">
                <input
                  value={item.building_no}
                  onChange={(e) => updateItem(idx, 'building_no', e.target.value)}
                  placeholder="Барилга"
                  className="px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded text-xs bg-white dark:bg-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <input
                  type="number"
                  value={item.floor_no}
                  onChange={(e) => updateItem(idx, 'floor_no', e.target.value)}
                  placeholder="Давхар"
                  className="px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded text-xs bg-white dark:bg-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <input
                  value={item.job_id}
                  onChange={(e) => updateItem(idx, 'job_id', e.target.value)}
                  placeholder="JobID"
                  className="px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded text-xs bg-white dark:bg-gray-800 font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <input
                  type="number"
                  step="0.01"
                  value={item.planned_qty}
                  onChange={(e) => updateItem(idx, 'planned_qty', e.target.value)}
                  placeholder="Тоо хэмжээ"
                  className="px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded text-xs bg-white dark:bg-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500 text-right"
                />
                <button type="button" onClick={() => removeItem(idx)} className="text-gray-400 hover:text-red-500">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={loading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 disabled:opacity-60">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Хадгалах
          </button>
          <Link href="/weekly-plans" className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-600 dark:text-gray-400 text-center">
            Цуцлах
          </Link>
        </div>
      </form>
    </div>
  )
}

function getWeekNumber(date: Date) {
  const startOfYear = new Date(date.getFullYear(), 0, 1)
  return Math.ceil(((date.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7)
}
