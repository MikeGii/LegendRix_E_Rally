// src/hooks/useRallyManagement.ts - Fixed version with proper error handling
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
  points_multiplier?: number
  is_active: boolean
  created_at?: string
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
  points_weight?: number
  is_active: boolean
  created_at?: string
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
  entry_fee_modifier?: number
  is_active: boolean
  created_at?: string
  // Joined data
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

// Utility function to get current user
const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) throw error
  return user
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

// Create Rally Mutation - FIXED VERSION
export function useCreateRally() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (params: {
      rally: {
        name: string
        description?: string
        game_id: string
        game_type_id: string
        competition_date: string
        registration_deadline: string
        max_participants?: number
        entry_fee?: number
        prize_pool?: number
        rules?: string
        is_featured: boolean
        status: 'upcoming' | 'registration_open' | 'registration_closed' | 'active' | 'completed' | 'cancelled'
        is_active: boolean
      }
      selectedEvents: string[]
      selectedTracks: { [eventId: string]: string[] }
      selectedClasses: string[]
    }) => {
      const { rally, selectedEvents, selectedTracks, selectedClasses } = params
      
      console.log('🔄 Creating rally:', rally.name)

      // Get current user for created_by field
      const user = await getCurrentUser()
      if (!user) {
        throw new Error('User must be authenticated to create rallies')
      }

      // Step 1: Create the rally with proper data structure
      const rallyData = {
        ...rally,
        created_by: user.id,
        status: 'upcoming' as const,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { data: createdRally, error: rallyError } = await supabase
        .from('rallies')
        .insert([rallyData])
        .select()
        .single()

      if (rallyError) {
        console.error('❌ Rally creation failed:', rallyError)
        throw new Error(`Failed to create rally: ${rallyError.message}`)
      }

      console.log('✅ Rally created:', createdRally.id)

      // Step 2: Create rally events with proper error handling
      if (selectedEvents.length > 0) {
        try {
          console.log('🔄 Creating rally events...')
          
          const rallyEvents = selectedEvents.map((eventId, index) => ({
            rally_id: createdRally.id,
            event_id: eventId,
            event_order: index + 1,
            points_multiplier: 1.0,
            is_active: true,
            created_at: new Date().toISOString()
          }))

          const { data: createdEvents, error: eventsError } = await supabase
            .from('rally_events')
            .insert(rallyEvents)
            .select()

          if (eventsError) {
            console.error('❌ Rally events creation failed:', eventsError)
            // Try to clean up the rally if events fail
            await supabase.from('rallies').delete().eq('id', createdRally.id)
            throw new Error(`Failed to create rally events: ${eventsError.message}`)
          }

          console.log('✅ Rally events created:', createdEvents.length)

          // Step 3: Create rally event tracks
          if (Object.keys(selectedTracks).length > 0) {
            try {
              console.log('🔄 Creating rally event tracks...')
              
              const rallyEventTracks: Array<{
            rally_event_id: string
            track_id: string
            track_order: number
            points_weight: number
            is_active: boolean
            created_at: string
          }> = []
              for (const event of createdEvents) {
                const tracks = selectedTracks[event.event_id] || []
                tracks.forEach((trackId, trackIndex) => {
                  rallyEventTracks.push({
                    rally_event_id: event.id,
                    track_id: trackId,
                    track_order: trackIndex + 1,
                    points_weight: 1.0,
                    is_active: true,
                    created_at: new Date().toISOString()
                  })
                })
              }

              if (rallyEventTracks.length > 0) {
                const { error: tracksError } = await supabase
                  .from('rally_event_tracks')
                  .insert(rallyEventTracks)

                if (tracksError) {
                  console.error('❌ Rally tracks creation failed:', tracksError)
                  // Don't fail the entire operation for tracks
                  console.warn('Continuing without tracks due to error')
                }
              }

              console.log('✅ Rally event tracks created:', rallyEventTracks.length)
            } catch (trackError) {
              console.error('❌ Track creation error:', trackError)
              // Don't fail the entire operation for tracks
            }
          }
        } catch (eventError) {
          console.error('❌ Event creation error:', eventError)
          throw eventError
        }
      }

      // Step 4: Create rally classes with proper error handling
      if (selectedClasses.length > 0) {
        try {
          console.log('🔄 Creating rally classes...')
          
          const rallyClasses = selectedClasses.map(classId => ({
            rally_id: createdRally.id,
            class_id: classId,
            entry_fee_modifier: 1.0,
            is_active: true,
            created_at: new Date().toISOString()
          }))

          const { error: classesError } = await supabase
            .from('rally_classes')
            .insert(rallyClasses)

          if (classesError) {
            console.error('❌ Rally classes creation failed:', classesError)
            // Try to clean up if classes fail
            await supabase.from('rallies').delete().eq('id', createdRally.id)
            throw new Error(`Failed to create rally classes: ${classesError.message}`)
          }

          console.log('✅ Rally classes created:', rallyClasses.length)
        } catch (classError) {
          console.error('❌ Class creation error:', classError)
          throw classError
        }
      }

      return createdRally
    },
    onSuccess: () => {
      // Invalidate and refetch rallies
      queryClient.invalidateQueries({ queryKey: rallyKeys.rallies() })
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
    mutationFn: async (params: { id: string } & Partial<Rally>) => {
      const { id, ...updateData } = params
      
      console.log('🔄 Updating rally:', id)

      const { data: updatedRally, error } = await supabase
        .from('rallies')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('❌ Rally update failed:', error)
        throw new Error(`Failed to update rally: ${error.message}`)
      }

      console.log('✅ Rally updated:', updatedRally.name)
      return updatedRally
    },
    onSuccess: (data) => {
      // Invalidate and refetch specific rally and list
      queryClient.invalidateQueries({ queryKey: rallyKeys.rally(data.id) })
      queryClient.invalidateQueries({ queryKey: rallyKeys.rallies() })
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

      // Soft delete by setting is_active to false
      const { error } = await supabase
        .from('rallies')
        .update({ 
          is_active: false, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', rallyId)

      if (error) {
        console.error('❌ Rally deletion failed:', error)
        throw new Error(`Failed to delete rally: ${error.message}`)
      }

      console.log('✅ Rally deleted (soft delete):', rallyId)
    },
    onSuccess: () => {
      // Invalidate and refetch rallies
      queryClient.invalidateQueries({ queryKey: rallyKeys.rallies() })
    },
    onError: (error) => {
      console.error('❌ Rally deletion failed:', error)
    }
  })
}