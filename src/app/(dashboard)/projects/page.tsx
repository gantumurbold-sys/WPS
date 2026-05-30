import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Project } from '@/types/database'
import { formatDate, getStatusColor, getStatusLabel } from '@/lib/utils'
import { Plus, ExternalLink, FolderKanban } from 'lucide-react'

export default async function ProjectsPage() {
  const supabase = await createClient()

  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FolderKanban className="w-5 h-5 text-blue-600" />
          <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">
            Гэрээний Бүртгэл
          </h1>
        </div>
        <Link
          href="/projects/new"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
        >
          <Plus className="w-4 h-4" />
          Шинэ Төсөл
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">ID</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Төслийн нэр</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Захиалагч</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Гэрээний хугацаа</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Төлөв</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Баримт</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {!projects || projects.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-gray-400">
                  Төсөл бүртгэгдээгүй байна
                </td>
              </tr>
            ) : (
              projects.map((project: Project) => (
                <tr key={project.project_id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                  <td className="px-4 py-3 font-mono font-bold text-blue-600">
                    {project.project_id}
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-gray-800 dark:text-gray-100">{project.project_name}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{project.client_name}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                    {formatDate(project.contract_start)} — {formatDate(project.contract_end)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${getStatusColor(project.status)}`}>
                      {getStatusLabel(project.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {project.contract_doc_url && (
                        <a
                          href={project.contract_doc_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline inline-flex items-center gap-1"
                        >
                          Гэрээ <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                      {project.task_sheet_url && (
                        <a
                          href={project.task_sheet_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline inline-flex items-center gap-1"
                        >
                          Даалгавар <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 justify-end">
                      <Link
                        href={`/projects/${project.project_id}`}
                        className="text-xs text-gray-600 hover:text-blue-600 font-medium"
                      >
                        Харах
                      </Link>
                      <Link
                        href={`/projects/${project.project_id}/jobs`}
                        className="text-xs text-gray-600 hover:text-blue-600 font-medium"
                      >
                        Ажлууд
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
