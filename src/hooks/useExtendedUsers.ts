// src/hooks/useExtendedUsers.ts - Enhanced User Action with Guaranteed Refresh
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export interface ExtendedUser {
  id: string
  name: string
  email: string
  player_name?: string | null
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
        .select('id, name, email, player_name, role, created_at, last_login, email_verified, admin_approved, status')
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
        player_name: user.player_name || null,
        role: user.role,
        created_at: user.created_at,
        last_login: user.last_login,
        email_verified: user.email_verified,
        admin_approved: user.admin_approved,
        status: user.status
      })) || []
    },
    staleTime: 30 * 1000, // Reduced to 30 seconds for faster updates
    refetchOnWindowFocus: true, // Refetch when window gains focus
  })
}

// ENHANCED User Action Mutation with Guaranteed Refresh
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
        // Don't fail the operation if email fails
      })

      return { userId, action, newStatus, newAdminApproved }
    },
    onSuccess: async (data) => {
      console.log(`✅ User ${data.action} completed successfully`)
      
      // ENHANCED: Multiple strategies to ensure immediate refresh
      
      // 1. Remove stale data from cache
      queryClient.removeQueries({ queryKey: extendedUserKeys.all })
      
      // 2. Force immediate refetch
      await queryClient.refetchQueries({ 
        queryKey: extendedUserKeys.all,
        type: 'all' // Refetch both active and inactive queries
      })
      
      // 3. Invalidate all related user queries (including admin dashboard)
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: extendedUserKeys.all })
      
      // 4. Update cache directly with optimistic update
      queryClient.setQueryData(extendedUserKeys.lists(), (oldData: ExtendedUser[] | undefined) => {
        if (!oldData) return oldData
        
        return oldData.map(user => {
          if (user.id === data.userId) {
            return {
              ...user,
              status: data.newStatus as ExtendedUser['status'],
              admin_approved: data.newAdminApproved
            }
          }
          return user
        })
      })
      
      console.log('🔄 Cache updated and queries refetched')
    },
    onError: (error) => {
      console.error('❌ User action error:', error)
    }
  })
}

// Enhanced Delete User Mutation
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
      return { ...result, deletedUserId: userId }
    },
    onSuccess: async (result) => {
      console.log('🔄 Refreshing data after user deletion')
      
      // Enhanced refresh for deletion
      queryClient.removeQueries({ queryKey: extendedUserKeys.all })
      
      await queryClient.refetchQueries({ 
        queryKey: extendedUserKeys.all,
        type: 'all'
      })
      
      // Remove from cache directly
      queryClient.setQueryData(extendedUserKeys.lists(), (oldData: ExtendedUser[] | undefined) => {
        if (!oldData) return oldData
        return oldData.filter(user => user.id !== result.deletedUserId)
      })
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
    onError: (error) => {
      console.error('❌ Delete user error:', error)
    }
  })
}

// Enhanced Promote User Mutation
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
    onSuccess: async (result) => {
      console.log('🔄 Refreshing data after user promotion')
      
      // Enhanced refresh for promotion
      queryClient.removeQueries({ queryKey: extendedUserKeys.all })
      
      await queryClient.refetchQueries({ 
        queryKey: extendedUserKeys.all,
        type: 'all'
      })
      
      // Update cache directly
      queryClient.setQueryData(extendedUserKeys.lists(), (oldData: ExtendedUser[] | undefined) => {
        if (!oldData) return oldData
        
        return oldData.map(user => {
          if (user.id === result.userId) {
            return {
              ...user,
              role: 'admin' as const,
              admin_approved: true,
              status: 'approved' as const
            }
          }
          return user
        })
      })
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
    onError: (error) => {
      console.error('❌ Promote user error:', error)
    }
  })
}