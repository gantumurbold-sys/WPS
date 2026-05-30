'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Building2, ArrowLeft, Loader2 } from 'lucide-react'

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/update-password`,
    })

    if (error) {
      toast.error('Алдаа гарлаа', { description: error.message })
    } else {
      setSent(true)
      toast.success('Имэйл илгээгдлээ')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-blue-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">ГУС</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <Link href="/auth/login" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-6">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Буцах
          </Link>

          <h2 className="text-xl font-semibold text-gray-800 mb-2">Нууц үг сэргээх</h2>
          <p className="text-sm text-gray-500 mb-6">
            Бүртгэлтэй и-мэйл хаягаа оруулна уу. Нууц үг сэргээх холбоос илгээнэ.
          </p>

          {sent ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-700 text-sm">
              <strong>{email}</strong> хаягт нууц үг сэргээх холбоос илгээлээ. Имэйлээ шалгана уу.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  И-мэйл хаяг
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="example@company.mn"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Илгээх
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
