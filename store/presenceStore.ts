import { create } from 'zustand'
import { createClient } from '@/lib/supabase'
import type { User } from '@/types/database.types'

interface PresenceState {
  onlineUsers: Set<string>
  updatePresence: (status: 'online' | 'offline') => Promise<void>
  startHeartbeat: () => void
  stopHeartbeat: () => void
  subscribeToPresence: () => (() => void)
}

let heartbeatInterval: NodeJS.Timeout | null = null

export const usePresenceStore = create<PresenceState>((set, get) => ({
  onlineUsers: new Set(),

  updatePresence: async (status) => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return

    await supabase
      .from('users')
      .update({ 
        status,
        last_seen: new Date().toISOString()
      })
      .eq('id', user.id)
  },

  startHeartbeat: () => {
    if (heartbeatInterval) return

    // Update presence immediately
    get().updatePresence('online')

    // Send heartbeat every 30 seconds
    heartbeatInterval = setInterval(() => {
      get().updatePresence('online')
    }, 30000)

    // Handle tab close
    const handleBeforeUnload = () => {
      get().updatePresence('offline')
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
  },

  stopHeartbeat: () => {
    if (heartbeatInterval) {
      clearInterval(heartbeatInterval)
      heartbeatInterval = null
    }
    get().updatePresence('offline')
  },

  subscribeToPresence: () => {
    const supabase = createClient()

    const subscription = supabase
      .channel('presence')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'users',
        },
        (payload) => {
          const user = payload.new as User
          set((state) => {
            const newOnlineUsers = new Set(state.onlineUsers)
            if (user.status === 'online') {
              newOnlineUsers.add(user.id)
            } else {
              newOnlineUsers.delete(user.id)
            }
            return { onlineUsers: newOnlineUsers }
          })
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  },
}))
