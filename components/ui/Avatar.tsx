'use client'

import { cn } from '@/lib/utils'
import Image from 'next/image'

interface AvatarProps {
  src?: string | null
  alt: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  showStatus?: boolean
  isOnline?: boolean
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16',
}

export function Avatar({ 
  src, 
  alt, 
  size = 'md', 
  className,
  showStatus = false,
  isOnline = false,
}: AvatarProps) {
  return (
    <div className={cn('relative inline-block', className)}>
      <div
        className={cn(
          'relative rounded-full overflow-hidden bg-muted flex items-center justify-center',
          sizeClasses[size]
        )}
      >
        {src ? (
          <Image
            src={src}
            alt={alt}
            fill
            className="object-cover"
          />
        ) : (
          <span className="text-lg font-medium text-muted-foreground">
            {alt.charAt(0).toUpperCase()}
          </span>
        )}
      </div>
      {showStatus && (
        <span
          className={cn(
            'absolute bottom-0 right-0 block rounded-full ring-2 ring-background',
            size === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3',
            isOnline ? 'bg-green-500' : 'bg-gray-400'
          )}
        />
      )}
    </div>
  )
}
