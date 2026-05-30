import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'
import { User, MessageSquare } from 'lucide-react'

export default async function MyPerformancePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: staff } = await supabase
    .from('staffs')
    .select('*')
    .eq('email', user.email)
    .single()

  if (!staff) redirect('/auth/login')

  const { data: performances } = await supabase
    .from('project_performance')
    .select(`
      *,
      project:projects(project_id, project_name)
    `)
    .eq('staff_id', staff.staff_id)
    .order('performed_date', { ascending: false })
    .limit(100)

  const approved = performances?.filter((p) => p.is_approved) || []
  const pending = performances?.filter((p) => !p.is_approved && !p.rejection_reason) || []
  const rejected = performances?.filter((p) => p.rejection_reason) || []

  const totalApprovedHrs = approved.reduce((s, p) => s + (p.performed_hrs || 0), 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <User className="w-5 h-5 text-blue-600" />
          <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">Миний Гүйцэтгэл</h1>
        </div>
        <Link
          href="/my-performance/requests"
          className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          <MessageSquare className="w-4 h-4" />
          Тодруулах Хүсэлт
        </Link>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Батлагдсан', count: approved.length, hrs: totalApprovedHrs, color: 'bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300' },
          { label: 'Хүлээгдэж байна', count: pending.length, hrs: 0, color: 'bg-yellow-50 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-300' },
          { label: 'Буцаагдсан', count: rejected.length, hrs: 0, color: 'bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300' },
        ].map((s) => (
          <div key={s.label} className={`${s.color} rounded-xl p-5`}>
            <p className="text-3xl font-bold">{s.count}</p>
            <p className="text-sm mt-1">{s.label}</p>
            {s.hrs > 0 && <p className="text-xs opacity-70 mt-1">{s.hrs.toFixed(1)} хүн.цаг</p>}
          </div>
        ))}
      </div>

      {/* Table */}
      {['Батлагдсан', 'Хүлээгдэж байна', 'Буцаагдсан'].map((section, si) => {
        const data = si === 0 ? approved : si === 1 ? pending : rejected
        if (data.length === 0) return null

        return (
          <div key={section} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">{section}</h2>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="text-left px-4 py-2 text-xs text-gray-500 font-medium">Огноо</th>
                  <th className="text-left px-4 py-2 text-xs text-gray-500 font-medium">Төсөл</th>
                  <th className="text-left px-4 py-2 text-xs text-gray-500 font-medium">Ажил</th>
                  <th className="text-left px-4 py-2 text-xs text-gray-500 font-medium">Барилга/Давхар</th>
                  <th className="text-right px-4 py-2 text-xs text-gray-500 font-medium">Тоо хэмжээ</th>
                  <th className="text-right px-4 py-2 text-xs text-gray-500 font-medium">Хүн.цаг</th>
                  {si === 2 && <th className="text-left px-4 py-2 text-xs text-gray-500 font-medium">Шалтгаан</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {data.map((p: any) => (
                  <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-4 py-2.5 text-xs text-gray-500">{formatDate(p.performed_date)}</td>
                    <td className="px-4 py-2.5 text-xs font-mono text-blue-600">{p.project?.project_id}</td>
                    <td className="px-4 py-2.5 text-xs font-mono text-gray-600 dark:text-gray-400">{p.job_id}</td>
                    <td className="px-4 py-2.5 text-xs text-gray-500">{p.building_no}/{p.floor_no}F</td>
                    <td className="px-4 py-2.5 text-right text-xs">{p.performed_qty}</td>
                    <td className="px-4 py-2.5 text-right text-xs text-gray-500">{p.performed_hrs || '—'}</td>
                    {si === 2 && (
                      <td className="px-4 py-2.5 text-xs text-red-500">{p.rejection_reason || '—'}</td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      })}
    </div>
  )
}
