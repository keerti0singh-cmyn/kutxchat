import { create } from 'zustand'
import { createClient } from '@/lib/supabase'
import type { ActiveCall } from '@/types/database.types'

interface CallState {
  activeCall: ActiveCall | null
  isInCall: boolean
  incomingCall: ActiveCall | null
  localStream: MediaStream | null
  remoteStream: MediaStream | null
  peerConnection: RTCPeerConnection | null
  
  initiateCall: (receiverId: string) => Promise<void>
  acceptCall: (callId: string) => Promise<void>
  rejectCall: (callId: string) => Promise<void>
  endCall: () => Promise<void>
  setIncomingCall: (call: ActiveCall | null) => void
}

export const useCallStore = create<CallState>((set, get) => ({
  activeCall: null,
  isInCall: false,
  incomingCall: null,
  localStream: null,
  remoteStream: null,
  peerConnection: null,

  initiateCall: async (receiverId) => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Not authenticated')

    // Create call record
    const { data, error } = await supabase
      .from('active_calls')
      .insert({
        caller_id: user.id,
        receiver_id: receiverId,
        status: 'ringing',
      })
      .select()
      .single()

    if (error) throw error

    set({ activeCall: data, isInCall: true })
  },

  acceptCall: async (callId) => {
    const supabase = createClient()

    const { error } = await supabase
      .from('active_calls')
      .update({ status: 'accepted' })
      .eq('id', callId)

    if (error) throw error

    set((state) => ({
      activeCall: state.incomingCall,
      incomingCall: null,
      isInCall: true,
    }))
  },

  rejectCall: async (callId) => {
    const supabase = createClient()

    const { error } = await supabase
      .from('active_calls')
      .update({ status: 'rejected' })
      .eq('id', callId)

    if (error) throw error

    set({ incomingCall: null })
  },

  endCall: async () => {
    const { activeCall } = get()
    if (!activeCall) return

    const supabase = createClient()

    const { error } = await supabase
      .from('active_calls')
      .update({ status: 'ended' })
      .eq('id', activeCall.id)

    if (error) throw error

    // Cleanup streams
    const { localStream, remoteStream, peerConnection } = get()
    localStream?.getTracks().forEach(track => track.stop())
    remoteStream?.getTracks().forEach(track => track.stop())
    peerConnection?.close()

    set({
      activeCall: null,
      isInCall: false,
      localStream: null,
      remoteStream: null,
      peerConnection: null,
    })
  },

  setIncomingCall: (call) => {
    set({ incomingCall: call })
  },
}))
