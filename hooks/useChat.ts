import { useEffect, useCallback } from 'react'
import { useChatStore } from '@/store/chatStore'
import { createClient } from '@/lib/supabase'

export function useChat(userId: string | null) {
  const { 
    messages, 
    fetchMessages, 
    sendMessage,
    markAsSeen 
  } = useChatStore()
  const supabase = createClient()

  useEffect(() => {
    if (!userId) return

    fetchMessages(userId)

    // Subscribe to new messages
    const channel = supabase
      .channel(`chat-${userId}`)
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'messages',
          filter: `receiver_id=eq.${userId}`
        },
        () => {
          fetchMessages(userId)
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [userId, fetchMessages, supabase])

  const handleSend = useCallback(async (content: string, type?: 'text' | 'image' | 'document', fileUrl?: string) => {
    if (!userId) return
    await sendMessage(userId, content, type, fileUrl)
  }, [userId, sendMessage])

  return { messages, sendMessage: handleSend, markAsSeen }
}
