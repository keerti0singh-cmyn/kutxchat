'use client'

import { useEffect, useState } from 'react'
import { StoryCard } from '@/components/story/StoryCard'
import { StoryCreator } from '@/components/story/StoryCreator'
import { StoryViewer } from '@/components/story/StoryViewer'
import { Button } from '@/components/ui/Button'
import { Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import type { Story, User } from '@/types/database.types'

export default function StoriesPage() {
  const [stories, setStories] = useState<Story[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [viewedStories, setViewedStories] = useState<Set<string>>(new Set())
  const [isCreatorOpen, setIsCreatorOpen] = useState(false)
  const [selectedUserStories, setSelectedUserStories] = useState<{ stories: Story[], user: User } | null>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchStories()
    fetchViewedStories()

    // Subscribe to new stories
    const channel = supabase
      .channel('stories-updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'stories' },
        () => {
          fetchStories()
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [])

  const fetchStories = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Fetch all active stories (not expired)
    const { data: storiesData } = await supabase
      .from('stories')
      .select(`
        *,
        user:users(*)
      `)
      .gt('expires_at', new Date().toISOString())
      .neq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (storiesData) {
      setStories(storiesData)
      
      // Get unique users
      const uniqueUsers = [...new Map(storiesData.map(s => [s.user.id, s.user])).values()]
      setUsers(uniqueUsers)
    }
  }

  const fetchViewedStories = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: views } = await supabase
      .from('story_views')
      .select('story_id')
      .eq('viewer_id', user.id)

    if (views) {
      setViewedStories(new Set(views.map(v => v.story_id)))
    }
  }

  const handleStoryClick = (user: User) => {
    const userStories = stories.filter(s => s.user_id === user.id)
    setSelectedUserStories({ stories: userStories, user })
  }

  const getUserStories = (userId: string) => {
    return stories.filter(s => s.user_id === userId)
  }

  const hasUnseenStories = (userId: string) => {
    const userStories = getUserStories(userId)
    return userStories.some(s => !viewedStories.has(s.id))
  }

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Stories</h1>
          <Button onClick={() => setIsCreatorOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Story
          </Button>
        </div>

        {/* Your Story Card */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-slate-700 mb-4">Your Story</h2>
          <button
            onClick={() => setIsCreatorOpen(true)}
            className="flex flex-col items-center gap-1 p-2 min-w-[72px]"
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Plus className="w-6 h-6 text-white" />
            </div>
            <span className="text-xs text-slate-600">Add Story</span>
          </button>
        </div>

        {/* Stories from others */}
        {users.length > 0 ? (
          <div>
            <h2 className="text-lg font-semibold text-slate-700 mb-4">Recent Updates</h2>
            <div className="flex gap-2 overflow-x-auto pb-4">
              {users.map((user) => (
                <StoryCard
                  key={user.id}
                  user={user}
                  stories={getUserStories(user.id)}
                  hasUnseenStories={hasUnseenStories(user.id)}
                  onClick={() => handleStoryClick(user)}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-slate-500">No stories yet. Be the first to share!</p>
          </div>
        )}
      </div>

      {/* Story Creator Modal */}
      <StoryCreator
        isOpen={isCreatorOpen}
        onClose={() => setIsCreatorOpen(false)}
        onSuccess={fetchStories}
      />

      {/* Story Viewer */}
      {selectedUserStories && (
        <StoryViewer
          stories={selectedUserStories.stories}
          user={selectedUserStories.user}
          onClose={() => setSelectedUserStories(null)}
        />
      )}
    </div>
  )
}
