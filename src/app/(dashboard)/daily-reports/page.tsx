import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { formatDate, getStatusColor, getStatusLabel } from '@/lib/utils'
import { Plus, ClipboardList } from 'lucide-react'

export default async function DailyReportsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  const { data: staff } = await supabase
    .from('staffs')
    .select('staff_id, role')
    .eq('email', user?.email)
    .single()

  let query = supabase
    .from('daily_reports')
    .select(`
      *,
      project:projects(project_id, project_name),
      creator:staffs!daily_reports_created_by_fkey(first_name, last_name)
    `)
    .order('report_date', { ascending: false })
    .limit(50)

  // Foreman зөвхөн өөрийнхийг харна
  if (staff?.role === 'foreman') {
    query = query.eq('created_by', staff.staff_id)
  }

  const { data: reports } = await query

  const canCreate = ['foreman', 'admin', 'superadmin'].includes(staff?.role || '')

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-blue-600" />
          <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">Өдрийн Тайлан</h1>
        </div>
        {canCreate && (
          <Link
            href="/daily-reports/new"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
          >
            <Plus className="w-4 h-4" />
            Шинэ Тайлан
          </Link>
        )}
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Тайлан ID</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Огноо</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Төсөл</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Ээлж</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Форман</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Төлөв</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {!reports || reports.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-gray-400">
                  Тайлан байхгүй байна
                </td>
              </tr>
            ) : (
              reports.map((r: any) => (
                <tr key={r.daily_report_id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                  <td className="px-4 py-3 font-mono text-xs text-blue-600">{r.daily_report_id}</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{formatDate(r.report_date)}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                    <span className="font-mono font-bold text-xs">{r.project?.project_id}</span>
                    <span className="ml-1 text-xs text-gray-400">{r.project?.project_name}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{r.shift}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-xs">
                    {r.creator ? [r.creator.last_name, r.creator.first_name].filter(Boolean).join(' ') : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${getStatusColor(r.status)}`}>
                      {getStatusLabel(r.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/daily-reports/${r.daily_report_id}`}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      Харах
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
