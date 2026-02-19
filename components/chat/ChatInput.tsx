'use client'

import { Button } from '@/components/ui/Button'
import { useState, useRef, useCallback } from 'react'
import { Paperclip, Send, Image, X } from 'lucide-react'
import { uploadFile } from '@/lib/upload'

interface ChatInputProps {
  onSend: (content: string, type?: 'text' | 'image' | 'document', fileUrl?: string) => void
  onTyping: () => void
}

export function ChatInput({ onSend, onTyping }: ChatInputProps) {
  const [message, setMessage] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleTyping = useCallback(() => {
    onTyping()
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      // Stop typing indicator after 3 seconds
    }, 3000)
  }, [onTyping])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!message.trim() && !selectedFile) return

    try {
      if (selectedFile) {
        setIsUploading(true)
        const fileType = selectedFile.type.startsWith('image/') ? 'stories' : 'attachments'
        const fileUrl = await uploadFile(selectedFile, fileType)
        const messageType = selectedFile.type.startsWith('image/') ? 'image' : 'document'
        onSend(message, messageType, fileUrl || undefined)
        setSelectedFile(null)
        setPreviewUrl(null)
      } else {
        onSend(message)
      }
      setMessage('')
    } catch (error) {
      console.error('Failed to send message:', error)
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB')
      return
    }

    setSelectedFile(file)
    
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const clearFile = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border-t bg-background p-4">
      {selectedFile && (
        <div className="mb-3 flex items-center gap-2 p-2 bg-muted rounded-lg">
          {previewUrl ? (
            <img src={previewUrl} alt="Preview" className="w-12 h-12 object-cover rounded" />
          ) : (
            <Paperclip className="w-5 h-5" />
          )}
          <span className="text-sm flex-1 truncate">{selectedFile.name}</span>
          <button
            type="button"
            onClick={clearFile}
            className="p-1 hover:bg-muted-foreground/10 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      
      <div className="flex items-end gap-2">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          className="hidden"
          accept="image/*,.pdf,.doc,.docx"
        />
        
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-2.5 hover:bg-muted rounded-full transition-colors"
        >
          <Paperclip className="w-5 h-5 text-muted-foreground" />
        </button>

        <div className="flex-1">
          <input
            type="text"
            value={message}
            onChange={(e) => {
              setMessage(e.target.value)
              handleTyping()
            }}
            placeholder="Type a message..."
            className="w-full px-4 py-2.5 bg-muted rounded-full focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <Button
          type="submit"
          size="sm"
          isLoading={isUploading}
          disabled={!message.trim() && !selectedFile}
          className="rounded-full p-2.5 h-auto"
        >
          <Send className="w-5 h-5" />
        </Button>
      </div>
    </form>
  )
}
