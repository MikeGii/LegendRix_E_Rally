// src/hooks/useRallyManagement.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

// Types
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
  prize_pool?: number
  entry_fee?: number
  rules?: string
  is_featured: boolean
  is_active: boolean
  created_by?: string
  created_at: string
  updated_at: string
  // Joined data
  game_name?: string
  game_platform?: string
  game_type_name?: string
  duration_type?: string
  registered_participants?: number
  total_events?: number
  total_tracks?: number
}

export interface RallyEvent {
  id: string
  rally_id: string
  event_id: string
  event_order: number
  points_multiplier: number
  is_active: boolean
  created_at: string
  // Joined data
  event_name?: string
  event_surface_type?: string
  tracks?: RallyEventTrack[]
}

export interface RallyEventTrack {
  id: string
  rally_event_id: string
  track_id: string
  track_order: number
  points_weight: number
  is_active: boolean
  created_at: string
  // Joined data
  track_name?: string
  track_length?: number
  track_surface_type?: string
  stage_number?: number
}

export interface RallyClass {
  id: string
  rally_id: string
  class_id: string
  max_participants?: number
  entry_fee_modifier: number
  is_active: boolean
  created_at: string
  // Joined data
  class_name?: string
}

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
}

// Query Keys
export const rallyKeys = {
  all: ['rallies'] as const,
  rallies: () => [...rallyKeys.all, 'list'] as const,
  rally: (id: string) => [...rallyKeys.all, 'detail', id] as const,
  events: (rallyId: string) => [...rallyKeys.all, 'events', rallyId] as const,
  classes: (rallyId: string) => [...rallyKeys.all, 'classes', rallyId] as const,
  registrations: (rallyId: string) => [...rallyKeys.all, 'registrations', rallyId] as const,
}

