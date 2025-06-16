// src/hooks/usePublicRallies.ts - NEW: Public access to rally data with participant counts and events
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export interface PublicRally {
  id: string
  name: string
  description?: string
  competition_date: string
  registration_deadline: string
  max_participants?: number
  status: string
  game_name: string
  game_type_name: string
  registered_participants: number // FIXED: Always included
  total_events: number // FIXED: Always included  
  total_tracks: number // FIXED: Always included
  events: PublicRallyEvent[]
}

export interface PublicRallyEvent {
  event_id: string
  event_name: string
  event_order: number
  tracks: PublicRallyTrack[]
}

export interface PublicRallyTrack {
  id: string
  name: string
  surface_type?: string
  length_km?: number
  track_order: number
}

// Query Keys for public access
export const publicRallyKeys = {
  all: ['public_rallies'] as const,
  upcoming: (limit?: number) => [...publicRallyKeys.all, 'upcoming', limit] as const,
}

// ============================================================================
// PUBLIC UPCOMING RALLIES - Accessible without authentication
// ============================================================================

export function usePublicUpcomingRallies(limit = 10) {
  return useQuery({
    queryKey: publicRallyKeys.upcoming(limit),
    queryFn: async (): Promise<PublicRally[]> => {
      console.log('🔄 Loading upcoming rallies for public view...')
      
      // Get basic rally data - only active and visible rallies
      const { data: rallies, error } = await supabase
        .from('rallies')
        .select(`
          id,
          name,
          description,
          competition_date,
          registration_deadline,
          max_participants,
          status,
          game:games(name),
          game_type:game_types(name)
        `)
        .eq('is_active', true) // Only visible rallies
        .in('status', ['upcoming', 'registration_open', 'registration_closed']) // Only upcoming
        .order('competition_date', { ascending: true })
        .limit(limit)

      if (error) {
        console.error('Error loading public rallies:', error)
        throw error
      }

      if (!rallies || rallies.length === 0) {
        console.log('No upcoming rallies found for public view')
        return []
      }

      const rallyIds = rallies.map(rally => rally.id)

      // IMPORTANT: Get participant counts - NO authentication required for counting
      const { data: registrationCounts, error: registrationsError } = await supabase
        .from('rally_registrations')
        .select('rally_id')
        .in('rally_id', rallyIds)
        .in('status', ['registered', 'confirmed'])

      if (registrationsError) {
        console.error('Error loading registration counts:', registrationsError)
      }

      // Count participants per rally
      const participantCounts: Record<string, number> = {}
      rallyIds.forEach(rallyId => {
        participantCounts[rallyId] = 0
      })

      if (registrationCounts) {
        registrationCounts.forEach(reg => {
          participantCounts[reg.rally_id] = (participantCounts[reg.rally_id] || 0) + 1
        })
      }

      // IMPORTANT: Get rally events and tracks - NO authentication required
      const { data: rallyEvents, error: eventsError } = await supabase
        .from('rally_events')
        .select(`
          rally_id,
          event_order,
          event:game_events!inner(
            id,
            name
          ),
          rally_event_tracks(
            track_order,
            track:event_tracks!inner(
              id,
              name,
              surface_type,
              length_km
            )
          )
        `)
        .in('rally_id', rallyIds)
        .eq('is_active', true)
        .order('event_order', { ascending: true })

      if (eventsError) {
        console.error('Error loading rally events:', eventsError)
      }

      // Group events by rally ID
      const eventsByRally: Record<string, PublicRallyEvent[]> = {}
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

      // Transform rallies with complete data
      const transformedRallies: PublicRally[] = rallies.map((rally: any) => {
        const rallyEvents = eventsByRally[rally.id] || []
        const totalTracks = rallyEvents.reduce((sum, event) => sum + (event.tracks?.length || 0), 0)
        
        return {
          id: rally.id,
          name: rally.name,
          description: rally.description,
          competition_date: rally.competition_date,
          registration_deadline: rally.registration_deadline,
          max_participants: rally.max_participants,
          status: rally.status,
          game_name: rally.game?.name || 'Unknown Game',
          game_type_name: rally.game_type?.name || 'Unknown Type',
          registered_participants: participantCounts[rally.id] || 0, // FIXED: Always included
          total_events: rallyEvents.length, // FIXED: Always included
          total_tracks: totalTracks, // FIXED: Always included
          events: rallyEvents
        }
      })

      console.log(`✅ Public rallies loaded: ${transformedRallies.length} with participant counts and events`)
      console.log('📊 Sample rally data:', transformedRallies[0] ? {
        name: transformedRallies[0].name,
        participants: transformedRallies[0].registered_participants,
        events: transformedRallies[0].total_events,
        tracks: transformedRallies[0].total_tracks
      } : 'No rallies')
      
      return transformedRallies
    },
    staleTime: 2 * 60 * 1000, // 2 minutes - public data can be cached
    // No authentication required - this is public data
  })
}