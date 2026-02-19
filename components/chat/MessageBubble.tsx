'use client'

import { cn, formatMessageTime } from '@/lib/utils'
import type { Message } from '@/types/database.types'
import { Check, CheckCheck } from 'lucide-react'
import Image from 'next/image'

interface MessageBubbleProps {
  message: Message
  isOwn: boolean
}

export function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  const renderContent = () => {
    switch (message.message_type) {
      case 'text':
        return <p className="text-sm">{message.text_content}</p>
      
      case 'image':
        return (
          <div className="relative w-full max-w-xs">
            <Image
              src={message.file_url!}
              alt="Shared image"
              width={300}
              height={200}
              className="rounded-lg object-cover"
            />
            {message.text_content && (
              <p className="mt-2 text-sm">{message.text_content}</p>
            )}
          </div>
        )
      
      case 'document':
        return (
          <a
            href={message.file_url!}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm underline hover:no-underline"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download Document
          </a>
        )
    }
  }

  const renderTicks = () => {
    if (!isOwn) return null

    switch (message.status) {
      case 'sent':
        return <Check className="w-3.5 h-3.5 text-muted-foreground" />
      case 'delivered':
        return <CheckCheck className="w-3.5 h-3.5 text-muted-foreground" />
      case 'seen':
        return <CheckCheck className="w-3.5 h-3.5 text-blue-500" />
    }
  }

  return (
    <div
      className={cn(
        'flex w-full',
        isOwn ? 'justify-end' : 'justify-start'
      )}
    >
      <div
        className={cn(
          'max-w-[75%] rounded-2xl px-4 py-2.5',
          isOwn
            ? 'bg-primary text-primary-foreground rounded-br-md'
            : 'bg-muted rounded-bl-md'
        )}
      >
        {renderContent()}
        <div className="flex items-center justify-end gap-1 mt-1">
          <span className="text-[10px] opacity-70">
            {formatMessageTime(message.created_at)}
          </span>
          {renderTicks()}
        </div>
      </div>
    </div>
  )
}
