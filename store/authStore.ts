import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createClient } from '@/lib/supabase'
import type { User } from '@/types/database.types'

interface AuthState {
  user: User | null
  isLoading: boolean
  error: string | null
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  login: (emailOrUsername: string, password: string) => Promise<void>
  signup: (email: string, username: string, password: string) => Promise<void>
  logout: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updatePassword: (newPassword: string) => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      error: null,

      setUser: (user) => set({ user }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),

      login: async (emailOrUsername, password) => {
        set({ isLoading: true, error: null })
        const supabase = createClient()

        try {
          let email = emailOrUsername

          // If input doesn't contain @, treat it as username
          if (!emailOrUsername.includes('@')) {
            const { data: userData, error: userError } = await supabase
              .from('users')
              .select('email')
              .eq('username', emailOrUsername)
              .single()

            if (userError || !userData) {
              throw new Error('Invalid username or password')
            }
            email = userData.email
          }

          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          })

          if (error) throw error

          // Check email confirmation
          if (!data.user?.email_confirmed_at) {
            throw new Error('Please verify your email before logging in')
          }

          // Get user profile
          const { data: profile, error: profileError } = await supabase
            .from('users')
            .select('*')
            .eq('id', data.user.id)
            .single()

          if (profileError) throw profileError

          set({ user: profile, isLoading: false })
        } catch (error: any) {
          set({ error: error.message, isLoading: false })
          throw error
        }
      },

      signup: async (email, username, password) => {
        set({ isLoading: true, error: null })
        const supabase = createClient()

        try {
          // Check for duplicate email
          const { data: existingEmail } = await supabase
            .from('users')
            .select('email')
            .eq('email', email)
            .single()

          if (existingEmail) {
            throw new Error('Email already registered')
          }

          // Check for duplicate username
          const { data: existingUsername } = await supabase
            .from('users')
            .select('username')
            .eq('username', username)
            .single()

          if (existingUsername) {
            throw new Error('Username already taken')
          }

          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                username,
              },
            },
          })

          if (error) throw error

          // Create user profile
          if (data.user) {
            const { error: profileError } = await supabase
              .from('users')
              .insert({
                id: data.user.id,
                email,
                username,
                password_hash: '', // Supabase Auth handles this
              })

            if (profileError) throw profileError
          }

          set({ isLoading: false })
        } catch (error: any) {
          set({ error: error.message, isLoading: false })
          throw error
        }
      },

      logout: async () => {
        set({ isLoading: true, error: null })
        const supabase = createClient()

        try {
          const user = get().user
          if (user) {
            // Update status to offline
            await supabase
              .from('users')
              .update({ 
                status: 'offline', 
                last_seen: new Date().toISOString() 
              })
              .eq('id', user.id)
          }

          await supabase.auth.signOut()
          set({ user: null, isLoading: false })
        } catch (error: any) {
          set({ error: error.message, isLoading: false })
          throw error
        }
      },

      resetPassword: async (email) => {
        set({ isLoading: true, error: null })
        const supabase = createClient()

        try {
          const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
          })

          if (error) throw error
          set({ isLoading: false })
        } catch (error: any) {
          set({ error: error.message, isLoading: false })
          throw error
        }
      },

      updatePassword: async (newPassword) => {
        set({ isLoading: true, error: null })
        const supabase = createClient()

        try {
          const { error } = await supabase.auth.updateUser({
            password: newPassword,
          })

          if (error) throw error
          set({ isLoading: false })
        } catch (error: any) {
          set({ error: error.message, isLoading: false })
          throw error
        }
      },
    }),
    {
      name: 'auth-storage',
    }
  )
)
