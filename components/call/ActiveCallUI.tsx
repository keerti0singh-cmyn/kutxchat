'use client'

import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { PhoneOff, Mic, MicOff } from 'lucide-react'
import { useState } from 'react'
import type { User } from '@/types/database.types'

interface ActiveCallUIProps {
  user: User
  onHangup: () => void
}

export function ActiveCallUI({ user, onHangup }: ActiveCallUIProps) {
  const [isMuted, setIsMuted] = useState(false)
  const [callDuration, setCallDuration] = useState(0)

  // Format duration as MM:SS
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-b from-slate-900 to-slate-800 flex flex-col items-center justify-center text-white">
      <div className="text-center">
        <Avatar
          src={user.avatar_url}
          alt={user.username}
          size="xl"
          className="mb-4 mx-auto"
        />
        <h2 className="text-2xl font-semibold mb-2">{user.username}</h2>
        <p className="text-slate-400 text-lg">{formatDuration(callDuration)}</p>
      </div>

      <div className="flex gap-6 mt-12">
        <button
          onClick={() => setIsMuted(!isMuted)}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
            isMuted ? 'bg-red-500' : 'bg-slate-700 hover:bg-slate-600'
          }`}
        >
          {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
        </button>

        <button
          onClick={onHangup}
          className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-colors"
        >
          <PhoneOff className="w-6 h-6" />
        </button>
      </div>
    </div>
  )
}
