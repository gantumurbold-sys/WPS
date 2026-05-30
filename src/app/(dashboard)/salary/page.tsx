import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { DollarSign, Plus, Upload } from 'lucide-react'
import SalaryImportButton from '@/components/salary/SalaryImportButton'

export default async function SalaryPage() {
  const supabase = await createClient()

  // Сарын жагсаалт авах
  const { data: months } = await supabase
    .from('salary_records')
    .select('salary_month')
    .order('salary_month', { ascending: false })

  const uniqueMonths = [...new Set(months?.map((m) => m.salary_month) || [])]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-blue-600" />
          <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">Цалингийн Бүртгэл</h1>
        </div>
        <SalaryImportButton />
      </div>

      {uniqueMonths.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
          <Upload className="w-8 h-8 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Цалингийн мэдээлэл байхгүй байна.</p>
          <p className="text-gray-400 text-xs mt-1">Excel-ээс импорт хийнэ үү.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {uniqueMonths.map((month) => (
            <Link
              key={month}
              href={`/salary/${month}`}
              className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:border-blue-300 hover:shadow-md transition group"
            >
              <DollarSign className="w-8 h-8 text-blue-400 group-hover:text-blue-600 transition mb-3" />
              <p className="text-lg font-bold text-gray-800 dark:text-gray-100">{month}</p>
              <p className="text-xs text-gray-400 mt-1">Цалингийн тооцоо харах</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
