'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, FolderKanban, BookOpen, CalendarDays,
  ClipboardList, CheckSquare, User, Users, FileText,
  DollarSign, Settings, Building2, ChevronRight, LogOut
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Role } from '@/types/database'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface NavItem {
  href: string
  label: string
  icon: React.ElementType
  roles: Role[]
}

const navItems: NavItem[] = [
  {
    href: '/dashboard',
    label: 'Дашбоард',
    icon: LayoutDashboard,
    roles: ['superadmin', 'admin', 'chief_eng'],
  },
  {
    href: '/projects',
    label: 'Гэрээний Бүртгэл',
    icon: FolderKanban,
    roles: ['superadmin', 'admin'],
  },
  {
    href: '/job-library',
    label: 'Ажлын Сан',
    icon: BookOpen,
    roles: ['superadmin', 'admin'],
  },
  {
    href: '/weekly-plans',
    label: '7 Хоногийн Төлөвлөгөө',
    icon: CalendarDays,
    roles: ['superadmin', 'admin', 'chief_eng', 'project_manager', 'foreman'],
  },
  {
    href: '/daily-reports',
    label: 'Өдрийн Тайлан',
    icon: ClipboardList,
    roles: ['superadmin', 'admin', 'foreman'],
  },
  {
    href: '/performance',
    label: 'Гүйцэтгэлийн Хяналт',
    icon: CheckSquare,
    roles: ['superadmin', 'admin', 'chief_eng', 'project_manager'],
  },
  {
    href: '/my-performance',
    label: 'Миний Гүйцэтгэл',
    icon: User,
    roles: ['staff', 'foreman'],
  },
  {
    href: '/salary',
    label: 'Цалингийн Бүртгэл',
    icon: DollarSign,
    roles: ['superadmin', 'admin', 'accountant'],
  },
  {
    href: '/staff',
    label: 'Ажилтны Бүртгэл',
    icon: Users,
    roles: ['superadmin', 'admin', 'hr'],
  },
  {
    href: '/reports',
    label: 'Тайлан Экспорт',
    icon: FileText,
    roles: ['superadmin', 'admin', 'chief_eng', 'project_manager', 'accountant'],
  },
  {
    href: '/settings',
    label: 'Тохиргоо',
    icon: Settings,
    roles: ['superadmin'],
  },
]

interface SidebarProps {
  userRole: Role
  userName: string
}

export default function Sidebar({ userRole, userName }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const filteredItems = navItems.filter((item) => item.roles.includes(userRole))

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  return (
    <aside className="w-64 min-h-screen bg-[#1E3A5F] flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-blue-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold text-sm leading-tight">ГУС</h1>
            <p className="text-blue-300 text-xs leading-tight">Гүйцэтгэлийн Систем</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 overflow-y-auto scrollbar-hide">
        <ul className="space-y-1">
          {filteredItems.map((item) => {
            const isActive = pathname.startsWith(item.href)
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all group',
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-blue-200 hover:bg-blue-800 hover:text-white'
                  )}
                >
                  <item.icon className="w-4 h-4 flex-shrink-0" />
                  <span className="flex-1 truncate">{item.label}</span>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* User info + logout */}
      <div className="p-4 border-t border-blue-800">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold">
              {userName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">{userName}</p>
            <p className="text-blue-300 text-xs truncate">{userRole}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 text-blue-300 hover:text-white text-sm py-2 px-3 rounded-lg hover:bg-blue-800 transition"
        >
          <LogOut className="w-4 h-4" />
          Гарах
        </button>
      </div>
    </aside>
  )
}
