import { useEffect } from 'react'
import { usePresenceStore } from '@/store/presenceStore'

export function usePresence() {
  const { startHeartbeat, stopHeartbeat, subscribeToPresence } = usePresenceStore()

  useEffect(() => {
    startHeartbeat()
    const cleanup = subscribeToPresence()

    return () => {
      stopHeartbeat()
      cleanup()
    }
  }, [startHeartbeat, stopHeartbeat, subscribeToPresence])
}
