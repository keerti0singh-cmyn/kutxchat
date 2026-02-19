import type { RefObject } from 'react'

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
}

export class WebRTCManager {
  private pc: RTCPeerConnection | null = null
  private localStream: MediaStream | null = null
  private remoteStream: MediaStream | null = null

  async initialize(): Promise<MediaStream> {
    this.localStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: false,
    })

    this.pc = new RTCPeerConnection(ICE_SERVERS)

    // Add local tracks
    this.localStream.getTracks().forEach(track => {
      this.pc?.addTrack(track, this.localStream!)
    })

    // Handle remote stream
    this.pc.ontrack = (event) => {
      this.remoteStream = event.streams[0]
    }

    return this.localStream
  }

  async createOffer(): Promise<RTCSessionDescriptionInit> {
    if (!this.pc) throw new Error('PeerConnection not initialized')

    const offer = await this.pc.createOffer()
    await this.pc.setLocalDescription(offer)
    return offer
  }

  async handleOffer(offer: RTCSessionDescriptionInit): Promise<RTCSessionDescriptionInit> {
    if (!this.pc) throw new Error('PeerConnection not initialized')

    await this.pc.setRemoteDescription(offer)
    const answer = await this.pc.createAnswer()
    await this.pc.setLocalDescription(answer)
    return answer
  }

  async handleAnswer(answer: RTCSessionDescriptionInit): Promise<void> {
    if (!this.pc) throw new Error('PeerConnection not initialized')

    await this.pc.setRemoteDescription(answer)
  }

  async handleIceCandidate(candidate: RTCIceCandidateInit): Promise<void> {
    if (!this.pc) throw new Error('PeerConnection not initialized')

    await this.pc.addIceCandidate(new RTCIceCandidate(candidate))
  }

  onIceCandidate(callback: (candidate: RTCIceCandidate) => void): void {
    if (!this.pc) return

    this.pc.onicecandidate = (event) => {
      if (event.candidate) {
        callback(event.candidate)
      }
    }
  }

  cleanup(): void {
    this.localStream?.getTracks().forEach(track => track.stop())
    this.remoteStream?.getTracks().forEach(track => track.stop())
    this.pc?.close()
    this.pc = null
    this.localStream = null
    this.remoteStream = null
  }

  getLocalStream(): MediaStream | null {
    return this.localStream
  }

  getRemoteStream(): MediaStream | null {
    return this.remoteStream
  }
}
