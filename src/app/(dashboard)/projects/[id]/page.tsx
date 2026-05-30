import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { formatDate, getStatusColor, getStatusLabel } from '@/lib/utils'
import { ArrowLeft, ExternalLink, Briefcase } from 'lucide-react'

interface Props {
  params: Promise<{ id: string }>
}

export default async function ProjectDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('project_id', id)
    .single()

  if (!project) notFound()

  const { data: jobStats } = await supabase
    .from('project_jobs')
    .select('total_man_hours')
    .eq('project_id', id)

  const { data: perfStats } = await supabase
    .from('project_performance')
    .select('performed_hrs')
    .eq('project_id', id)
    .eq('is_approved', true)

  const totalPlanned = jobStats?.reduce((s, j) => s + (j.total_man_hours || 0), 0) || 0
  const totalPerformed = perfStats?.reduce((s, p) => s + (p.performed_hrs || 0), 0) || 0
  const progress = totalPlanned > 0 ? (totalPerformed / totalPlanned) * 100 : 0

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/projects" className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">{project.project_id}</h1>
          <p className="text-sm text-gray-500">{project.project_name}</p>
        </div>
        <span className={`ml-auto text-xs px-3 py-1 rounded-full font-medium ${getStatusColor(project.status)}`}>
          {getStatusLabel(project.status)}
        </span>
      </div>

      {/* Progress */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-600 dark:text-gray-400">Гүйцэтгэлийн явц</span>
          <span className="font-bold text-blue-600">{progress.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-3">
          <div className="bg-blue-500 h-3 rounded-full transition-all" style={{ width: `${Math.min(progress, 100)}%` }} />
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-2">
          <span>{totalPerformed.toFixed(1)} хүн.цаг хийгдсэн</span>
          <span>{totalPlanned.toFixed(1)} хүн.цаг нийт</span>
        </div>
      </div>

      {/* Details */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Гэрээний Мэдээлэл</h2>
        <dl className="space-y-3">
          {[
            { label: 'Захиалагч', value: project.client_name },
            { label: 'Гэрээний эхлэл', value: formatDate(project.contract_start) },
            { label: 'Гэрээний дуусал', value: formatDate(project.contract_end) },
          ].map((item) => (
            <div key={item.label} className="flex">
              <dt className="w-40 text-sm text-gray-500 flex-shrink-0">{item.label}</dt>
              <dd className="text-sm font-medium text-gray-800 dark:text-gray-100">{item.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Documents */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Баримт Бичгүүд</h2>
        <div className="space-y-2">
          {project.contract_doc_url && (
            <a href={project.contract_doc_url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
              <ExternalLink className="w-4 h-4" /> Гэрээний баримт
            </a>
          )}
          {project.task_sheet_url && (
            <a href={project.task_sheet_url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
              <ExternalLink className="w-4 h-4" /> Ажлын даалгаварын хуудас
            </a>
          )}
          {project.warranty_doc_url && (
            <a href={project.warranty_doc_url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
              <ExternalLink className="w-4 h-4" /> Баталгааны баримт
            </a>
          )}
          {!project.contract_doc_url && !project.task_sheet_url && !project.warranty_doc_url && (
            <p className="text-sm text-gray-400">Баримт бичиг оруулаагүй байна</p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Link
          href={`/projects/${id}/jobs`}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition"
        >
          <Briefcase className="w-4 h-4" />
          Ажлын Тоо Хэмжээ Харах
        </Link>
        <Link
          href="/projects"
          className="px-5 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          Буцах
        </Link>
      </div>
    </div>
  )
}
