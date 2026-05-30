import { createClient } from '@/lib/supabase/server'
import { Project } from '@/types/database'
import { formatDate, getStatusColor, getStatusLabel } from '@/lib/utils'
import { TrendingUp, TrendingDown, Calendar } from 'lucide-react'

interface ProjectWithProgress extends Project {
  totalPlanned: number
  totalPerformed: number
  progress: number
}

export default async function ProjectCards() {
  const supabase = await createClient()

  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .eq('status', 'active')
    .order('contract_start', { ascending: false })

  if (!projects || projects.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center text-gray-400">
        Идэвхтэй төсөл байхгүй
      </div>
    )
  }

  const projectsWithProgress: ProjectWithProgress[] = await Promise.all(
    projects.map(async (project) => {
      const { data: planData } = await supabase
        .from('project_jobs')
        .select('total_man_hours')
        .eq('project_id', project.project_id)

      const { data: perfData } = await supabase
        .from('project_performance')
        .select('performed_hrs')
        .eq('project_id', project.project_id)
        .eq('is_approved', true)

      const totalPlanned =
        planData?.reduce((sum, r) => sum + (r.total_man_hours || 0), 0) || 0
      const totalPerformed =
        perfData?.reduce((sum, r) => sum + (r.performed_hrs || 0), 0) || 0
      const progress = totalPlanned > 0 ? (totalPerformed / totalPlanned) * 100 : 0

      return { ...project, totalPlanned, totalPerformed, progress }
    })
  )

  const maxProgress = Math.max(...projectsWithProgress.map((p) => p.progress))
  const minProgress = Math.min(...projectsWithProgress.map((p) => p.progress))

  return (
    <div>
      <h2 className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-3">
        Идэвхтэй Төслүүд
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {projectsWithProgress.map((project) => {
          const isBest = project.progress === maxProgress && projectsWithProgress.length > 1
          const isWorst = project.progress === minProgress && projectsWithProgress.length > 1

          return (
            <div
              key={project.project_id}
              className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5 relative"
            >
              {isBest && (
                <span className="absolute top-3 right-3 inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                  <TrendingUp className="w-3 h-3" /> Шилдэг
                </span>
              )}
              {isWorst && !isBest && (
                <span className="absolute top-3 right-3 inline-flex items-center gap-1 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                  <TrendingDown className="w-3 h-3" /> Доод
                </span>
              )}

              <div className="mb-3">
                <p className="font-bold text-gray-800 dark:text-gray-100 text-base">
                  {project.project_id}
                </p>
                <p className="text-sm text-gray-500 truncate">{project.project_name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{project.client_name}</p>
              </div>

              <div className="flex items-center gap-2 mb-3">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(project.status)}`}>
                  {getStatusLabel(project.status)}
                </span>
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatDate(project.contract_end)}
                </span>
              </div>

              {/* Progress bar */}
              <div>
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Гүйцэтгэл</span>
                  <span className="font-semibold text-blue-600">
                    {project.progress.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all"
                    style={{ width: `${Math.min(project.progress, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>{project.totalPerformed.toFixed(0)} хүн.цаг</span>
                  <span>{project.totalPlanned.toFixed(0)} хүн.цаг</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
