'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { MessageSquare, Plus, Loader2 } from 'lucide-react'
import { formatDate, getStatusColor, getStatusLabel } from '@/lib/utils'

interface Request {
  id: number
  message: string
  status: string
  response: string | null
  created_at: string
  responded_at: string | null
}

export default function ClarificationRequestsPage() {
  const [requests, setRequests] = useState<Request[]>([])
  const [showForm, setShowForm] = useState(false)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function loadRequests() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const { data: staff } = await supabase.from('staffs').select('staff_id').eq('email', user?.email).single()

    const { data } = await supabase
      .from('clarification_requests')
      .select('*')
      .eq('staff_id', staff?.staff_id)
      .order('created_at', { ascending: false })

    if (data) setRequests(data)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!message.trim()) return
    setLoading(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const { data: staff } = await supabase.from('staffs').select('staff_id').eq('email', user?.email).single()

    const { error } = await supabase.from('clarification_requests').insert({
      staff_id: staff?.staff_id,
      message: message.trim(),
      status: 'open',
    })

    if (error) {
      toast.error('Алдаа', { description: error.message })
    } else {
      toast.success('Хүсэлт илгээгдлээ')
      setMessage('')
      setShowForm(false)
      loadRequests()
    }
    setLoading(false)
  }

  useEffect(() => { loadRequests() }, [])

  return (
    <div className="max-w-3xl space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-blue-600" />
          <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">Тодруулах Хүсэлт</h1>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
        >
          <Plus className="w-4 h-4" />
          Хүсэлт Илгээх
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5 space-y-3">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Хүсэлтийн мэдэгдэл</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            required
            placeholder="Гүйцэтгэлийн мэдээлэлтэй холбоотой асуулт эсвэл тодруулга..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2 rounded-lg flex items-center gap-2 disabled:opacity-60 text-sm"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Илгээх
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-5 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-600 dark:text-gray-400"
            >
              Цуцлах
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {requests.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center text-gray-400 text-sm">
            Хүсэлт байхгүй байна
          </div>
        ) : (
          requests.map((req) => (
            <div key={req.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <p className="text-sm text-gray-800 dark:text-gray-100">{req.message}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${getStatusColor(req.status)}`}>
                  {getStatusLabel(req.status)}
                </span>
              </div>
              <p className="text-xs text-gray-400 mb-3">{formatDate(req.created_at, 'yyyy-MM-dd HH:mm')}</p>
              {req.response && (
                <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-3 border-l-4 border-blue-400">
                  <p className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-1">Хариу:</p>
                  <p className="text-xs text-blue-600 dark:text-blue-400">{req.response}</p>
                  {req.responded_at && (
                    <p className="text-xs text-blue-400 mt-1">{formatDate(req.responded_at, 'yyyy-MM-dd HH:mm')}</p>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
