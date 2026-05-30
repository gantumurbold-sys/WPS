'use client'

import { useTheme } from 'next-themes'
import { Sun, Moon, Bell } from 'lucide-react'
import NotificationBell from './NotificationBell'

interface HeaderProps {
  title: string
  staffId: number
}

export default function Header({ title, staffId }: HeaderProps) {
  const { theme, setTheme } = useTheme()

  return (
    <header className="h-14 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 flex items-center justify-between">
      <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100">{title}</h2>

      <div className="flex items-center gap-2">
        <NotificationBell staffId={staffId} />

        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition"
          aria-label="Өнгөний горим"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </header>
  )
}
