import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Upload, Building2 } from 'lucide-react'
import JobImportButton from '@/components/projects/JobImportButton'

interface Props {
  params: Promise<{ id: string }>
}

export default async function ProjectJobsPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('project_id', id)
    .single()

  if (!project) notFound()

  const { data: jobs } = await supabase
    .from('project_jobs')
    .select('*')
    .eq('project_id', id)
    .order('building_no')
    .order('floor_no')

  // Барилга, давхраар бүлэглэх
  const grouped: Record<string, Record<number, typeof jobs>> = {}
  jobs?.forEach((job) => {
    if (!grouped[job.building_no]) grouped[job.building_no] = {}
    if (!grouped[job.building_no][job.floor_no]) grouped[job.building_no][job.floor_no] = []
    grouped[job.building_no][job.floor_no]!.push(job)
  })

  const totalMH = jobs?.reduce((s, j) => s + (j.total_man_hours || 0), 0) || 0

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Link href={`/projects/${id}`} className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">
            {id} — Ажлын Тоо Хэмжээний Төлөвлөгөө
          </h1>
          <p className="text-sm text-gray-500">{project.project_name}</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span>Нийт ажил: <strong className="text-gray-800 dark:text-gray-100">{jobs?.length || 0}</strong></span>
          <span>Нийт хүн.цаг: <strong className="text-gray-800 dark:text-gray-100">{totalMH.toFixed(2)}</strong></span>
        </div>
        <JobImportButton projectId={id} />
      </div>

      {Object.keys(grouped).length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center text-gray-400">
          <Upload className="w-8 h-8 mx-auto mb-3 opacity-40" />
          <p>Ажлын тоо хэмжээ оруулаагүй байна. Excel-ээс импорт хийнэ үү.</p>
        </div>
      ) : (
        Object.entries(grouped).map(([building, floors]) => (
          <div key={building} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 flex items-center gap-2 border-b border-gray-200 dark:border-gray-700">
              <Building2 className="w-4 h-4 text-blue-500" />
              <span className="font-semibold text-gray-700 dark:text-gray-300">{building}</span>
            </div>
            {Object.entries(floors).map(([floor, floorJobs]) => (
              <div key={floor}>
                <div className="bg-blue-50 dark:bg-blue-950 px-4 py-2 border-b border-gray-100 dark:border-gray-800">
                  <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                    {floor}-р давхар
                  </span>
                </div>
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
                    <tr>
                      <th className="text-left px-4 py-2 text-xs text-gray-500 font-medium">JobID</th>
                      <th className="text-left px-4 py-2 text-xs text-gray-500 font-medium">Бүлэг</th>
                      <th className="text-right px-4 py-2 text-xs text-gray-500 font-medium">Хүн.цаг/нэгж</th>
                      <th className="text-right px-4 py-2 text-xs text-gray-500 font-medium">Тоо хэмжээ</th>
                      <th className="text-right px-4 py-2 text-xs text-gray-500 font-medium">Нийт хүн.цаг</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                    {floorJobs?.map((job) => (
                      <tr key={job.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="px-4 py-2 font-mono text-xs text-blue-600">{job.job_id}</td>
                        <td className="px-4 py-2 text-gray-600 dark:text-gray-400">
                          <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                            {job.group_code}
                          </span>
                          <span className="ml-2 text-xs">{job.group_name}</span>
                        </td>
                        <td className="px-4 py-2 text-right text-gray-600 dark:text-gray-400">{job.man_hours_unit}</td>
                        <td className="px-4 py-2 text-right text-gray-600 dark:text-gray-400">{job.planned_qty}</td>
                        <td className="px-4 py-2 text-right font-medium text-gray-800 dark:text-gray-100">
                          {(job.total_man_hours || 0).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  )
}
