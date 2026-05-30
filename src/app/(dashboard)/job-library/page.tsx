import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { BookOpen, Upload } from 'lucide-react'

export default async function JobLibraryPage() {
  const supabase = await createClient()

  const { data: jobs } = await supabase
    .from('job_library')
    .select('*')
    .order('group_code')
    .order('job_id')

  // Бүлгээр нэгтгэх
  const grouped: Record<string, typeof jobs> = {}
  jobs?.forEach((j) => {
    if (!grouped[j.group_code]) grouped[j.group_code] = []
    grouped[j.group_code]!.push(j)
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-600" />
          <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">Ажлын Сан (JobLibrary)</h1>
          <span className="text-xs bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-300 px-2.5 py-1 rounded-full">
            {jobs?.length || 0} ажил
          </span>
        </div>
        <Link
          href="/job-library/import"
          className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
        >
          <Upload className="w-4 h-4" />
          Excel Импорт
        </Link>
      </div>

      {Object.keys(grouped).length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center text-gray-400">
          <Upload className="w-8 h-8 mx-auto mb-3 opacity-40" />
          <p>Ажлын сан хоосон байна. Excel-ээс импорт хийнэ үү.</p>
        </div>
      ) : (
        Object.entries(grouped).map(([group, groupJobs]) => (
          <div key={group} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded">
                  {group}
                </span>
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {groupJobs?.[0]?.group_name}
                </span>
              </div>
              <span className="text-xs text-gray-400">{groupJobs?.length} ажил</span>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-gray-50/50 dark:bg-gray-800/50">
                <tr>
                  <th className="text-left px-4 py-2 text-xs text-gray-500 font-medium">JobID</th>
                  <th className="text-left px-4 py-2 text-xs text-gray-500 font-medium">Ажлын нэр</th>
                  <th className="text-left px-4 py-2 text-xs text-gray-500 font-medium">Хэмжих нэгж</th>
                  <th className="text-right px-4 py-2 text-xs text-gray-500 font-medium">Хүн.цаг</th>
                  <th className="text-left px-4 py-2 text-xs text-gray-500 font-medium">Хувилбар</th>
                  <th className="text-left px-4 py-2 text-xs text-gray-500 font-medium">Төлөв</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {groupJobs?.map((job) => (
                  <tr key={`${job.job_id}-${job.version}`} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-4 py-2 font-mono text-xs text-blue-600">{job.job_id}</td>
                    <td className="px-4 py-2 text-gray-700 dark:text-gray-300">{job.job_name}</td>
                    <td className="px-4 py-2 text-gray-500 text-xs">{job.unit || '—'}</td>
                    <td className="px-4 py-2 text-right font-medium text-gray-800 dark:text-gray-100">{job.man_hours}</td>
                    <td className="px-4 py-2 text-xs text-gray-400">v{job.version}</td>
                    <td className="px-4 py-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${job.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {job.is_active ? 'Идэвхтэй' : 'Идэвхгүй'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))
      )}
    </div>
  )
}
