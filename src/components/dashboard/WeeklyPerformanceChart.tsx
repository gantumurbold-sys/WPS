'use client'

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { subWeeks, startOfWeek, endOfWeek, format } from 'date-fns'

interface WeekData {
  week: string
  planned: number
  performed: number
}

async function fetchWeeklyData(): Promise<WeekData[]> {
  const supabase = createClient()
  const weeks: WeekData[] = []

  for (let i = 3; i >= 0; i--) {
    const weekStart = startOfWeek(subWeeks(new Date(), i), { weekStartsOn: 1 })
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 })
    const weekLabel = format(weekStart, 'MM/dd')

    const { data: perfData } = await supabase
      .from('project_performance')
      .select('performed_hrs')
      .gte('performed_date', format(weekStart, 'yyyy-MM-dd'))
      .lte('performed_date', format(weekEnd, 'yyyy-MM-dd'))
      .eq('is_approved', true)

    const performed = perfData?.reduce((s, r) => s + (r.performed_hrs || 0), 0) || 0

    // Planned хүн.цаг — weekly_plan_items-с тооцох
    const { data: planItems } = await supabase
      .from('weekly_plans')
      .select('weekly_plan_items(planned_qty), weekly_id')
      .gte('week_start', format(weekStart, 'yyyy-MM-dd'))
      .lte('week_start', format(weekEnd, 'yyyy-MM-dd'))
      .eq('status', 'approved')

    const planned = planItems?.reduce((sum: number, wp: any) => {
      return sum + (wp.weekly_plan_items?.reduce((s: number, item: any) => s + (item.planned_qty || 0), 0) || 0)
    }, 0) || 0

    weeks.push({ week: weekLabel, planned: Math.round(planned), performed: Math.round(performed) })
  }

  return weeks
}

export default function WeeklyPerformanceChart() {
  const { data, isLoading } = useQuery({
    queryKey: ['weekly-performance'],
    queryFn: fetchWeeklyData,
  })

  if (isLoading) {
    return <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6 h-72 animate-pulse" />
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
        Долоо Хоногийн Гүйцэтгэл (сүүлийн 4 долоо хоног)
      </h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data || []} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis dataKey="week" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip
            formatter={(value: number) => [`${value} хүн.цаг`]}
            labelFormatter={(label) => `${label} долоо хоног`}
          />
          <Legend
            formatter={(value) => value === 'planned' ? 'Төлөвлөгөө' : 'Гүйцэтгэл'}
            wrapperStyle={{ fontSize: 12 }}
          />
          <Bar dataKey="planned" fill="#94A3B8" radius={[4, 4, 0, 0]} />
          <Bar dataKey="performed" fill="#2563EB" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
