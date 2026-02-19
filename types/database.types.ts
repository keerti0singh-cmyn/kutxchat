export type User = {
  id: string
  email: string
  username: string
  password_hash: string
  status: 'online' | 'offline'
  last_seen: string | null
  email_confirmed_at: string | null
  created_at: string
  avatar_url?: string
}

export type Message = {
  id: string
  sender_id: string
  receiver_id: string
  message_type: 'text' | 'image' | 'document'
  text_content: string | null
  file_url: string | null
  status: 'sent' | 'delivered' | 'seen'
  created_at: string
}

export type Story = {
  id: string
  user_id: string
  media_url: string | null
  text_content: string | null
  caption: string | null
  created_at: string
  expires_at: string
}

export type StoryView = {
  id: string
  story_id: string
  viewer_id: string
  viewed_at: string
}

export type BlockedUser = {
  id: string
  blocker_id: string
  blocked_id: string
  created_at: string
}

export type ActiveCall = {
  id: string
  caller_id: string
  receiver_id: string
  status: 'ringing' | 'accepted' | 'rejected' | 'ended'
  created_at: string
}

export type Notification = {
  id: string
  user_id: string
  type: 'message' | 'story' | 'call'
  reference_id: string
  is_read: boolean
  created_at: string
}

export type Conversation = {
  user: User
  lastMessage?: Message
  unreadCount: number
}
