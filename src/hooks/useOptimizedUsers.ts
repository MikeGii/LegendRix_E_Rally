import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export interface PendingUser {
  id: string
  name: string
  email: string
  created_at: string
  email_verified: boolean
  admin_approved: boolean
  status: 'pending_email' | 'pending_approval' | 'approved' | 'rejected'
}

export interface UserStats {
  totalUsers: number
  pendingEmail: number
  pendingApproval: number
  approved: number
  rejected: number
}

export interface UserActionParams {
  userId: string
  action: 'approve' | 'reject'
  reason?: string
}

// Query Keys
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filters: string) => [...userKeys.lists(), { filters }] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
}

// Fetch Users Hook
export function useUsers() {
  return useQuery({
    queryKey: userKeys.lists(),
    queryFn: async (): Promise<PendingUser[]> => {
      console.log('🔄 Fetching users with React Query...')
      
      const { data: users, error } = await supabase
        .from('users')
        .select('id, name, email, created_at, email_verified, admin_approved, status')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }

      console.log(`✅ Users loaded: ${users?.length || 0}`)
      
      return users?.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        created_at: user.created_at,
        email_verified: user.email_verified,
        admin_approved: user.admin_approved,
        status: user.status
      })) || []
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

// User Stats Hook
export function useUserStats() {
  const { data: users = [] } = useUsers()
  
  const stats: UserStats = {
    totalUsers: users.length,
    pendingEmail: users.filter(u => u.status === 'pending_email').length,
    pendingApproval: users.filter(u => 
      u.status === 'pending_approval' && 
      u.email_verified && 
      !u.admin_approved
    ).length,
    approved: users.filter(u => u.status === 'approved').length,
    rejected: users.filter(u => u.status === 'rejected').length
  }

  return stats
}

// User Action Mutation
export function useUserAction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ userId, action, reason }: UserActionParams) => {
      console.log(`🔄 ${action.toUpperCase()} USER ACTION STARTED:`, { userId, action })
      
      // Direct Supabase update for speed
      const newStatus = action === 'approve' ? 'approved' : 'rejected'
      const newAdminApproved = action === 'approve'

      const { error } = await supabase
        .from('users')
        .update({
          status: newStatus,
          admin_approved: newAdminApproved,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)

      if (error) {
        console.error('Supabase update error:', error)
        throw error
      }

      // Send notification via API route (background task)
      fetch('/api/admin/user-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action, reason })
      }).catch(error => {
        console.warn('Email notification failed:', error)
        // Don't fail the operation if email fails
      })

      return { userId, action, newStatus }
    },
    onSuccess: (data) => {
      console.log(`✅ User ${data.action} completed successfully`)
      // Invalidate and refetch users data
      queryClient.invalidateQueries({ queryKey: userKeys.all })
    },
    onError: (error) => {
      console.error('❌ User action error:', error)
    }
  })
}

// Real-time Subscription Hook
export function useRealtimeUsers() {
  const queryClient = useQueryClient()

  useEffect(() => {
    console.log('🔄 Setting up real-time subscription...')
    
    const subscription = supabase
      .channel('users_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'users' },
        (payload) => {
          console.log('🔄 Real-time update received:', payload)
          // Invalidate users query to refetch
          queryClient.invalidateQueries({ queryKey: userKeys.all })
        }
      )
      .subscribe()

    return () => {
      console.log('🔄 Cleaning up real-time subscription...')
      subscription.unsubscribe()
    }
  }, [queryClient])
}