import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { formatDate, getStatusColor, getStatusLabel } from '@/lib/utils'
import { ArrowLeft, CheckCircle2, XCircle, Shield, Wind } from 'lucide-react'
import DailyReportActions from '@/components/daily-reports/DailyReportActions'

interface Props {
  params: Promise<{ id: string }>
}

export default async function DailyReportDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: report } = await supabase
    .from('daily_reports')
    .select(`
      *,
      project:projects(project_id, project_name),
      creator:staffs!daily_reports_created_by_fkey(first_name, last_name, department),
      reviewer:staffs!daily_reports_reviewed_by_fkey(first_name, last_name),
      daily_report_items(
        *,
        staff:staffs(staff_id, first_name, last_name, department)
      )
    `)
    .eq('daily_report_id', id)
    .single()

  if (!report) notFound()

  const { data: currentStaff } = await supabase.from('staffs').select('role, staff_id').eq(
    'email', (await supabase.auth.getUser()).data.user?.email
  ).single()

  const canApprove = ['admin', 'superadmin', 'chief_eng', 'project_manager'].includes(currentStaff?.role || '')
  const canSubmit = currentStaff?.staff_id === report.created_by && report.status === 'draft'

  const totalQty = report.daily_report_items?.reduce((s: number, i: any) => s + i.performed_qty, 0) || 0
  const totalHrs = report.daily_report_items?.reduce((s: number, i: any) => s + (i.performed_hrs || 0), 0) || 0

  return (
    <div className="max-w-4xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/daily-reports" className="text-gray-400 hover:text-gray-600">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-gray-800 dark:text-gray-100 font-mono">{report.daily_report_id}</h1>
            <p className="text-sm text-gray-500">{report.project?.project_name}</p>
          </div>
        </div>
        <span className={`text-sm px-3 py-1 rounded-full font-medium ${getStatusColor(report.status)}`}>
          {getStatusLabel(report.status)}
        </span>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Огноо', value: formatDate(report.report_date) },
          { label: 'Ээлж', value: report.shift },
          { label: 'Ажлын цаг', value: `${report.work_start || '—'} — ${report.work_end || '—'}` },
          { label: 'Нийт ажилтан', value: `${report.daily_report_items?.length || 0} хүн` },
        ].map((item) => (
          <div key={item.label} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-xs text-gray-400 mb-1">{item.label}</p>
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{item.value}</p>
          </div>
        ))}
      </div>

      {/* Safety & Ventilation */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4 flex gap-6">
        <div className={`flex items-center gap-2 text-sm ${report.safety_briefing ? 'text-green-600' : 'text-red-500'}`}>
          <Shield className="w-4 h-4" />
          Хөдөлмөр хамгаалал: <strong>{report.safety_briefing ? 'Тийм' : 'Үгүй'}</strong>
        </div>
        <div className={`flex items-center gap-2 text-sm ${report.ventilation_ok ? 'text-green-600' : 'text-red-500'}`}>
          <Wind className="w-4 h-4" />
          Агааржуулалт: <strong>{report.ventilation_ok ? 'Хангалттай' : 'Хангалтгүй'}</strong>
        </div>
      </div>

      {/* Items */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex justify-between">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Гүйцэтгэлийн Жагсаалт
          </h2>
          <div className="text-xs text-gray-500 flex gap-4">
            <span>Нийт: <strong className="text-gray-800 dark:text-gray-100">{totalQty.toFixed(2)}</strong></span>
            <span>Хүн.цаг: <strong className="text-gray-800 dark:text-gray-100">{totalHrs.toFixed(2)}</strong></span>
          </div>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="text-left px-4 py-2 text-xs text-gray-500 font-medium">Ажилтан</th>
              <th className="text-left px-4 py-2 text-xs text-gray-500 font-medium">Ажил (JobID)</th>
              <th className="text-left px-4 py-2 text-xs text-gray-500 font-medium">Барилга / Давхар</th>
              <th className="text-right px-4 py-2 text-xs text-gray-500 font-medium">Тоо хэмжээ</th>
              <th className="text-right px-4 py-2 text-xs text-gray-500 font-medium">Цаг</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
            {report.daily_report_items?.map((item: any) => (
              <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                <td className="px-4 py-2.5">
                  <p className="font-medium text-gray-800 dark:text-gray-100 text-xs">
                    {[item.staff?.last_name, item.staff?.first_name].filter(Boolean).join(' ')}
                  </p>
                  <p className="text-xs text-gray-400">{item.staff?.department}</p>
                </td>
                <td className="px-4 py-2.5 font-mono text-xs text-blue-600">{item.job_id}</td>
                <td className="px-4 py-2.5 text-xs text-gray-500">
                  {item.building_no} / {item.floor_no}-р давхар
                </td>
                <td className="px-4 py-2.5 text-right text-gray-800 dark:text-gray-100">{item.performed_qty}</td>
                <td className="px-4 py-2.5 text-right text-gray-600 dark:text-gray-400">{item.performed_hrs || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Notes */}
      {report.notes && (
        <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 text-sm text-yellow-700 dark:text-yellow-300">
          <strong>Тэмдэглэл:</strong> {report.notes}
        </div>
      )}

      {/* Actions */}
      <DailyReportActions
        report={report}
        canSubmit={canSubmit}
        canApprove={canApprove}
      />
    </div>
  )
}
