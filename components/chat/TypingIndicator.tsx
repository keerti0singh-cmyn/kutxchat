'use client'

interface TypingIndicatorProps {
  username: string
}

export function TypingIndicator({ username }: TypingIndicatorProps) {
  return (
    <div className="flex items-center gap-1 text-sm text-muted-foreground px-4 py-2">
      <span>{username} is typing</span>
      <span className="flex gap-0.5">
        <span className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </span>
    </div>
  )
}
