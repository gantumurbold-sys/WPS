import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { formatDate, getStatusColor, getStatusLabel } from '@/lib/utils'
import { ArrowLeft } from 'lucide-react'
import WeeklyPlanApprovalActions from '@/components/weekly-plans/WeeklyPlanApprovalActions'

interface Props {
  params: Promise<{ id: string }>
}

export default async function WeeklyPlanDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: plan } = await supabase
    .from('weekly_plans')
    .select(`
      *,
      project:projects(project_id, project_name),
      creator:staffs!weekly_plans_created_by_fkey(first_name, last_name),
      approver:staffs!weekly_plans_approved_by_fkey(first_name, last_name),
      weekly_plan_items(*)
    `)
    .eq('weekly_id', id)
    .single()

  if (!plan) notFound()

  const { data: currentStaff } = await supabase.from('staffs').select('role, staff_id').eq(
    'email', (await supabase.auth.getUser()).data.user?.email
  ).single()

  const canApprove = ['superadmin', 'admin', 'chief_eng', 'project_manager'].includes(currentStaff?.role || '')

  return (
    <div className="max-w-3xl space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/weekly-plans" className="text-gray-400 hover:text-gray-600">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-gray-800 dark:text-gray-100 font-mono">{plan.weekly_id}</h1>
            <p className="text-sm text-gray-500">{plan.project?.project_name}</p>
          </div>
        </div>
        <span className={`text-sm px-3 py-1 rounded-full font-medium ${getStatusColor(plan.status)}`}>
          {getStatusLabel(plan.status)}
        </span>
      </div>

      {/* Info */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Хугацаа', value: `${formatDate(plan.week_start)} — ${formatDate(plan.week_end)}` },
          { label: 'Ээлж', value: plan.shift },
          { label: 'Үүсгэсэн', value: plan.creator ? [plan.creator.last_name, plan.creator.first_name].filter(Boolean).join(' ') : '—' },
        ].map((item) => (
          <div key={item.label} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-xs text-gray-400 mb-1">{item.label}</p>
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{item.value}</p>
          </div>
        ))}
      </div>

      {/* Items */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Төлөвлөгдсөн Ажлууд ({plan.weekly_plan_items?.length || 0})
          </h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="text-left px-4 py-2 text-xs text-gray-500 font-medium">Барилга</th>
              <th className="text-left px-4 py-2 text-xs text-gray-500 font-medium">Давхар</th>
              <th className="text-left px-4 py-2 text-xs text-gray-500 font-medium">JobID</th>
              <th className="text-right px-4 py-2 text-xs text-gray-500 font-medium">Төлөвлөсөн тоо</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
            {plan.weekly_plan_items?.map((item: any) => (
              <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                <td className="px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300">{item.building_no}</td>
                <td className="px-4 py-2.5 text-xs text-gray-500">{item.floor_no}-р давхар</td>
                <td className="px-4 py-2.5 text-xs font-mono text-blue-600">{item.job_id}</td>
                <td className="px-4 py-2.5 text-right font-medium text-gray-800 dark:text-gray-100">{item.planned_qty}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {plan.notes && (
        <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 text-sm text-yellow-700 dark:text-yellow-300">
          <strong>Тэмдэглэл:</strong> {plan.notes}
        </div>
      )}

      {canApprove && ['submitted', 'draft'].includes(plan.status) && (
        <WeeklyPlanApprovalActions weeklyId={plan.weekly_id} />
      )}
    </div>
  )
}
