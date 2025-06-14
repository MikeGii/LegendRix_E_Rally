// src/hooks/useRallyRegistrations.ts - CLEANED VERSION
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { rallyKeys } from './useOptimizedRallies'

export interface RallyRegistration {
  id: string
  rally_id: string
  user_id: string
  class_id: string
  registration_date: string
  status: 'registered' | 'confirmed' | 'cancelled' | 'disqualified' | 'completed'
  created_at: string
  updated_at: string
  // Joined data
  user_name?: string
  user_email?: string
  user_player_name?: string
  class_name?: string
  rally_name?: string
}

export const registrationKeys = {
  all: ['rally_registrations'] as const,
  rally: (rallyId: string) => [...registrationKeys.all, 'rally', rallyId] as const,
  user: (userId: string) => [...registrationKeys.all, 'user', userId] as const,
}

// ============================================================================
// CREATE REGISTRATION MUTATION - CLEANED
// ============================================================================

export function useCreateRegistration() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (params: {
      rally_id: string
      class_id: string
    }) => {
      console.log('🔄 Creating rally registration...')
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('rally_registrations')
        .insert([{
          rally_id: params.rally_id,
          user_id: user.id,
          class_id: params.class_id,
          status: 'registered'
        }])
        .select()
        .single()

      if (error) {
        console.error('Error creating registration:', error)
        throw error
      }

      console.log('✅ Registration created successfully')
      return data
    },
    onSuccess: (data, variables) => {
      console.log('🔄 Invalidating caches after registration creation...')
      
      queryClient.invalidateQueries({ queryKey: registrationKeys.rally(variables.rally_id) })
      queryClient.invalidateQueries({ queryKey: registrationKeys.all })
      queryClient.invalidateQueries({ queryKey: rallyKeys.registrations() })
      queryClient.invalidateQueries({ queryKey: rallyKeys.upcoming() })
      queryClient.invalidateQueries({ queryKey: rallyKeys.featured() })
      queryClient.invalidateQueries({ queryKey: rallyKeys.lists() })
      queryClient.refetchQueries({ queryKey: rallyKeys.registrations() })
      
      console.log('✅ Cache invalidation completed')
    },
    onError: (error) => {
      console.error('❌ Registration creation failed:', error)
    }
  })
}

// ============================================================================
// DELETE REGISTRATION MUTATION - CLEANED
// ============================================================================

export function useDeleteRegistration() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (registrationId: string) => {
      console.log('🔄 Deleting rally registration...', registrationId)
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data: registration, error: fetchError } = await supabase
        .from('rally_registrations')
        .select('rally_id, user_id')
        .eq('id', registrationId)
        .single()

      if (fetchError) {
        console.error('Error fetching registration:', fetchError)
        throw fetchError
      }

      if (registration.user_id !== user.id) {
        throw new Error('Unauthorized: Cannot delete another user\'s registration')
      }

      const { error } = await supabase
        .from('rally_registrations')
        .delete()
        .eq('id', registrationId)
        .eq('user_id', user.id)

      if (error) {
        console.error('Error deleting registration:', error)
        throw error
      }

      console.log('✅ Registration deleted successfully')
      return { registrationId, rallyId: registration.rally_id }
    },
    onSuccess: (data) => {
      console.log('🔄 Invalidating caches after registration deletion...')
      
      queryClient.invalidateQueries({ queryKey: registrationKeys.rally(data.rallyId) })
      queryClient.invalidateQueries({ queryKey: registrationKeys.all })
      queryClient.invalidateQueries({ queryKey: rallyKeys.registrations() })
      queryClient.invalidateQueries({ queryKey: rallyKeys.upcoming() })
      queryClient.invalidateQueries({ queryKey: rallyKeys.featured() })
      queryClient.invalidateQueries({ queryKey: rallyKeys.lists() })
      queryClient.refetchQueries({ queryKey: rallyKeys.registrations() })
      
      console.log('✅ Cache invalidation completed')
    },
    onError: (error) => {
      console.error('❌ Registration deletion failed:', error)
    }
  })
}

// ============================================================================
// UPDATE REGISTRATION MUTATION - CLEANED
// ============================================================================

