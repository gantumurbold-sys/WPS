'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'

interface Props {
  weeklyId: string
}

export default function WeeklyPlanApprovalActions({ weeklyId }: Props) {
  const [loading, setLoading] = useState<string | null>(null)
  const router = useRouter()

  async function updateStatus(status: string) {
    setLoading(status)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const { data: staff } = await supabase.from('staffs').select('staff_id').eq('email', user?.email).single()

    const { error } = await supabase
      .from('weekly_plans')
      .update({
        status,
        approved_by: staff?.staff_id,
        approved_at: new Date().toISOString(),
      })
      .eq('weekly_id', weeklyId)

    if (error) {
      toast.error('Алдаа', { description: error.message })
    } else {
      toast.success(status === 'approved' ? 'Төлөвлөгөө батлагдлаа' : 'Буцаагдлаа')
      router.refresh()
    }
    setLoading(null)
  }

  return (
    <div className="flex gap-3">
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
        onClick={() => updateStatus('rejected')}
        disabled={!!loading}
        className="inline-flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 font-medium px-5 py-2.5 rounded-lg border border-red-200 transition disabled:opacity-60"
      >
        {loading === 'rejected' && <Loader2 className="w-4 h-4 animate-spin" />}
        <XCircle className="w-4 h-4" />
        Буцаах
      </button>
    </div>
  )
}
