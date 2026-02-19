'use client'

import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { Phone, PhoneOff } from 'lucide-react'
import type { ActiveCall } from '@/types/database.types'
import type { User } from '@/types/database.types'

interface IncomingCallModalProps {
  isOpen: boolean
  call: ActiveCall | null
  caller: User | null
  onAccept: () => void
  onReject: () => void
}

export function IncomingCallModal({
  isOpen,
  call,
  caller,
  onAccept,
  onReject,
}: IncomingCallModalProps) {
  if (!call || !caller) return null

  return (
    <Modal isOpen={isOpen} onClose={onReject} className="max-w-sm">
      <div className="flex flex-col items-center text-center py-6">
        <div className="relative mb-4">
          <Avatar
            src={caller.avatar_url}
            alt={caller.username}
            size="xl"
          />
          <div className="absolute -bottom-1 -right-1 bg-green-500 p-2 rounded-full animate-pulse">
            <Phone className="w-5 h-5 text-white" />
          </div>
        </div>

        <h3 className="text-xl font-semibold mb-1">{caller.username}</h3>
        <p className="text-muted-foreground mb-8">Incoming audio call...</p>

        <div className="flex gap-4">
          <Button
            variant="destructive"
            size="lg"
            className="rounded-full w-14 h-14 p-0"
            onClick={onReject}
          >
            <PhoneOff className="w-6 h-6" />
          </Button>
          
          <Button
            size="lg"
            className="rounded-full w-14 h-14 p-0 bg-green-500 hover:bg-green-600"
            onClick={onAccept}
          >
            <Phone className="w-6 h-6" />
          </Button>
        </div>
      </div>
    </Modal>
  )
}
