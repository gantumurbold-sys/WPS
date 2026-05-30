'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { ROLE_LABELS, DEPARTMENTS, STAFF_TYPES } from '@/lib/constants'
import { Staff, Role } from '@/types/database'

export default function StaffDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [staff, setStaff] = useState<Staff | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.from('staffs').select('*').eq('staff_id', params.id).single().then(({ data }) => {
      if (data) setStaff(data)
    })
  }, [params.id])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!staff) return
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase
      .from('staffs')
      .update({
        first_name: staff.first_name,
        last_name: staff.last_name,
        department: staff.department,
        staff_type: staff.staff_type,
        role: staff.role,
        email: staff.email,
        phone: staff.phone,
        is_active: staff.is_active,
      })
      .eq('staff_id', staff.staff_id)

    if (error) {
      toast.error('Алдаа', { description: error.message })
    } else {
      toast.success('Амжилттай хадгаллаа')
      router.refresh()
    }
    setLoading(false)
  }

  if (!staff) return <div className="text-gray-400 text-sm py-8 text-center">Ачааллаж байна...</div>

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/staff" className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">
          Ажилтан #{staff.staff_id}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Овог</label>
            <input
              value={staff.last_name || ''}
              onChange={(e) => setStaff((p) => p ? { ...p, last_name: e.target.value } : p)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Нэр *</label>
            <input
              value={staff.first_name}
              onChange={(e) => setStaff((p) => p ? { ...p, first_name: e.target.value } : p)}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Алба</label>
            <select
              value={staff.department}
              onChange={(e) => setStaff((p) => p ? { ...p, department: e.target.value } : p)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Дүр</label>
            <select
              value={staff.role}
              onChange={(e) => setStaff((p) => p ? { ...p, role: e.target.value as Role } : p)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Object.entries(ROLE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Төрөл</label>
            <select
              value={staff.staff_type}
              onChange={(e) => setStaff((p) => p ? { ...p, staff_type: e.target.value as any } : p)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {STAFF_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">И-мэйл</label>
            <input
              type="email"
              value={staff.email || ''}
              onChange={(e) => setStaff((p) => p ? { ...p, email: e.target.value } : p)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Утас</label>
            <input
              value={staff.phone || ''}
              onChange={(e) => setStaff((p) => p ? { ...p, phone: e.target.value } : p)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={staff.is_active}
            onChange={(e) => setStaff((p) => p ? { ...p, is_active: e.target.checked } : p)}
            className="w-4 h-4 rounded border-gray-300 text-blue-600"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">Идэвхтэй</span>
        </label>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Хадгалах
          </button>
          <Link href="/staff" className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-600 dark:text-gray-400 text-center">
            Буцах
          </Link>
        </div>
      </form>
    </div>
  )
}
