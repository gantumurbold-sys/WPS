'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Send, CheckCircle2, XCircle, Loader2 } from 'lucide-react'

interface Props {
  report: any
  canSubmit: boolean
  canApprove: boolean
}

export default function DailyReportActions({ report, canSubmit, canApprove }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectReason, setRejectReason] = useState('')

  async function updateStatus(status: string, extra?: Record<string, any>) {
    setLoading(status)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const { data: staff } = await supabase.from('staffs').select('staff_id').eq('email', user?.email).single()

    const updateData: Record<string, any> = { status }
    if (status === 'reviewed' || status === 'approved') {
      updateData.reviewed_by = staff?.staff_id
      updateData.reviewed_at = new Date().toISOString()
    }

    const { error } = await supabase
      .from('daily_reports')
      .update({ ...updateData, ...extra })
      .eq('daily_report_id', report.daily_report_id)

    if (error) {
      toast.error('Алдаа', { description: error.message })
    } else {
      toast.success(
        status === 'submitted' ? 'Тайлан илгээгдлээ' :
        status === 'approved' ? 'Тайлан батлагдлаа' : 'Буцаагдлаа'
      )
      router.refresh()
    }
    setLoading(null)
  }

  if (report.status === 'approved') return null

  return (
    <div className="flex gap-3 flex-wrap">
      {canSubmit && report.status === 'draft' && (
        <button
          onClick={() => updateStatus('submitted')}
          disabled={!!loading}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-lg transition disabled:opacity-60"
        >
          {loading === 'submitted' && <Loader2 className="w-4 h-4 animate-spin" />}
          <Send className="w-4 h-4" />
          Илгээх
        </button>
      )}

      {canApprove && ['submitted', 'reviewed'].includes(report.status) && (
        <>
          <button
            onClick={() => updateStatus('approved')}
            disabled={!!loading}
            className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium px-5 py-2.5 rounded-lg transition disabled:opacity-60"
          >
            {loading === 'approved' && <Loader2 className="w-4 h-4 animate-spin" />}
            <CheckCircle2 className="w-4 h-4" />
            Батлах
          </button>

          <button
            onClick={() => setShowRejectModal(true)}
            disabled={!!loading}
            className="inline-flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 font-medium px-5 py-2.5 rounded-lg border border-red-200 transition disabled:opacity-60"
          >
            <XCircle className="w-4 h-4" />
            Буцаах
          </button>
        </>
      )}

      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-md space-y-4">
            <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100">Буцаах шалтгаан</h2>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
              placeholder="Буцаах шалтгааныг бичнэ үү..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
            />
            <div className="flex gap-3">
              <button
                onClick={async () => {
                  if (!rejectReason.trim()) { toast.error('Шалтгаан оруулна уу'); return }
                  await updateStatus('draft', { notes: `Буцаасан шалтгаан: ${rejectReason}` })
                  setShowRejectModal(false)
                }}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 rounded-lg transition"
              >
                Буцаах
              </button>
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-600 dark:text-gray-400"
              >
                Цуцлах
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
