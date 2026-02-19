'use client'

import { cn } from '@/lib/utils'

interface StatusDotProps {
  isOnline: boolean
  className?: string
  size?: 'sm' | 'md'
}

export function StatusDot({ isOnline, className, size = 'md' }: StatusDotProps) {
  return (
    <span
      className={cn(
        'inline-block rounded-full ring-2 ring-background',
        size === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3',
        isOnline ? 'bg-green-500' : 'bg-gray-400',
        className
      )}
    />
  )
}
