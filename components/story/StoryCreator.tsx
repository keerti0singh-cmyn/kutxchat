'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Upload, Type, X } from 'lucide-react'
import { uploadFile } from '@/lib/upload'
import { createClient } from '@/lib/supabase'

interface StoryCreatorProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function StoryCreator({ isOpen, onClose, onSuccess }: StoryCreatorProps) {
  const [activeTab, setActiveTab] = useState<'image' | 'text'>('image')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [textContent, setTextContent] = useState('')
  const [caption, setCaption] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB')
      return
    }

    setSelectedFile(file)
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async () => {
    try {
      setIsUploading(true)
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) throw new Error('Not authenticated')

      let mediaUrl = null
      if (selectedFile && activeTab === 'image') {
        mediaUrl = await uploadFile(selectedFile, 'stories')
      }

      const expiresAt = new Date()
      expiresAt.setHours(expiresAt.getHours() + 24)

      const { error } = await supabase.from('stories').insert({
        user_id: user.id,
        media_url: mediaUrl,
        text_content: activeTab === 'text' ? textContent : null,
        caption: caption || null,
        expires_at: expiresAt.toISOString(),
      })

      if (error) throw error

      // Reset form
      setSelectedFile(null)
      setPreviewUrl(null)
      setTextContent('')
      setCaption('')
      onSuccess()
      onClose()
    } catch (error) {
      console.error('Failed to create story:', error)
      alert('Failed to create story. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Story">
      <div className="space-y-4">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('image')}
            className={`flex-1 py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors ${
              activeTab === 'image'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted'
            }`}
          >
            <Upload className="w-4 h-4" />
            Image
          </button>
          <button
            onClick={() => setActiveTab('text')}
            className={`flex-1 py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors ${
              activeTab === 'text'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted'
            }`}
          >
            <Type className="w-4 h-4" />
            Text
          </button>
        </div>

        {activeTab === 'image' ? (
          <div>
            {previewUrl ? (
              <div className="relative">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-64 object-cover rounded-lg"
                />
                <button
                  onClick={() => {
                    setSelectedFile(null)
                    setPreviewUrl(null)
                  }}
                  className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-64 border-2 border-dashed border-muted-foreground/25 rounded-lg flex flex-col items-center justify-center gap-2 hover:bg-muted transition-colors"
              >
                <Upload className="w-8 h-8 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Click to upload image
                </span>
              </button>
            )}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/*,video/*"
              className="hidden"
            />
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Add a caption (optional)"
              className="w-full mt-3 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        ) : (
          <div>
            <textarea
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              placeholder="What's on your mind?"
              rows={4}
              className="w-full px-3 py-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        )}

        <Button
          onClick={handleSubmit}
          isLoading={isUploading}
          disabled={
            (activeTab === 'image' && !selectedFile) ||
            (activeTab === 'text' && !textContent.trim())
          }
          className="w-full"
        >
          Post Story
        </Button>
      </div>
    </Modal>
  )
}