// Rallies Hook
export function useRallies() {
  return useQuery({
    queryKey: rallyKeys.rallies(),
    queryFn: async (): Promise<Rally[]> => {
      console.log('🔄 Loading rallies...')
      
      const { data: rallies, error } = await supabase
        .from('rally_details')
        .select('*')
        .order('competition_date', { ascending: false })

      if (error) {
        console.error('Error loading rallies:', error)
        throw error
      }

      console.log(`✅ Rallies loaded: ${rallies?.length || 0}`)
      return rallies || []
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

// Single Rally Hook
export function useRally(rallyId: string) {
  return useQuery({
    queryKey: rallyKeys.rally(rallyId),
    queryFn: async (): Promise<Rally | null> => {
      console.log('🔄 Loading rally:', rallyId)
      
      const { data: rally, error } = await supabase
        .from('rally_details')
        .select('*')
        .eq('id', rallyId)
        .single()

      if (error) {
        console.error('Error loading rally:', error)
        throw error
      }

      console.log('✅ Rally loaded:', rally?.name)
      return rally
    },
    enabled: !!rallyId,
    staleTime: 5 * 60 * 1000,
  })
}

// Rally Events Hook
export function useRallyEvents(rallyId: string) {
  return useQuery({
    queryKey: rallyKeys.events(rallyId),
    queryFn: async (): Promise<RallyEvent[]> => {
      if (!rallyId) return []
      
      console.log('🔄 Loading rally events for:', rallyId)
      
      const { data: events, error } = await supabase
        .from('rally_events')
        .select(`
          *,
          event:game_events(name, surface_type),
          tracks:rally_event_tracks(
            *,
            track:event_tracks(name, length_km, surface_type, stage_number)
          )
        `)
        .eq('rally_id', rallyId)
        .eq('is_active', true)
        .order('event_order')

      if (error) {
        console.error('Error loading rally events:', error)
        throw error
      }

      console.log(`✅ Rally events loaded: ${events?.length || 0}`)
      return events?.map(event => ({
        ...event,
        event_name: event.event?.name,
        event_surface_type: event.event?.surface_type,
        tracks: event.tracks?.map((track: any) => ({
          ...track,
          track_name: track.track?.name,
          track_length: track.track?.length_km,
          track_surface_type: track.track?.surface_type,
          stage_number: track.track?.stage_number,
        }))
      })) || []
    },
    enabled: !!rallyId,
    staleTime: 5 * 60 * 1000,
  })
}

// Rally Classes Hook
export function useRallyClasses(rallyId: string) {
  return useQuery({
    queryKey: rallyKeys.classes(rallyId),
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

      console.log(`✅ Rally classes loaded: ${classes?.length || 0}`)
      return classes?.map(rallyClass => ({
        ...rallyClass,
        class_name: rallyClass.class?.name,
      })) || []
    },
    enabled: !!rallyId,
    staleTime: 5 * 60 * 1000,
  })
}

// Create Rally Mutation
export function useCreateRally() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (rallyData: {
      rally: Partial<Rally>,
      selectedEvents: string[],
      selectedTracks: { [eventId: string]: string[] },
      selectedClasses: string[]
    }) => {
      console.log('🔄 Creating rally:', rallyData.rally.name)
      
      // Create the main rally
      const { data: rally, error: rallyError } = await supabase
        .from('rallies')
        .insert([{
          ...rallyData.rally,
          created_by: (await supabase.auth.getUser()).data.user?.id
        }])
        .select()
        .single()

      if (rallyError) {
        console.error('Error creating rally:', rallyError)
        throw rallyError
      }

      // Create rally events
      if (rallyData.selectedEvents.length > 0) {
        const rallyEvents = rallyData.selectedEvents.map((eventId, index) => ({
          rally_id: rally.id,
          event_id: eventId,
          event_order: index + 1
        }))

        const { data: createdEvents, error: eventsError } = await supabase
          .from('rally_events')
          .insert(rallyEvents)
          .select()

        if (eventsError) {
          console.error('Error creating rally events:', eventsError)
          throw eventsError
        }

        // Create rally event tracks
        for (const createdEvent of createdEvents) {
          const eventTracks = rallyData.selectedTracks[createdEvent.event_id] || []
          if (eventTracks.length > 0) {
            const rallyEventTracks = eventTracks.map((trackId, index) => ({
              rally_event_id: createdEvent.id,
              track_id: trackId,
              track_order: index + 1
            }))

            const { error: tracksError } = await supabase
              .from('rally_event_tracks')
              .insert(rallyEventTracks)

            if (tracksError) {
              console.error('Error creating rally tracks:', tracksError)
              throw tracksError
            }
          }
        }
      }

      // Create rally classes
      if (rallyData.selectedClasses.length > 0) {
        const rallyClasses = rallyData.selectedClasses.map(classId => ({
          rally_id: rally.id,
          class_id: classId
        }))

        const { error: classesError } = await supabase
          .from('rally_classes')
          .insert(rallyClasses)

        if (classesError) {
          console.error('Error creating rally classes:', classesError)
          throw classesError
        }
      }

      console.log('✅ Rally created successfully:', rally.name)
      return rally
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rallyKeys.all })
    },
    onError: (error) => {
      console.error('❌ Rally creation failed:', error)
    }
  })
}

// Update Rally Mutation
export function useUpdateRally() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Rally> & { id: string }) => {
      console.log('🔄 Updating rally:', id)
      
      const { data, error } = await supabase
        .from('rallies')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Error updating rally:', error)
        throw error
      }

      console.log('✅ Rally updated successfully:', data.name)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rallyKeys.all })
    },
    onError: (error) => {
      console.error('❌ Rally update failed:', error)
    }
  })
}

// Delete Rally Mutation
export function useDeleteRally() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (rallyId: string) => {
      console.log('🔄 Deleting rally:', rallyId)
      
      const { error } = await supabase
        .from('rallies')
        .delete()
        .eq('id', rallyId)

      if (error) {
        console.error('Error deleting rally:', error)
        throw error
      }

      console.log('✅ Rally deleted successfully')
      return rallyId
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rallyKeys.all })
    },
    onError: (error) => {
      console.error('❌ Rally deletion failed:', error)
    }
  })
}