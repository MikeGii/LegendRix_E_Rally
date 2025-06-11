// src/hooks/useExtendedUsers.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export interface ExtendedUser {
  id: string
  name: string
  email: string
  role: 'user' | 'admin'
  created_at: string
  last_login?: string
  email_verified: boolean
  admin_approved: boolean
  status: 'pending_email' | 'pending_approval' | 'approved' | 'rejected'
}

export interface UserActionParams {
  userId: string
  action: 'approve' | 'reject'
  reason?: string
}

// Query Keys
export const extendedUserKeys = {
  all: ['extended_users'] as const,
  lists: () => [...extendedUserKeys.all, 'list'] as const,
}

// Fetch All Users Hook
export function useAllUsers() {
  return useQuery({
    queryKey: extendedUserKeys.lists(),
    queryFn: async (): Promise<ExtendedUser[]> => {
      console.log('🔄 Fetching all users for management...')
      
      const { data: users, error } = await supabase
        .from('users')
        .select('id, name, email, role, created_at, last_login, email_verified, admin_approved, status')
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
        role: user.role,
        created_at: user.created_at,
        last_login: user.last_login,
        email_verified: user.email_verified,
        admin_approved: user.admin_approved,
        status: user.status
      })) || []
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

// User Action Mutation (Approve/Reject)
export function useUserAction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ userId, action, reason }: UserActionParams) => {
      console.log(`🔄 ${action.toUpperCase()} USER ACTION:`, { userId, action })
      
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
      })

      return { userId, action, newStatus }
    },
    onSuccess: (data) => {
      console.log(`✅ User ${data.action} completed successfully`)
      queryClient.invalidateQueries({ queryKey: extendedUserKeys.all })
    },
    onError: (error) => {
      console.error('❌ User action error:', error)
    }
  })
}

// Delete User Mutation
export function useDeleteUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (userId: string) => {
      console.log('🔄 Deleting user:', userId)
      
      const response = await fetch('/api/admin/delete-user', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete user')
      }

      const result = await response.json()
      console.log('✅ User deleted successfully:', result.deletedUser)
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: extendedUserKeys.all })
    },
    onError: (error) => {
      console.error('❌ Delete user error:', error)
    }
  })
}

// Promote User to Admin Mutation
export function usePromoteUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (userId: string) => {
      console.log('🔄 Promoting user to admin:', userId)
      
      const { error } = await supabase
        .from('users')
        .update({
          role: 'admin',
          admin_approved: true,
          status: 'approved',
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)

      if (error) {
        console.error('Promote user error:', error)
        throw error
      }

      console.log('✅ User promoted to admin successfully')
      return { userId }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: extendedUserKeys.all })
    },
    onError: (error) => {
      console.error('❌ Promote user error:', error)
    }
  })
}