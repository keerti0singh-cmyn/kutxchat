'use client'

import { Avatar } from '@/components/ui/Avatar'
import type { StoryView } from '@/types/database.types'

interface ViewerListProps {
  views: StoryView[]
}

export function ViewerList({ views }: ViewerListProps) {
  return (
    <div className="space-y-3">
      {views.map((view: any) => (
        <div key={view.id} className="flex items-center gap-3 py-2">
          <Avatar
            src={view.viewer?.avatar_url}
            alt={view.viewer?.username}
            size="sm"
          />
          <div className="flex-1">
            <p className="text-white text-sm font-medium">{view.viewer?.username}</p>
            <p className="text-white/50 text-xs">
              {new Date(view.viewed_at).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
