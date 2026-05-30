'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { CheckCircle2, Loader2 } from 'lucide-react'

interface Props {
  pendingIds: number[]
}

export default function BulkApproveButton({ pendingIds }: Props) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleBulkApprove() {
    if (pendingIds.length === 0) {
      toast.info('Батлах мэдээлэл байхгүй')
      return
    }
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const { data: staff } = await supabase.from('staffs').select('staff_id').eq('email', user?.email).single()

    const { error } = await supabase
      .from('project_performance')
      .update({
        is_approved: true,
        is_reviewed: true,
        approved_by: staff?.staff_id,
        approved_at: new Date().toISOString(),
      })
      .in('id', pendingIds)

    if (error) {
      toast.error('Алдаа', { description: error.message })
    } else {
      toast.success(`${pendingIds.length} мөр батлагдлаа`)
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <button
      onClick={handleBulkApprove}
      disabled={loading || pendingIds.length === 0}
      className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition disabled:opacity-60"
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
      Бүгдийг Батлах ({pendingIds.length})
    </button>
  )
}