export function useUpdateRegistration() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (params: {
      registrationId: string
      class_id: string
    }) => {
      console.log('🔄 Updating rally registration...', params)
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data: registration, error: fetchError } = await supabase
        .from('rally_registrations')
        .select('rally_id, user_id')
        .eq('id', params.registrationId)
        .single()

      if (fetchError) {
        console.error('Error fetching registration:', fetchError)
        throw fetchError
      }

      if (registration.user_id !== user.id) {
        throw new Error('Unauthorized: Cannot update another user\'s registration')
      }

      const { data, error } = await supabase
        .from('rally_registrations')
        .update({ 
          class_id: params.class_id,
          updated_at: new Date().toISOString()
        })
        .eq('id', params.registrationId)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) {
        console.error('Error updating registration:', error)
        throw error
      }

      console.log('✅ Registration updated successfully')
      return { ...data, rallyId: registration.rally_id }
    },
    onSuccess: (data) => {
      console.log('🔄 Invalidating caches after registration update...')
      
      queryClient.invalidateQueries({ queryKey: registrationKeys.rally(data.rallyId) })
      queryClient.invalidateQueries({ queryKey: registrationKeys.all })
      queryClient.invalidateQueries({ queryKey: rallyKeys.registrations() })
      queryClient.invalidateQueries({ queryKey: rallyKeys.upcoming() })
      queryClient.invalidateQueries({ queryKey: rallyKeys.featured() })
      queryClient.invalidateQueries({ queryKey: rallyKeys.lists() })
      queryClient.refetchQueries({ queryKey: rallyKeys.registrations() })
      
      console.log('✅ Cache invalidation completed')
    },
    onError: (error) => {
      console.error('❌ Registration update failed:', error)
    }
  })
}

// ============================================================================
// GET RALLY REGISTRATIONS - CLEANED
// ============================================================================

export function useRallyRegistrations(rallyId: string) {
  return useQuery({
    queryKey: registrationKeys.rally(rallyId),
    queryFn: async () => {
      console.log('🔄 Loading registrations for rally:', rallyId)
      
      const { data: registrations, error } = await supabase
        .from('rally_registrations')
        .select(`
          *,
          users!inner(
            id,
            name,
            email,
            player_name
          ),
          game_classes!inner(
            id,
            name
          )
        `)
        .eq('rally_id', rallyId)
        .eq('users.admin_approved', true)
        .order('registration_date', { ascending: true })

      if (error) {
        console.error('Error loading rally registrations:', error)
        throw error
      }

      const transformedRegistrations = registrations?.map(reg => ({
        ...reg,
        user_name: reg.users?.name,
        user_email: reg.users?.email,
        user_player_name: reg.users?.player_name,
        class_name: reg.game_classes?.name
      })) || []

      console.log(`✅ Rally registrations loaded: ${transformedRegistrations.length}`)
      return transformedRegistrations
    },
    staleTime: 2 * 60 * 1000,
  })
}

// ============================================================================
// GET AVAILABLE CLASSES FOR RALLY - CLEANED
// ============================================================================

export function useRallyAvailableClasses(rallyId: string) {
  return useQuery({
    queryKey: ['rally_classes', rallyId],
    queryFn: async () => {
      if (!rallyId) return []
      
      console.log('🔄 Loading available classes for rally:', rallyId)
      
      const { data: rally, error: rallyError } = await supabase
        .from('rallies')
        .select('game_id')
        .eq('id', rallyId)
        .single()

      if (rallyError) {
        console.error('Error loading rally:', rallyError)
        throw rallyError
      }

      if (!rally?.game_id) {
        console.log('No game_id found for rally')
        return []
      }

      const { data: gameClasses, error } = await supabase
        .from('game_classes')
        .select(`
          id,
          name,
          game_id,
          is_active,
          created_at,
          updated_at
        `)
        .eq('game_id', rally.game_id)
        .eq('is_active', true)

      if (error) {
        console.error('Error loading game classes:', error)
        throw error
      }

      console.log(`✅ Game classes loaded: ${gameClasses?.length || 0}`)
      return gameClasses || []
    },
    enabled: !!rallyId,
    staleTime: 5 * 60 * 1000,
  })
}