import { createClient } from '@/lib/supabase/server'
import { Trophy, AlertTriangle } from 'lucide-react'

interface StaffPerf {
  staff_id: number
  first_name: string
  last_name: string | null
  department: string
  total_hrs: number
}

export default async function StaffRanking() {
  const supabase = await createClient()

  const { data: perfData } = await supabase
    .from('project_performance')
    .select('staff_id, performed_hrs')
    .eq('is_approved', true)

  if (!perfData || perfData.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6 text-center text-gray-400 text-sm">
        Батлагдсан гүйцэтгэл байхгүй
      </div>
    )
  }

  // Staff-аар нэгтгэх
  const staffMap = new Map<number, number>()
  perfData.forEach((p) => {
    const curr = staffMap.get(p.staff_id) || 0
    staffMap.set(p.staff_id, curr + (p.performed_hrs || 0))
  })

  const staffIds = Array.from(staffMap.keys())
  const { data: staffList } = await supabase
    .from('staffs')
    .select('staff_id, first_name, last_name, department')
    .in('staff_id', staffIds)

  const ranking: StaffPerf[] = (staffList || []).map((s) => ({
    ...s,
    total_hrs: staffMap.get(s.staff_id) || 0,
  })).sort((a, b) => b.total_hrs - a.total_hrs)

  const top3 = ranking.slice(0, 3)
  const bottom3 = ranking.slice(-3).reverse()

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
        Ажилтны Гүйцэтгэлийн Эрэмбэ
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top 3 */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Хамгийн Идэвхтэй 3
            </span>
          </div>
          <div className="space-y-2">
            {top3.map((staff, idx) => (
              <div
                key={staff.staff_id}
                className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950 rounded-lg"
              >
                <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">
                    {[staff.last_name, staff.first_name].filter(Boolean).join(' ')}
                  </p>
                  <p className="text-xs text-gray-500">{staff.department}</p>
                </div>
                <span className="text-sm font-bold text-green-600 flex-shrink-0">
                  {staff.total_hrs.toFixed(1)}ц
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom 3 */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-orange-500" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Хамгийн Бага Гүйцэтгэлтэй 3
            </span>
          </div>
          <div className="space-y-2">
            {bottom3.map((staff, idx) => (
              <div
                key={staff.staff_id}
                className="flex items-center gap-3 p-3 bg-orange-50 dark:bg-orange-950 rounded-lg"
              >
                <span className="w-6 h-6 bg-orange-400 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {ranking.length - 2 + idx}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">
                    {[staff.last_name, staff.first_name].filter(Boolean).join(' ')}
                  </p>
                  <p className="text-xs text-gray-500">{staff.department}</p>
                </div>
                <span className="text-sm font-bold text-orange-600 flex-shrink-0">
                  {staff.total_hrs.toFixed(1)}ц
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
