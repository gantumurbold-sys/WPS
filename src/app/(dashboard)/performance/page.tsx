import { createClient } from '@/lib/supabase/server'
import { formatDate, getStatusColor } from '@/lib/utils'
import { CheckSquare } from 'lucide-react'
import BulkApproveButton from '@/components/performance/BulkApproveButton'

export default async function PerformancePage() {
  const supabase = await createClient()

  const { data: performances } = await supabase
    .from('project_performance')
    .select(`
      *,
      project:projects(project_id, project_name),
      staff:staffs(staff_id, first_name, last_name, department)
    `)
    .order('performed_date', { ascending: false })
    .limit(100)

  const pending = performances?.filter((p) => !p.is_approved && !p.rejection_reason) || []

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckSquare className="w-5 h-5 text-blue-600" />
          <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">Гүйцэтгэлийн Хяналт</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-yellow-600 bg-yellow-50 dark:bg-yellow-950 px-3 py-1 rounded-full">
            {pending.length} хүлээгдэж байна
          </span>
          <BulkApproveButton pendingIds={pending.map((p) => p.id)} />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Огноо</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Ажилтан</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Төсөл</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Ажил</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Барилга/Давхар</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Тоо хэмжээ</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Хүн.цаг</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Төлөв</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {!performances || performances.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-12 text-gray-400">Гүйцэтгэл байхгүй</td>
              </tr>
            ) : (
              performances.map((p: any) => (
                <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="px-4 py-2.5 text-gray-600 dark:text-gray-400 text-xs">{formatDate(p.performed_date)}</td>
                  <td className="px-4 py-2.5">
                    <p className="text-xs font-medium text-gray-800 dark:text-gray-100">
                      {[p.staff?.last_name, p.staff?.first_name].filter(Boolean).join(' ')}
                    </p>
                    <p className="text-xs text-gray-400">{p.staff?.department}</p>
                  </td>
                  <td className="px-4 py-2.5 text-xs font-mono text-blue-600">{p.project?.project_id}</td>
                  <td className="px-4 py-2.5 text-xs font-mono text-gray-600 dark:text-gray-400">{p.job_id}</td>
                  <td className="px-4 py-2.5 text-xs text-gray-500">{p.building_no} / {p.floor_no}F</td>
                  <td className="px-4 py-2.5 text-right text-xs text-gray-800 dark:text-gray-100">{p.performed_qty}</td>
                  <td className="px-4 py-2.5 text-right text-xs text-gray-600 dark:text-gray-400">{p.performed_hrs || '—'}</td>
                  <td className="px-4 py-2.5">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      p.is_approved ? 'bg-green-100 text-green-700' :
                      p.rejection_reason ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {p.is_approved ? 'Батлагдсан' : p.rejection_reason ? 'Буцаагдсан' : 'Хүлээгдэж байна'}
                    </span>
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
