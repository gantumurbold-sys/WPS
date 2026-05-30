'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { ArrowLeft, Loader2 } from 'lucide-react'

export default function NewProjectPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    project_id: '',
    project_name: '',
    client_name: '',
    contract_start: '',
    contract_end: '',
    status: 'active',
    task_sheet_url: '',
    contract_doc_url: '',
    warranty_doc_url: '',
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.from('projects').insert({
      ...form,
      task_sheet_url: form.task_sheet_url || null,
      contract_doc_url: form.contract_doc_url || null,
      warranty_doc_url: form.warranty_doc_url || null,
    })

    if (error) {
      toast.error('Алдаа гарлаа', { description: error.message })
      setLoading(false)
      return
    }

    toast.success('Төсөл амжилттай бүртгэгдлээ')
    router.push('/projects')
    router.refresh()
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/projects" className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">Шинэ Төсөл Бүртгэх</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Төслийн ID *
            </label>
            <input
              name="project_id"
              value={form.project_id}
              onChange={handleChange}
              required
              placeholder="MCU, TT25..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Төлөв
            </label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="active">Явагдаж байна</option>
              <option value="completed">Дууссан</option>
              <option value="paused">Түдгэлзсэн</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Төслийн нэр *
          </label>
          <input
            name="project_name"
            value={form.project_name}
            onChange={handleChange}
            required
            placeholder="Барилгын төслийн нэр"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Захиалагчийн нэр *
          </label>
          <input
            name="client_name"
            value={form.client_name}
            onChange={handleChange}
            required
            placeholder="Компанийн нэр"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Гэрээний эхлэх огноо *
            </label>
            <input
              type="date"
              name="contract_start"
              value={form.contract_start}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Гэрээний дуусах огноо *
            </label>
            <input
              type="date"
              name="contract_end"
              value={form.contract_end}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="border-t border-gray-100 dark:border-gray-800 pt-4 space-y-3">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Баримт холбоосууд (заавал биш)</p>
          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Гэрээний баримт URL</label>
            <input
              name="contract_doc_url"
              value={form.contract_doc_url}
              onChange={handleChange}
              placeholder="https://..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Ажлын даалгаварын хуудас URL</label>
            <input
              name="task_sheet_url"
              value={form.task_sheet_url}
              onChange={handleChange}
              placeholder="https://..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Баталгааны баримт URL</label>
            <input
              name="warranty_doc_url"
              value={form.warranty_doc_url}
              onChange={handleChange}
              placeholder="https://..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Бүртгэх
          </button>
          <Link
            href="/projects"
            className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 text-center"
          >
            Цуцлах
          </Link>
        </div>
      </form>
    </div>
  )
}
