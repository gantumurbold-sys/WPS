import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Staff } from '@/types/database'
import { getRoleName, getStatusColor } from '@/lib/utils'
import { Plus, Users } from 'lucide-react'

export default async function StaffPage() {
  const supabase = await createClient()

  const { data: staffList } = await supabase
    .from('staffs')
    .select('*')
    .order('department')
    .order('first_name')

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600" />
          <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">Ажилтны Бүртгэл</h1>
        </div>
        <Link
          href="/staff/new"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
        >
          <Plus className="w-4 h-4" />
          Шинэ Ажилтан
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">ID</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Нэр</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Алба</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Дүр</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Төрөл</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">И-мэйл</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Төлөв</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {!staffList || staffList.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-12 text-gray-400">
                  Ажилтан бүртгэгдээгүй байна
                </td>
              </tr>
            ) : (
              staffList.map((staff: Staff) => (
                <tr key={staff.staff_id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                  <td className="px-4 py-3 text-gray-500 font-mono text-xs">{staff.staff_id}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-800 dark:text-gray-100">
                      {[staff.last_name, staff.first_name].filter(Boolean).join(' ')}
                    </p>
                    {staff.phone && (
                      <p className="text-xs text-gray-400">{staff.phone}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{staff.department}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">
                      {getRoleName(staff.role)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">{staff.staff_type}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{staff.email || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${staff.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {staff.is_active ? 'Идэвхтэй' : 'Идэвхгүй'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/staff/${staff.staff_id}`}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      Засах
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
