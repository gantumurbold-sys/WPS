import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Download } from 'lucide-react'
import { formatMNT } from '@/lib/utils'
import SalaryExportButton from '@/components/salary/SalaryExportButton'
import SalaryCalculateButton from '@/components/salary/SalaryCalculateButton'

interface Props {
  params: Promise<{ month: string }>
}

export default async function SalaryMonthPage({ params }: Props) {
  const { month } = await params
  const supabase = await createClient()

  const { data: records } = await supabase
    .from('salary_records')
    .select(`
      *,
      staff:staffs(staff_id, first_name, last_name, department)
    `)
    .eq('salary_month', month)
    .order('staff_id')

  if (!records || records.length === 0) notFound()

  const { data: bonuses } = await supabase
    .from('salary_performance_bonus')
    .select('*')
    .eq('salary_month', month)

  const bonusMap = new Map(bonuses?.map((b) => [b.staff_id, b]) || [])

  const totalNet = records.reduce((s, r) => s + (r.net_salary || 0), 0)
  const totalBonus = bonuses?.reduce((s, b) => s + (b.total_bonus || 0), 0) || 0

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/salary" className="text-gray-400 hover:text-gray-600">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">
            {month} — Цалингийн Тооцоо
          </h1>
        </div>
        <div className="flex gap-2">
          <SalaryCalculateButton month={month} />
          <SalaryExportButton month={month} records={records} bonusMap={Object.fromEntries(bonusMap)} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-xs text-gray-400 mb-1">Нийт ажилтан</p>
          <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{records.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-xs text-gray-400 mb-1">Нийт гарт олгосон цалин</p>
          <p className="text-2xl font-bold text-green-600">{formatMNT(totalNet)}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-xs text-gray-400 mb-1">Нийт хийснээрх олговор</p>
          <p className="text-2xl font-bold text-blue-600">{formatMNT(totalBonus)}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Ажилтан</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Үндсэн цаг</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Нийт цаг</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Нэгж цалин</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600 dark:text-gray-400">НДШ</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600 dark:text-gray-400">ХХОАТ</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Гарт олгосон</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Хийснээрх</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {records.map((r: any) => {
              const bonus = bonusMap.get(r.staff_id)
              return (
                <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-800 dark:text-gray-100 text-xs">
                      {[r.staff?.last_name, r.staff?.first_name].filter(Boolean).join(' ')}
                    </p>
                    <p className="text-xs text-gray-400">{r.staff?.department}</p>
                  </td>
                  <td className="px-4 py-3 text-right text-xs text-gray-600 dark:text-gray-400">{r.base_hours}</td>
                  <td className="px-4 py-3 text-right text-xs text-gray-600 dark:text-gray-400">{r.total_calc_hrs}</td>
                  <td className="px-4 py-3 text-right text-xs text-gray-600 dark:text-gray-400">{r.hourly_rate?.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-xs text-orange-600">{formatMNT(r.pension || 0)}</td>
                  <td className="px-4 py-3 text-right text-xs text-orange-600">{formatMNT(r.income_tax || 0)}</td>
                  <td className="px-4 py-3 text-right text-xs font-semibold text-green-600">{formatMNT(r.net_salary || 0)}</td>
                  <td className="px-4 py-3 text-right text-xs font-semibold text-blue-600">
                    {bonus ? formatMNT(bonus.total_bonus || 0) : '—'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
