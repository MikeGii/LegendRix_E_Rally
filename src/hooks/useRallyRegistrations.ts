// src/hooks/useRallyRegistrations.ts - FIXED for actual database structure

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
  car_number?: number
  team_name?: string
  notes?: string
  entry_fee_paid: number
  payment_status: 'pending' | 'paid' | 'refunded' | 'waived'
  created_at: string
  updated_at: string
  // Joined data
  user_name?: string
  user_email?: string
  class_name?: string
  rally_name?: string
}

export const registrationKeys = {
  all: ['rally_registrations'] as const,
  rally: (rallyId: string) => [...registrationKeys.all, 'rally', rallyId] as const,
  user: (userId: string) => [...registrationKeys.all, 'user', userId] as const,
}

// Get registrations for a specific rally
export function useRallyRegistrations(rallyId: string) {
  return useQuery({
    queryKey: registrationKeys.rally(rallyId),
    queryFn: async (): Promise<RallyRegistration[]> => {
      if (!rallyId) return []
      
      console.log('🔄 Loading registrations for rally:', rallyId)
      
      const { data: registrations, error } = await supabase
        .from('rally_registrations')
        .select(`
          *,
          user:users(name, email),
          class:game_classes(name),
          rally:rallies(name)
        `)
        .eq('rally_id', rallyId)
        .order('registration_date', { ascending: true })

      if (error) {
        console.error('Error loading rally registrations:', error)
        throw error
      }

      const transformedRegistrations: RallyRegistration[] = registrations?.map(reg => ({
        ...reg,
        user_name: reg.user?.name,
        user_email: reg.user?.email,
        class_name: reg.class?.name,
        rally_name: reg.rally?.name,
      })) || []

      console.log(`✅ Rally registrations loaded: ${transformedRegistrations.length}`)
      return transformedRegistrations
    },
    enabled: !!rallyId,
    staleTime: 2 * 60 * 1000,
  })
}

// FIXED: Get available classes for a rally - matching actual database structure
export function useRallyAvailableClasses(rallyId: string) {
  return useQuery({
    queryKey: ['rally_classes', rallyId],
    queryFn: async () => {
      if (!rallyId) return []
      
      console.log('🔄 Loading available classes for rally:', rallyId)
      
      // First, get the rally to find its game_id
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

      // Get available classes for this game (simplified structure)
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

// Create registration mutation
export function useCreateRegistration() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (params: {
      rally_id: string
      class_id: string
      // Removed: car_number, team_name, notes
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
          // Removed optional fields - set to null/default
          car_number: null,
          team_name: null,
          notes: null,
          status: 'registered',
          entry_fee_paid: 0,
          payment_status: 'pending'
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
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: registrationKeys.rally(variables.rally_id) })
      queryClient.invalidateQueries({ queryKey: ['user_rallies'] })
    }
  })
}

// Delete registration mutation (for unregistering)
export function useDeleteRegistration() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (registrationId: string) => {
      console.log('🔄 Deleting rally registration...', registrationId)
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      // First get the registration to find the rally_id for cache invalidation
      const { data: registration, error: fetchError } = await supabase
        .from('rally_registrations')
        .select('rally_id, user_id')
        .eq('id', registrationId)
        .single()

      if (fetchError) {
        console.error('Error fetching registration:', fetchError)
        throw fetchError
      }

      // Verify user owns this registration
      if (registration.user_id !== user.id) {
        throw new Error('Unauthorized: Cannot delete another user\'s registration')
      }

      // Delete the registration
      const { error } = await supabase
        .from('rally_registrations')
        .delete()
        .eq('id', registrationId)
        .eq('user_id', user.id) // Extra security check

      if (error) {
        console.error('Error deleting registration:', error)
        throw error
      }

      console.log('✅ Registration deleted successfully')
      return { registrationId, rallyId: registration.rally_id }
    },
    onSuccess: (data) => {
      // Invalidate relevant queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: registrationKeys.rally(data.rallyId) })
      queryClient.invalidateQueries({ queryKey: ['rally_registrations'] })
      queryClient.invalidateQueries({ queryKey: ['user_rallies'] })
    }
  })
}

// Update registration mutation (for changing class)
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

      // First get the registration to verify ownership and get rally_id
      const { data: registration, error: fetchError } = await supabase
        .from('rally_registrations')
        .select('rally_id, user_id')
        .eq('id', params.registrationId)
        .single()

      if (fetchError) {
        console.error('Error fetching registration:', fetchError)
        throw fetchError
      }

      // Verify user owns this registration
      if (registration.user_id !== user.id) {
        throw new Error('Unauthorized: Cannot update another user\'s registration')
      }

      // Update the registration
      const { data, error } = await supabase
        .from('rally_registrations')
        .update({ 
          class_id: params.class_id,
          updated_at: new Date().toISOString()
        })
        .eq('id', params.registrationId)
        .eq('user_id', user.id) // Extra security check
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
      // Invalidate relevant queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: registrationKeys.rally(data.rallyId) })
      queryClient.invalidateQueries({ queryKey: ['rally_registrations'] })
      queryClient.invalidateQueries({ queryKey: ['user_rallies'] })
    }
  })
}