import { createClient } from '@/lib/supabase/server'
import { CheckCircle2, Clock, XCircle, FileText, AlertCircle } from 'lucide-react'

export default async function ReportStats() {
  const supabase = await createClient()

  const { data: reports } = await supabase
    .from('daily_reports')
    .select('status')

  const total = reports?.length || 0
  const approved = reports?.filter((r) => r.status === 'approved').length || 0
  const pending = reports?.filter((r) => ['draft', 'submitted', 'reviewed'].includes(r.status)).length || 0
  const submitted = reports?.filter((r) => r.status === 'submitted').length || 0

  const stats = [
    {
      label: 'Нийт тайлан',
      value: total,
      icon: FileText,
      color: 'text-blue-600',
      bg: 'bg-blue-50 dark:bg-blue-950',
    },
    {
      label: 'Батлагдсан',
      value: approved,
      icon: CheckCircle2,
      color: 'text-green-600',
      bg: 'bg-green-50 dark:bg-green-950',
    },
    {
      label: 'Хүлээгдэж байна',
      value: pending,
      icon: Clock,
      color: 'text-yellow-600',
      bg: 'bg-yellow-50 dark:bg-yellow-950',
    },
    {
      label: 'Батлуулахаар илгээсэн',
      value: submitted,
      icon: AlertCircle,
      color: 'text-orange-600',
      bg: 'bg-orange-50 dark:bg-orange-950',
    },
  ]

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
        Тайлангийн Статистик
      </h3>

      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`${stat.bg} rounded-lg p-4 flex items-center gap-3`}
          >
            <stat.icon className={`w-8 h-8 ${stat.color} flex-shrink-0`} />
            <div>
              <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                {stat.value}
              </p>
              <p className="text-xs text-gray-500">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {submitted > 0 && (
        <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-orange-500 flex-shrink-0" />
          <p className="text-xs text-orange-700 dark:text-orange-300">
            <strong>{submitted}</strong> тайлан батлагдахыг хүлээж байна. Шуурхай хянана уу!
          </p>
        </div>
      )}
    </div>
  )
}
