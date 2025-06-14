// src/hooks/useRallyManagement.ts - CLEANED VERSION
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

// CLEANED Rally Interface
export interface Rally {
  id: string
  name: string
  description?: string
  game_id: string
  game_type_id: string
  competition_date: string
  registration_deadline: string
  max_participants?: number
  status: 'upcoming' | 'registration_open' | 'registration_closed' | 'active' | 'completed' | 'cancelled'
  rules?: string
  is_featured: boolean
  is_active: boolean
  created_by?: string
  created_at: string
  updated_at: string
  // Joined data
  game_name?: string
  game_type_name?: string
  registered_participants?: number
  total_events?: number
  total_tracks?: number
}

export interface RallyEvent {
  id: string
  rally_id: string
  event_id: string
  event_order: number
  points_multiplier?: number
  is_active: boolean
  created_at?: string
  // Joined data
  event_name?: string
  tracks?: RallyEventTrack[]
}

export interface RallyEventTrack {
  id: string
  rally_event_id: string
  track_id: string
  track_order: number
  points_weight?: number
  is_active: boolean
  created_at?: string
  // Joined data
  track_name?: string
  track_length?: number
  track_surface_type?: string
}

export interface RallyClass {
  id: string
  rally_id: string
  class_id: string
  max_participants?: number
  is_active: boolean
  created_at?: string
  // Joined data
  class_name?: string
}

// Query Keys
export const rallyManagementKeys = {
  all: ['rally_management'] as const,
  rallies: () => [...rallyManagementKeys.all, 'rallies'] as const,
  rally: (id: string) => [...rallyManagementKeys.rallies(), id] as const,
  events: (rallyId: string) => [...rallyManagementKeys.rally(rallyId), 'events'] as const,
  classes: (rallyId: string) => [...rallyManagementKeys.rally(rallyId), 'classes'] as const,
}

// ============================================================================
// RALLIES HOOKS - CLEANED
// ============================================================================

export function useRallies() {
  return useQuery({
    queryKey: rallyManagementKeys.rallies(),
    queryFn: async (): Promise<Rally[]> => {
      console.log('🔄 Loading rallies...')
      
      const { data: rallies, error } = await supabase
        .from('rallies')
        .select(`
          *,
          game:games(name),
          game_type:game_types(name)
        `)
        .eq('is_active', true)
        .order('competition_date', { ascending: false })

      if (error) {
        console.error('Error loading rallies:', error)
        throw error
      }

      // Transform with game info
      const transformedRallies = rallies?.map(rally => ({
        ...rally,
        game_name: rally.game?.name || 'Unknown Game',
        game_type_name: rally.game_type?.name || 'Unknown Type',
        registered_participants: 0, // Calculate if needed
        total_events: 0, // Calculate if needed
        total_tracks: 0 // Calculate if needed
      })) || []

      console.log(`✅ Rallies loaded: ${transformedRallies.length}`)
      return transformedRallies
    },
    staleTime: 5 * 60 * 1000,
  })
}

export function useCreateRally() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (rallyData: {
      name: string
      description?: string
      game_id: string
      game_type_id: string
      competition_date: string
      registration_deadline: string
      max_participants?: number
      rules?: string
      is_featured?: boolean
    }) => {
      console.log('🔄 Creating rally:', rallyData.name)
      
      const { data: { user } } = await supabase.auth.getUser()
      
      const { data, error } = await supabase
        .from('rallies')
        .insert([{
          ...rallyData,
          status: 'upcoming',
          is_active: true,
          created_by: user?.id
        }])
        .select()
        .single()

      if (error) {
        console.error('Error creating rally:', error)
        throw error
      }

      console.log('✅ Rally created:', data.name)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rallyManagementKeys.rallies() })
    }
  })
}

export function useUpdateRally() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, ...rallyData }: { 
      id: string 
      name?: string
      description?: string
      game_id?: string
      game_type_id?: string
      competition_date?: string
      registration_deadline?: string
      max_participants?: number
      rules?: string
      is_featured?: boolean
      status?: string
    }) => {
      console.log('🔄 Updating rally:', id)
      
      const { data, error } = await supabase
        .from('rallies')
        .update({
          ...rallyData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Error updating rally:', error)
        throw error
      }

      console.log('✅ Rally updated:', data.name)
      return data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: rallyManagementKeys.rallies() })
      queryClient.invalidateQueries({ queryKey: rallyManagementKeys.rally(variables.id) })
    }
  })
}

export function useDeleteRally() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (rallyId: string) => {
      console.log('🔄 Deleting rally:', rallyId)
      
      // Soft delete by setting is_active to false
      const { error } = await supabase
        .from('rallies')
        .update({ 
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', rallyId)

      if (error) {
        console.error('Error deleting rally:', error)
        throw error
      }

      console.log('✅ Rally deleted')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rallyManagementKeys.rallies() })
    }
  })
}

// ============================================================================
// RALLY EVENTS HOOKS - CLEANED
// ============================================================================

export function useRallyEvents(rallyId?: string) {
  return useQuery({
    queryKey: rallyManagementKeys.events(rallyId!),
    queryFn: async (): Promise<RallyEvent[]> => {
      if (!rallyId) return []
      
      console.log('🔄 Loading rally events for:', rallyId)
      
      const { data: events, error } = await supabase
        .from('rally_events')
        .select(`
          *,
          event:game_events(name),
          rally_event_tracks(
            *,
            track:event_tracks(name, length_km, surface_type)
          )
        `)
        .eq('rally_id', rallyId)
        .eq('is_active', true)
        .order('event_order')

      if (error) {
        console.error('Error loading rally events:', error)
        throw error
      }

      const transformedEvents = events?.map(event => ({
        ...event,
        event_name: event.event?.name || 'Unknown Event',
        tracks: event.rally_event_tracks?.map((ret: any) => ({
          ...ret,
          track_name: ret.track?.name || 'Unknown Track',
          track_length: ret.track?.length_km,
          track_surface_type: ret.track?.surface_type
        })) || []
      })) || []

      console.log(`✅ Rally events loaded: ${transformedEvents.length}`)
      return transformedEvents
    },
    enabled: !!rallyId,
    staleTime: 5 * 60 * 1000,
  })
}

// ============================================================================
// RALLY CLASSES HOOKS - CLEANED
// ============================================================================

export function useRallyClasses(rallyId?: string) {
  return useQuery({
    queryKey: rallyManagementKeys.classes(rallyId!),
    queryFn: async (): Promise<RallyClass[]> => {
      if (!rallyId) return []
      
      console.log('🔄 Loading rally classes for:', rallyId)
      
      const { data: classes, error } = await supabase
        .from('rally_classes')
        .select(`
          *,
          class:game_classes(name)
        `)
        .eq('rally_id', rallyId)
        .eq('is_active', true)

      if (error) {
        console.error('Error loading rally classes:', error)
        throw error
      }

      const transformedClasses = classes?.map(cls => ({
        ...cls,
        class_name: cls.class?.name || 'Unknown Class'
      })) || []

      console.log(`✅ Rally classes loaded: ${transformedClasses.length}`)
      return transformedClasses
    },
    enabled: !!rallyId,
    staleTime: 5 * 60 * 1000,
  })
}