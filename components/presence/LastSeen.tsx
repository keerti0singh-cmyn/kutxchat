'use client'

import { formatLastSeen } from '@/lib/utils'

interface LastSeenProps {
  lastSeen: string | null
  className?: string
}

export function LastSeen({ lastSeen, className }: LastSeenProps) {
  return (
    <span className={className}>
      {formatLastSeen(lastSeen)}
    </span>
  )
}
