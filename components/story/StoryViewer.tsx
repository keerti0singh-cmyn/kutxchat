'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { X, ChevronLeft, ChevronRight, Eye } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import type { Story, StoryView, User } from '@/types/database.types'

interface StoryViewerProps {
  stories: Story[]
  user: User
  onClose: () => void
  currentIndex?: number
}

export function StoryViewer({ stories, user, onClose, currentIndex = 0 }: StoryViewerProps) {
  const [currentStoryIndex, setCurrentStoryIndex] = useState(currentIndex)
  const [progress, setProgress] = useState(0)
  const [views, setViews] = useState<StoryView[]>([])
  const [showViews, setShowViews] = useState(false)
  const [isOwner, setIsOwner] = useState(false)
  const supabase = createClient()

  const currentStory = stories[currentStoryIndex]

  useEffect(() => {
    const checkOwnership = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      setIsOwner(currentUser?.id === user.id)
    }
    checkOwnership()
  }, [user.id, supabase])

  useEffect(() => {
    if (!currentStory || isOwner) return

    // Record view
    const recordView = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      if (!currentUser) return

      await supabase.from('story_views').insert({
        story_id: currentStory.id,
        viewer_id: currentUser.id,
      })
    }
    recordView()
  }, [currentStory, isOwner, supabase])

  useEffect(() => {
    if (!isOwner || !currentStory) return

    // Fetch views
    const fetchViews = async () => {
      const { data } = await supabase
        .from('story_views')
        .select(`
          *,
          viewer:users(id, username, avatar_url)
        `)
        .eq('story_id', currentStory.id)
        .order('viewed_at', { ascending: false })

      if (data) setViews(data)
    }
    fetchViews()
  }, [currentStory, isOwner, supabase])

  useEffect(() => {
    if (!currentStory) return

    const duration = 5000 // 5 seconds per story
    const interval = 50 // Update every 50ms
    let elapsed = 0

    const timer = setInterval(() => {
      elapsed += interval
      setProgress((elapsed / duration) * 100)

      if (elapsed >= duration) {
        if (currentStoryIndex < stories.length - 1) {
          setCurrentStoryIndex(currentStoryIndex + 1)
          setProgress(0)
        } else {
          onClose()
        }
      }
    }, interval)

    return () => clearInterval(timer)
  }, [currentStory, currentStoryIndex, stories.length, onClose])

  const handlePrevious = useCallback(() => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(currentStoryIndex - 1)
      setProgress(0)
    }
  }, [currentStoryIndex])

  const handleNext = useCallback(() => {
    if (currentStoryIndex < stories.length - 1) {
      setCurrentStoryIndex(currentStoryIndex + 1)
      setProgress(0)
    } else {
      onClose()
    }
  }, [currentStoryIndex, stories.length, onClose])

  if (!currentStory) return null

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Progress bars */}
      <div className="absolute top-0 left-0 right-0 flex gap-1 p-2 z-10">
        {stories.map((_, idx) => (
          <div key={idx} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-100"
              style={{
                width: idx < currentStoryIndex ? '100%' : idx === currentStoryIndex ? `${progress}%` : '0%'
              }}
            />
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="absolute top-4 left-0 right-0 flex items-center justify-between px-4 z-10">
        <div className="flex items-center gap-3">
          <Avatar src={user.avatar_url} alt={user.username} size="sm" />
          <span className="text-white font-medium">{user.username}</span>
        </div>
        <button onClick={onClose} className="p-2 text-white">
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Story content */}
      <div className="h-full flex items-center justify-center p-4">
        {currentStory.media_url ? (
          <img
            src={currentStory.media_url}
            alt="Story"
            className="max-h-full max-w-full object-contain"
          />
        ) : (
          <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-8 rounded-2xl max-w-md">
            <p className="text-white text-xl text-center">{currentStory.text_content}</p>
          </div>
        )}
        {currentStory.caption && (
          <div className="absolute bottom-20 left-4 right-4 text-center">
            <p className="text-white text-shadow">{currentStory.caption}</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <button
        onClick={handlePrevious}
        disabled={currentStoryIndex === 0}
        className="absolute left-2 top-1/2 -translate-y-1/2 p-2 text-white disabled:opacity-30"
      >
        <ChevronLeft className="w-8 h-8" />
      </button>
      <button
        onClick={handleNext}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-white"
      >
        <ChevronRight className="w-8 h-8" />
      </button>

      {/* View count (owner only) */}
      {isOwner && (
        <button
          onClick={() => setShowViews(!showViews)}
          className="absolute bottom-4 left-4 flex items-center gap-2 text-white"
        >
          <Eye className="w-5 h-5" />
          <span>{views.length}</span>
        </button>
      )}

      {/* Views panel */}
      {showViews && isOwner && (
        <div className="absolute bottom-0 left-0 right-0 bg-black/90 rounded-t-2xl max-h-1/2 overflow-auto">
          <div className="p-4">
            <h3 className="text-white font-medium mb-4">Views ({views.length})</h3>
            {views.map((view: any) => (
              <div key={view.id} className="flex items-center gap-3 py-2">
                <Avatar
                  src={view.viewer?.avatar_url}
                  alt={view.viewer?.username}
                  size="sm"
                />
                <div className="flex-1">
                  <p className="text-white text-sm">{view.viewer?.username}</p>
                  <p className="text-white/50 text-xs">
                    {new Date(view.viewed_at).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
