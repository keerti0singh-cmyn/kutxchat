'use client'

import { useEffect, useState, useRef } from 'react'
import { useChatStore } from '@/store/chatStore'
import { useAuthStore } from '@/store/authStore'
import { usePresenceStore } from '@/store/presenceStore'
import { useCallStore } from '@/store/callStore'
import { MessageBubble } from '@/components/chat/MessageBubble'
import { ChatInput } from '@/components/chat/ChatInput'
import { TypingIndicator } from '@/components/chat/TypingIndicator'
import { Avatar } from '@/components/ui/Avatar'
import { StatusDot } from '@/components/presence/StatusDot'
import { LastSeen } from '@/components/presence/LastSeen'
import { IncomingCallModal } from '@/components/call/IncomingCallModal'
import { ActiveCallUI } from '@/components/call/ActiveCallUI'
import { Button } from '@/components/ui/Button'
import { Phone, MoreVertical, ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import type { User, Message } from '@/types/database.types'

export default function ChatPage() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()
  
  const { user } = useAuthStore()
  const { 
    conversations, 
    messages, 
    fetchConversations, 
    fetchMessages, 
    sendMessage,
    setTyping,
    markAsSeen,
    setCurrentChat
  } = useChatStore()
  
  const { onlineUsers } = usePresenceStore()
  const { 
    incomingCall, 
    activeCall, 
    isInCall,
    setIncomingCall,
    acceptCall,
    rejectCall,
    endCall,
    initiateCall
  } = useCallStore()

  // Subscribe to realtime updates
  useEffect(() => {
    fetchConversations()

    const channel = supabase
      .channel('chat-updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'messages' },
        () => {
          fetchConversations()
          if (selectedUser) {
            fetchMessages(selectedUser.id)
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'active_calls' },
        async (payload) => {
          const call = payload.new as any
          if (call.receiver_id === user?.id && call.status === 'ringing') {
            // Fetch caller info
            const { data: caller } = await supabase
              .from('users')
              .select('*')
              .eq('id', call.caller_id)
              .single()
            
            setIncomingCall({ ...call, caller })
          }
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [selectedUser, user?.id])

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSelectUser = async (conversationUser: User) => {
    setSelectedUser(conversationUser)
    setCurrentChat(conversationUser.id)
    setIsMobileMenuOpen(false)
    await fetchMessages(conversationUser.id)
  }

  const handleSendMessage = async (content: string, type?: 'text' | 'image' | 'document', fileUrl?: string) => {
    if (!selectedUser) return
    await sendMessage(selectedUser.id, content, type, fileUrl)
  }

  const handleTyping = () => {
    // Broadcast typing event via Supabase Realtime
  }

  const handleCall = async () => {
    if (!selectedUser) return
    await initiateCall(selectedUser.id)
  }

  const handleAcceptCall = async () => {
    if (incomingCall) {
      await acceptCall(incomingCall.id)
    }
  }

  const handleRejectCall = async () => {
    if (incomingCall) {
      await rejectCall(incomingCall.id)
    }
  }

  // Find caller info for incoming call
  const caller = conversations.find(c => c.user.id === incomingCall?.caller_id)?.user

  return (
    <div className="h-screen flex">
      {/* Conversations List */}
      <div className={`
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        fixed md:relative z-10 w-full md:w-80 h-full bg-white border-r border-slate-200 transition-transform duration-300
      `}>
        <div className="p-4 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900">Messages</h2>
        </div>

        <div className="overflow-y-auto h-[calc(100vh-73px)]">
          {conversations.map((conversation) => (
            <button
              key={conversation.user.id}
              onClick={() => handleSelectUser(conversation.user)}
              className={`
                w-full flex items-center gap-3 p-4 hover:bg-slate-50 transition-colors border-b border-slate-100
                ${selectedUser?.id === conversation.user.id ? 'bg-slate-50' : ''}
              `}
            >
              <div className="relative">
                <Avatar
                  src={conversation.user.avatar_url}
                  alt={conversation.user.username}
                  size="md"
                />
                <div className="absolute bottom-0 right-0">
                  <StatusDot isOnline={onlineUsers.has(conversation.user.id)} size="sm" />
                </div>
              </div>
              
              <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-slate-900 truncate">
                    {conversation.user.username}
                  </h3>
                  {conversation.lastMessage && (
                    <span className="text-xs text-slate-400">
                      {new Date(conversation.lastMessage.created_at).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  )}
                </div>
                
                <p className="text-sm text-slate-500 truncate">
                  {conversation.lastMessage?.message_type === 'text' 
                    ? conversation.lastMessage.text_content 
                    : conversation.lastMessage 
                      ? 'Media'
                      : 'No messages yet'
                  }
                </p>
              </div>

              {conversation.unreadCount > 0 && (
                <span className="w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                  {conversation.unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-slate-50">
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="md:hidden p-2 -ml-2"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              
              <Avatar
                src={selectedUser.avatar_url}
                alt={selectedUser.username}
                size="md"
              />
              
              <div className="flex-1">
                <h3 className="font-medium text-slate-900">{selectedUser.username}</h3>
                <p className="text-xs text-slate-500">
                  {onlineUsers.has(selectedUser.id) ? (
                    <span className="text-green-500">Online</span>
                  ) : (
                    <LastSeen lastSeen={selectedUser.last_seen} />
                  )}
                </p>
              </div>

              <button
                onClick={handleCall}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <Phone className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isOwn={message.sender_id === user?.id}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Typing Indicator */}
            {/* Add typing indicator logic here */}

            {/* Input */}
            <ChatInput
              onSend={handleSendMessage}
              onTyping={handleTyping}
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="text-slate-500">Select a conversation to start chatting</p>
            </div>
          </div>
        )}
      </div>

      {/* Incoming Call Modal */}
      <IncomingCallModal
        isOpen={!!incomingCall}
        call={incomingCall}
        caller={caller || null}
        onAccept={handleAcceptCall}
        onReject={handleRejectCall}
      />

      {/* Active Call UI */}
      {isInCall && selectedUser && (
        <ActiveCallUI
          user={selectedUser}
          onHangup={endCall}
        />
      )}
    </div>
  )
}
