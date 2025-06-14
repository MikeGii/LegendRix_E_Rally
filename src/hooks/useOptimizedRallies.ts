// src/hooks/useOptimizedRallies.ts - CLEANED VERSION
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

// ============================================================================
// CLEANED INTERFACES
// ============================================================================

export interface TransformedRally {
  id: string
  name: string
  description: string
  game_id: string
  game_type_id: string
  competition_date: string
  registration_deadline: string
  max_participants: number
  status: 'upcoming' | 'registration_open' | 'registration_closed' | 'active' | 'completed' | 'cancelled'
  rules: string
  is_featured: boolean
  is_active: boolean
  created_by: string
  created_at: string
  updated_at: string
  // Computed properties
  game_name?: string
  game_type_name?: string
  registered_participants?: number
  total_events?: number
  total_tracks?: number
  events?: RallyEvent[]
}

export interface RealRally {
  id: string
  name: string
  description: string
  game_id: string
  game_type_id: string
  competition_date: string
  registration_deadline: string
  max_participants: number
  status: string
  rules: string
  is_featured: boolean
  is_active: boolean
  created_by: string
  created_at: string
  updated_at: string
  rally_id: string
  rally_game_id: string
  rally_type_id: string
  rally_date: string
  registration_ending_date: string
  optional_notes: string
  type_name: string
  creator_name: string
  game_name?: string
  game_type_name?: string
  events: RallyEvent[]
  registered_participants?: number  // Add this
  total_events?: number            // Add this  
  total_tracks?: number            // Add this
}

export interface RallyEvent {
  event_id: string
  event_name: string
  event_order: number
  tracks: RallyTrack[]
}

export interface RallyTrack {
  id: string
  name: string
  surface_type: string
  length_km: number
  track_order: number
}

export interface UserRallyRegistration {
  id: string
  rally_id: string
  user_id: string
  class_id: string
  registration_date: string
  status: 'registered' | 'confirmed' | 'cancelled' | 'disqualified' | 'completed'
  created_at: string
  updated_at: string
  // Joined data
  rally_name?: string
  class_name?: string
  rally_competition_date?: string
  rally_status?: string
}

// ============================================================================
// QUERY KEYS
// ============================================================================

export const rallyKeys = {
  all: ['rallies'] as const,
  lists: () => [...rallyKeys.all, 'list'] as const,
  list: (filters?: any) => [...rallyKeys.lists(), { filters }] as const,
  upcoming: (limit?: number) => [...rallyKeys.all, 'upcoming', limit] as const,
  featured: (limit?: number) => [...rallyKeys.all, 'featured', limit] as const,
  registrations: () => [...rallyKeys.all, 'registrations'] as const,
  userRegistrations: (userId: string) => [...rallyKeys.registrations(), 'user', userId] as const,
}

// ============================================================================
// UPCOMING RALLIES HOOK - CLEANED
// ============================================================================

