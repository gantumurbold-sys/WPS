import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { formatDate, getStatusColor, getStatusLabel } from '@/lib/utils'
import { Plus, CalendarDays } from 'lucide-react'

export default async function WeeklyPlansPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  const { data: staff } = await supabase.from('staffs').select('role, staff_id').eq('email', user?.email).single()

  const { data: plans } = await supabase
    .from('weekly_plans')
    .select(`
      *,
      project:projects(project_id, project_name),
      creator:staffs!weekly_plans_created_by_fkey(first_name, last_name)
    `)
    .order('week_start', { ascending: false })
    .limit(30)

  const canCreate = ['superadmin', 'admin', 'project_manager', 'foreman'].includes(staff?.role || '')

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-blue-600" />
          <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">7 Хоногийн Төлөвлөгөө</h1>
        </div>
        {canCreate && (
          <Link
            href="/weekly-plans/new"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
          >
            <Plus className="w-4 h-4" />
            Шинэ Төлөвлөгөө
          </Link>
        )}
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Долоо хоног</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Хугацаа</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Төсөл</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Ээлж</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Үүсгэсэн</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Төлөв</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {!plans || plans.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-gray-400">Төлөвлөгөө байхгүй байна</td>
              </tr>
            ) : (
              plans.map((plan: any) => (
                <tr key={plan.weekly_id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="px-4 py-3 font-mono font-bold text-blue-600 text-xs">{plan.weekly_id}</td>
                  <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400">
                    {formatDate(plan.week_start)} — {formatDate(plan.week_end)}
                  </td>
                  <td className="px-4 py-3 text-xs">
                    <span className="font-mono font-bold text-gray-800 dark:text-gray-100">{plan.project?.project_id}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">{plan.shift}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {plan.creator ? [plan.creator.last_name, plan.creator.first_name].filter(Boolean).join(' ') : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${getStatusColor(plan.status)}`}>
                      {getStatusLabel(plan.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/weekly-plans/${plan.weekly_id}`} className="text-xs text-blue-600 hover:underline">
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
