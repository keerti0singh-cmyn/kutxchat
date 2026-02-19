'use client'

import { Avatar } from '@/components/ui/Avatar'
import { cn } from '@/lib/utils'
import type { Story, User } from '@/types/database.types'

interface StoryCardProps {
  user: User
  stories: Story[]
  hasUnseenStories: boolean
  onClick: () => void
}

export function StoryCard({ user, stories, hasUnseenStories, onClick }: StoryCardProps) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1 p-2 min-w-[72px]"
    >
      <div
        className={cn(
          'p-0.5 rounded-full',
          hasUnseenStories
            ? 'bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500'
            : 'bg-gray-200'
        )}
      >
        <div className="p-0.5 bg-white rounded-full">
          <Avatar
            src={user.avatar_url}
            alt={user.username}
            size="md"
          />
        </div>
      </div>
      <span className="text-xs truncate max-w-[64px]">{user.username}</span>
    </button>
  )
}
