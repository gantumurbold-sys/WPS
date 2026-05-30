'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Calculator, Loader2 } from 'lucide-react'
import { calculatePerformanceBonus } from '@/lib/utils'

interface Props {
  month: string
}

export default function SalaryCalculateButton({ month }: Props) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleCalculate() {
    setLoading(true)
    const supabase = createClient()

    // Settings авах
    const { data: settings } = await supabase.from('settings').select('key, value')
    const settingsMap = Object.fromEntries((settings || []).map((s) => [s.key, parseFloat(s.value)]))
    const bonusRate = settingsMap.perform_bonus_rate || 5000
    const pensionRate = settingsMap.pension_rate || 0.115
    const incomeTaxRate = settingsMap.income_tax_rate || 0.10

    // Тухайн сарын цалингийн бүртгэл
    const { data: salaryRecords } = await supabase
      .from('salary_records')
      .select('*')
      .eq('salary_month', month)

    if (!salaryRecords || salaryRecords.length === 0) {
      toast.error('Цалингийн мэдээлэл байхгүй байна')
      setLoading(false)
      return
    }

    // Сарын эхлэл, дуусах огноо тооцоолох
    const [year, mon] = month.split('.').map(Number)
    const monthStart = `${year}-${String(mon).padStart(2, '0')}-01`
    const monthEnd = new Date(year, mon, 0).toISOString().split('T')[0]

    // Ажилтан бүрийн батлагдсан хүн.цаг тооцоолох
    const bonusRecords = []
    for (const sr of salaryRecords) {
      const { data: perfData } = await supabase
        .from('project_performance')
        .select('performed_hrs, job_id, performed_qty, project_id, building_no, floor_no')
        .eq('staff_id', sr.staff_id)
        .eq('is_approved', true)
        .gte('performed_date', monthStart)
        .lte('performed_date', monthEnd)

      const totalApprovedHrs = perfData?.reduce((s, p) => s + (p.performed_hrs || 0), 0) || 0
      const performManHours = Math.max(0, totalApprovedHrs - (sr.total_calc_hrs || 0))

      const { performBonus, pension, incomeTax, totalBonus } = calculatePerformanceBonus(
        performManHours, bonusRate, pensionRate, incomeTaxRate
      )

      for (const perf of (perfData || [])) {
        bonusRecords.push({
          staff_id: sr.staff_id,
          salary_month: month,
          project_id: perf.project_id,
          building_no: perf.building_no,
          floor_no: perf.floor_no,
          job_id: perf.job_id,
          performed_qty: perf.performed_qty,
          perform_man_hours: performManHours,
          unit_bonus_rate: bonusRate,
          perform_bonus: performBonus,
          pension,
          income_tax: incomeTax,
          total_bonus: totalBonus,
        })
      }
    }

    // Хуучин устгаад шинэ оруулах
    await supabase.from('salary_performance_bonus').delete().eq('salary_month', month)

    if (bonusRecords.length > 0) {
      const { error } = await supabase.from('salary_performance_bonus').insert(bonusRecords)
      if (error) {
        toast.error('Тооцоолоход алдаа', { description: error.message })
        setLoading(false)
        return
      }
    }

    toast.success('Хийснээрх цалин амжилттай тооцооллоо')
    router.refresh()
    setLoading(false)
  }

  return (
    <button
      onClick={handleCalculate}
      disabled={loading}
      className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition disabled:opacity-60"
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calculator className="w-4 h-4" />}
      Тооцоолох
    </button>
  )
}
