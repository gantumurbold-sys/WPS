'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Settings, Loader2, Save } from 'lucide-react'

interface Setting {
  key: string
  value: string
  description: string | null
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Setting[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState<string | null>(null)
  const [values, setValues] = useState<Record<string, string>>({})

  useEffect(() => {
    const supabase = createClient()
    supabase.from('settings').select('*').then(({ data }) => {
      if (data) {
        setSettings(data)
        setValues(Object.fromEntries(data.map((s) => [s.key, s.value])))
      }
    })
  }, [])

  async function handleSave(key: string) {
    setSaving(key)
    const supabase = createClient()
    const { error } = await supabase
      .from('settings')
      .update({ value: values[key], updated_at: new Date().toISOString() })
      .eq('key', key)

    if (error) {
      toast.error('Хадгалахад алдаа', { description: error.message })
    } else {
      toast.success('Амжилттай хадгаллаа')
    }
    setSaving(null)
  }

  const settingLabels: Record<string, { label: string; hint: string; type: string }> = {
    perform_bonus_rate: {
      label: 'Хийснээрх нэгж олговор',
      hint: '₮/хүн.цаг — ажилтан нэг хүн.цаг хийснээрх авах олговор',
      type: 'number',
    },
    pension_rate: {
      label: 'НДШ хувь',
      hint: 'Нийгмийн даатгалын шимтгэлийн хувь (жишээ: 0.115 = 11.5%)',
      type: 'number',
    },
    income_tax_rate: {
      label: 'ХХОАТ хувь',
      hint: 'Хувь хүний орлогын албан татварын хувь (жишээ: 0.10 = 10%)',
      type: 'number',
    },
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-2">
        <Settings className="w-5 h-5 text-blue-600" />
        <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">Системийн Тохиргоо</h1>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-800">
        {settings.map((setting) => {
          const meta = settingLabels[setting.key]
          return (
            <div key={setting.key} className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-800 dark:text-gray-100 mb-1">
                    {meta?.label || setting.key}
                  </label>
                  <p className="text-xs text-gray-400 mb-3">{meta?.hint || setting.description}</p>
                  <input
                    type={meta?.type || 'text'}
                    step="0.001"
                    value={values[setting.key] || ''}
                    onChange={(e) => setValues((prev) => ({ ...prev, [setting.key]: e.target.value }))}
                    className="w-48 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  onClick={() => handleSave(setting.key)}
                  disabled={saving === setting.key}
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg mt-6 transition disabled:opacity-60"
                >
                  {saving === setting.key ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Хадгалах
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {settings.length === 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center text-gray-400 text-sm">
          Тохиргоо байхгүй байна. Эхлээд database seed хийнэ үү.
        </div>
      )}
    </div>
  )
}
