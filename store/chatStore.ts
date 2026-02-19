import { create } from 'zustand'
import { createClient } from '@/lib/supabase'
import type { Message, Conversation } from '@/types/database.types'

interface ChatState {
  conversations: Conversation[]
  currentChat: string | null
  messages: Message[]
  isLoading: boolean
  typingUsers: Record<string, boolean>
  sendMessage: (receiverId: string, content: string, type?: 'text' | 'image' | 'document', fileUrl?: string) => Promise<void>
  fetchMessages: (userId: string) => Promise<void>
  fetchConversations: () => Promise<void>
  markAsSeen: (messageId: string) => Promise<void>
  setTyping: (userId: string, isTyping: boolean) => void
  setCurrentChat: (userId: string | null) => void
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  currentChat: null,
  messages: [],
  isLoading: false,
  typingUsers: {},

  sendMessage: async (receiverId, content, type = 'text', fileUrl: string | undefined = undefined) => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Not authenticated')

    const message = {
      sender_id: user.id,
      receiver_id: receiverId,
      message_type: type,
      text_content: type === 'text' ? content : null,
      file_url: fileUrl,
      status: 'sent',
    }

    const { error } = await supabase
      .from('messages')
      .insert(message)

    if (error) throw error
  },

  fetchMessages: async (userId) => {
    set({ isLoading: true })
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      set({ isLoading: false })
      return
    }

    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('created_at', { ascending: true })

    if (error) {
      set({ isLoading: false })
      throw error
    }

    set({ messages: data || [], isLoading: false })
  },

  fetchConversations: async () => {
    set({ isLoading: true })
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      set({ isLoading: false })
      return
    }

    // Get all users except current user
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .neq('id', user.id)

    if (usersError) {
      set({ isLoading: false })
      throw usersError
    }

    // Get last message for each conversation
    const conversations: Conversation[] = []
    
    for (const otherUser of users || []) {
      const { data: messages } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${otherUser.id}),and(sender_id.eq.${otherUser.id},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: false })
        .limit(1)

      const unreadCount = await supabase
        .from('messages')
        .select('*', { count: 'exact' })
        .eq('receiver_id', user.id)
        .eq('sender_id', otherUser.id)
        .eq('status', 'sent')

      conversations.push({
        user: otherUser,
        lastMessage: messages?.[0],
        unreadCount: unreadCount.count || 0,
      })
    }

    // Sort by last message time
    conversations.sort((a, b) => {
      if (!a.lastMessage) return 1
      if (!b.lastMessage) return -1
      return new Date(b.lastMessage.created_at).getTime() - new Date(a.lastMessage.created_at).getTime()
    })

    set({ conversations, isLoading: false })
  },

  markAsSeen: async (messageId) => {
    const supabase = createClient()
    
    const { error } = await supabase
      .from('messages')
      .update({ status: 'seen' })
      .eq('id', messageId)

    if (error) throw error
  },

  setTyping: (userId, isTyping) => {
    set((state) => ({
      typingUsers: { ...state.typingUsers, [userId]: isTyping }
    }))
  },

  setCurrentChat: (userId) => {
    set({ currentChat: userId })
  },
}))
