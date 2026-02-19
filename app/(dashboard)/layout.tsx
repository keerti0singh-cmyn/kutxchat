'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { usePresenceStore } from '@/store/presenceStore'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { MessageSquare, User, LogOut, PlusCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, logout } = useAuthStore()
  const { startHeartbeat, stopHeartbeat } = usePresenceStore()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      startHeartbeat()
    }

    return () => {
      stopHeartbeat()
    }
  }, [user, startHeartbeat, stopHeartbeat])

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-16 md:w-64 bg-white border-r border-slate-200 flex flex-col z-40">
        {/* Logo */}
        <div className="p-4 border-b border-slate-200">
          <Link href="/chat" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">K</span>
            </div>
            <span className="hidden md:block font-bold text-xl text-slate-900">KUTX</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2 space-y-1">
          <Link
            href="/chat"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <MessageSquare className="w-5 h-5" />
            <span className="hidden md:block font-medium">Messages</span>
          </Link>

          <Link
            href="/stories"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <PlusCircle className="w-5 h-5" />
            <span className="hidden md:block font-medium">Stories</span>
          </Link>

          <Link
            href="/profile"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <User className="w-5 h-5" />
            <span className="hidden md:block font-medium">Profile</span>
          </Link>
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
              <span className="font-medium text-slate-600">
                {user?.username?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="hidden md:block flex-1 min-w-0">
              <p className="font-medium text-slate-900 truncate">{user?.username}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-red-500 transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-16 md:ml-64 min-h-screen">
        {children}
      </main>
    </div>
  )
}