export function useUpcomingRallies(limit = 10) {
  return useQuery({
    queryKey: rallyKeys.upcoming(limit),
    queryFn: async (): Promise<TransformedRally[]> => {
      console.log('🔄 Loading upcoming rallies...')
      
      const { data: rallies, error } = await supabase
        .from('rallies')
        .select(`
          *,
          game:games(name),
          game_type:game_types(name)
        `)
        .eq('is_active', true)
        .in('status', ['upcoming', 'registration_open', 'registration_closed'])
        .order('competition_date', { ascending: true })
        .limit(limit)

      if (error) {
        console.error('Error loading upcoming rallies:', error)
        throw error
      }

      if (!rallies || rallies.length === 0) {
        console.log('No upcoming rallies found')
        return []
      }

      // Get rally events for all upcoming rallies
      const rallyIds = rallies.map(rally => rally.id)
      
      const { data: rallyEvents, error: eventsError } = await supabase
        .from('rally_events')
        .select(`
          *,
          event:game_events(*),
          rally_event_tracks(
            *,
            track:event_tracks(*)
          )
        `)
        .in('rally_id', rallyIds)
        .eq('is_active', true)
        .order('event_order', { ascending: true })

      if (eventsError) {
        console.error('Error loading rally events:', eventsError)
        // Don't throw error, just continue without events data
      }

      // Group events by rally ID
      const eventsByRally: Record<string, RallyEvent[]> = {}
      rallyIds.forEach(rallyId => {
        eventsByRally[rallyId] = []
      })

      if (rallyEvents) {
        rallyEvents.forEach((rallyEvent: any) => {
          const gameEvent = Array.isArray(rallyEvent.event) ? 
            rallyEvent.event[0] : rallyEvent.event
          
          if (gameEvent && gameEvent.id && gameEvent.name) {
            const eventTracks = rallyEvent.rally_event_tracks || []
            const tracks = eventTracks
              .filter((ret: any) => ret.track && ret.track.id)
              .map((ret: any) => ({
                id: ret.track.id,
                name: ret.track.name,
                surface_type: ret.track.surface_type,
                length_km: ret.track.length_km,
                track_order: ret.track_order
              }))

            eventsByRally[rallyEvent.rally_id].push({
              event_id: gameEvent.id,
              event_name: gameEvent.name,
              event_order: rallyEvent.event_order,
              tracks: tracks
            })
          }
        })
      }

      // Transform data
      const transformedRallies = rallies.map(rally => {
        const rallyEvents = eventsByRally[rally.id] || []
        const totalTracks = rallyEvents.reduce((sum, event) => sum + (event.tracks?.length || 0), 0)
        
        return {
          ...rally,
          game_name: rally.game?.name || 'Unknown Game',
          game_type_name: rally.game_type?.name || 'Unknown Type',
          events: rallyEvents,
          total_events: rallyEvents.length,
          total_tracks: totalTracks,
          registered_participants: 0
        }
      })

      console.log(`✅ Upcoming rallies loaded: ${transformedRallies.length} with events`)
      return transformedRallies
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// ============================================================================
// FEATURED RALLIES HOOK - CLEANED
// ============================================================================

export function useFeaturedRallies(limit = 5) {
  return useQuery({
    queryKey: rallyKeys.featured(limit),
    queryFn: async (): Promise<RealRally[]> => {
      console.log('🔄 Loading featured rallies with events and tracks...')
      
      const { data: rallies, error: ralliesError } = await supabase
        .from('rallies')
        .select(`
          *,
          game:games(name),
          game_type:game_types(name)
        `)
        .eq('is_featured', true)
        .eq('is_active', true)
        .order('competition_date', { ascending: true })
        .limit(limit)

      if (ralliesError) {
        console.error('Error loading featured rallies:', ralliesError)
        throw ralliesError
      }

      if (!rallies || rallies.length === 0) {
        console.log('No featured rallies found')
        return []
      }

      // Get rally events and tracks for all featured rallies
      const rallyIds = rallies.map(rally => rally.id)
      
      const { data: rallyEvents, error: eventsError } = await supabase
        .from('rally_events')
        .select(`
          *,
          event:game_events(*),
          rally_event_tracks(
            *,
            track:event_tracks(*)
          )
        `)
        .in('rally_id', rallyIds)
        .eq('is_active', true)
        .order('event_order', { ascending: true })

      if (eventsError) {
        console.error('Error loading rally events:', eventsError)
        throw eventsError
      }

      // Group events by rally ID
      const eventsByRally: Record<string, RallyEvent[]> = {}
      rallyIds.forEach(rallyId => {
        eventsByRally[rallyId] = []
      })

      if (rallyEvents) {
        rallyEvents.forEach((rallyEvent: any) => {
          const gameEvent = Array.isArray(rallyEvent.event) ? 
            rallyEvent.event[0] : rallyEvent.event
          
          if (gameEvent && gameEvent.id && gameEvent.name) {
            const eventTracks = rallyEvent.rally_event_tracks || []
            const tracks = eventTracks
              .filter((ret: any) => ret.track && ret.track.id)
              .map((ret: any) => ({
                id: ret.track.id,
                name: ret.track.name,
                surface_type: ret.track.surface_type,
                length_km: ret.track.length_km,
                track_order: ret.track_order
              }))

            eventsByRally[rallyEvent.rally_id].push({
              event_id: gameEvent.id,
              event_name: gameEvent.name,
              event_order: rallyEvent.event_order,
              tracks: tracks
            })
          }
        })
      }

      const transformedRallies: RealRally[] = rallies.map(rally => ({
        ...rally,
        rally_id: rally.id,
        rally_game_id: rally.game_id || '',
        rally_type_id: rally.game_type_id || '',
        rally_date: rally.competition_date,
        registration_ending_date: rally.registration_deadline,
        optional_notes: rally.description || '',
        type_name: rally.game_type?.name || 'Competition',
        creator_name: 'Rally Admin',
        game_name: rally.game?.name || 'Unknown Game',
        game_type_name: rally.game_type?.name || 'Unknown Type',
        events: eventsByRally[rally.id] || []
      }))

      console.log(`✅ Featured rallies loaded: ${transformedRallies.length} with events and tracks`)
      return transformedRallies
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// ============================================================================
// USER RALLY REGISTRATIONS HOOK - CLEANED
// ============================================================================

export function useUserRallyRegistrations() {
  return useQuery({
    queryKey: rallyKeys.registrations(),
    queryFn: async (): Promise<UserRallyRegistration[]> => {
      console.log('🔄 Loading ALL user rally registrations...')
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        console.log('No user found')
        return []
      }

      const { data: registrations, error } = await supabase
        .from('rally_registrations')
        .select(`
          *,
          rally:rallies!inner(
            name,
            competition_date,
            registration_deadline,
            status
          ),
          class:game_classes(name)
        `)
        .eq('user_id', user.id)
        .order('registration_date', { ascending: false })

      if (error) {
        console.error('Error loading user registrations:', error)
        throw error
      }

      const transformedRegistrations: UserRallyRegistration[] = (registrations || []).map(reg => ({
        ...reg,
        rally_name: reg.rally?.name || 'Unknown Rally',
        class_name: reg.class?.name || 'Unknown Class',
        rally_competition_date: reg.rally?.competition_date,
        rally_status: reg.rally?.status
      }))

      console.log(`✅ ALL user registrations loaded: ${transformedRegistrations.length}`)
      return transformedRegistrations
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}