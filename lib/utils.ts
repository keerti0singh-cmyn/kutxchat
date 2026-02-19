import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatLastSeen(date: Date | string | null): string {
  if (!date) return 'Offline'
  
  const now = new Date()
  const lastSeen = new Date(date)
  const diffInSeconds = Math.floor((now.getTime() - lastSeen.getTime()) / 1000)
  
  if (diffInSeconds < 60) return 'Last seen just now'
  if (diffInSeconds < 3600) return `Last seen ${Math.floor(diffInSeconds / 60)} minutes ago`
  if (diffInSeconds < 86400) return `Last seen ${Math.floor(diffInSeconds / 3600)} hours ago`
  return `Last seen ${Math.floor(diffInSeconds / 86400)} days ago`
}

export function formatMessageTime(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  })
}
