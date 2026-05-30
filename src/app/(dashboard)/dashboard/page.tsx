import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import ProjectCards from '@/components/dashboard/ProjectCards'
import StaffRanking from '@/components/dashboard/StaffRanking'
import WeeklyPerformanceChart from '@/components/dashboard/WeeklyPerformanceChart'
import ReportStats from '@/components/dashboard/ReportStats'
import { LayoutDashboard } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: staff } = await supabase
    .from('staffs')
    .select('role')
    .eq('email', user.email)
    .single()

  const allowedRoles = ['superadmin', 'admin', 'chief_eng']
  if (!staff || !allowedRoles.includes(staff.role)) {
    redirect('/my-performance')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <LayoutDashboard className="w-5 h-5 text-blue-600" />
        <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">
          Удирдлагын Дашбоард
        </h1>
      </div>

      <Suspense fallback={<div className="grid grid-cols-3 gap-4">{[...Array(3)].map((_, i) => <div key={i} className="h-40 bg-gray-100 animate-pulse rounded-xl" />)}</div>}>
        <ProjectCards />
      </Suspense>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Suspense fallback={<div className="h-72 bg-gray-100 animate-pulse rounded-xl" />}>
          <WeeklyPerformanceChart />
        </Suspense>

        <Suspense fallback={<div className="h-72 bg-gray-100 animate-pulse rounded-xl" />}>
          <ReportStats />
        </Suspense>
      </div>

      <Suspense fallback={<div className="h-64 bg-gray-100 animate-pulse rounded-xl" />}>
        <StaffRanking />
      </Suspense>
    </div>
  )
}
