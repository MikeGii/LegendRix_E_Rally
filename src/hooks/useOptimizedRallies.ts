// src/hooks/useOptimizedRallies.ts - FIXED VERSION with Events Data
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export interface RealRally {
  id: string
  name: string
  description?: string
  game_name: string
  game_platform?: string
  game_type_name: string
  competition_date: string
  registration_deadline: string
  max_participants?: number
  status: string
  prize_pool?: number
  entry_fee?: number
  rules?: string
  is_featured: boolean
  registered_participants?: number
  total_events?: number
  total_tracks?: number
  // For compatibility with existing components
  rally_id: string
  rally_game_id: string
  rally_type_id: string
  rally_date: string
  registration_ending_date: string
  optional_notes?: string
  created_by: string
  created_at: string
  updated_at: string
  type_name: string
  events: Array<{
    event_id: string
    event_name: string
    event_order: number
    country?: string
    surface_type?: string
  }>
  creator_name?: string
}

// Add TransformedRally as an alias for backward compatibility
export type TransformedRally = RealRally

export interface UserRallyRegistration {
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
  class_name?: string
  rally_name?: string
}

export const rallyKeys = {
  all: ['user_rallies'] as const,
  upcoming: () => [...rallyKeys.all, 'upcoming'] as const,
  registrations: () => [...rallyKeys.all, 'registrations'] as const,
  featured: () => [...rallyKeys.all, 'featured'] as const,
}

// Updated hook to fetch real rally data WITH EVENTS
export function useUpcomingRallies(limit: number = 10) {
  return useQuery({
    queryKey: [...rallyKeys.upcoming(), { limit }],
    queryFn: async (): Promise<RealRally[]> => {
      console.log('🔄 Loading upcoming rallies with events...')
      
      // First get the rallies
      const { data: rallies, error } = await supabase
        .from('rally_details')
        .select('*')
        .eq('is_active', true)
        .in('status', ['upcoming', 'registration_open'])
        .gte('competition_date', new Date().toISOString())
        .order('competition_date', { ascending: true })
        .limit(limit)

      if (error) {
        console.error('Error loading upcoming rallies:', error)
        throw error
      }

      if (!rallies || rallies.length === 0) {
        return []
      }

      // Get rally IDs for event lookup
      const rallyIds = rallies.map(r => r.id)

      // Load events for all rallies
      const { data: rallyEvents, error: eventsError } = await supabase
        .from('rally_events')
        .select(`
          rally_id,
          event_order,
          event:game_events(
            id,
            name,
            country,
            surface_type
          )
        `)
        .in('rally_id', rallyIds)
        .eq('is_active', true)
        .order('event_order')

      if (eventsError) {
        console.error('Error loading rally events:', eventsError)
        // Don't fail the whole query, just return rallies without events
      }

      // Group events by rally_id
      const eventsByRally: { [rallyId: string]: any[] } = {}
      if (rallyEvents) {
        rallyEvents.forEach(rallyEvent => {
          if (!eventsByRally[rallyEvent.rally_id]) {
            eventsByRally[rallyEvent.rally_id] = []
          }
          if (rallyEvent.event) {
            eventsByRally[rallyEvent.rally_id].push({
              event_id: rallyEvent.event.id,
              event_name: rallyEvent.event.name,
              event_order: rallyEvent.event_order,
              country: rallyEvent.event.country,
              surface_type: rallyEvent.event.surface_type
            })
          }
        })
      }

      // Transform rallies with events
      const transformedRallies: RealRally[] = rallies.map(rally => ({
        ...rally,
        // Map to existing interface for compatibility
        rally_id: rally.id,
        rally_game_id: rally.game_id || '',
        rally_type_id: rally.game_type_id || '',
        rally_date: rally.competition_date,
        registration_ending_date: rally.registration_deadline,
        optional_notes: rally.description,
        type_name: rally.game_type_name || 'Competition',
        events: eventsByRally[rally.id] || [], // NOW WE HAVE ACTUAL EVENTS!
        creator_name: 'Rally Admin'
      }))

      console.log(`✅ Upcoming rallies loaded: ${transformedRallies.length} with events`)
      transformedRallies.forEach(rally => {
        console.log(`  - ${rally.name}: ${rally.events.length} events`)
        rally.events.forEach(event => {
          console.log(`    - ${event.event_name}`)
        })
      })
      
      return transformedRallies
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - rally data changes less frequently
  })
}

// Hook to get featured rallies - ALSO FIXED
export function useFeaturedRallies(limit: number = 3) {
  return useQuery({
    queryKey: [...rallyKeys.featured(), { limit }],
    queryFn: async (): Promise<RealRally[]> => {
      console.log('🔄 Loading featured rallies with events...')
      
      // First get the rallies
      const { data: rallies, error } = await supabase
        .from('rally_details')
        .select('*')
        .eq('is_active', true)
        .eq('is_featured', true)
        .in('status', ['upcoming', 'registration_open'])
        .gte('competition_date', new Date().toISOString())
        .order('competition_date', { ascending: true })
        .limit(limit)

      if (error) {
        console.error('Error loading featured rallies:', error)
        throw error
      }

      if (!rallies || rallies.length === 0) {
        return []
      }

      // Get rally IDs for event lookup
      const rallyIds = rallies.map(r => r.id)

      // Load events for all rallies
      const { data: rallyEvents, error: eventsError } = await supabase
        .from('rally_events')
        .select(`
          rally_id,
          event_order,
          event:game_events(
            id,
            name,
            country,
            surface_type
          )
        `)
        .in('rally_id', rallyIds)
        .eq('is_active', true)
        .order('event_order')

      if (eventsError) {
        console.error('Error loading rally events:', eventsError)
      }

      // Group events by rally_id
      const eventsByRally: { [rallyId: string]: any[] } = {}
      if (rallyEvents) {
        rallyEvents.forEach(rallyEvent => {
          if (!eventsByRally[rallyEvent.rally_id]) {
            eventsByRally[rallyEvent.rally_id] = []
          }
          if (rallyEvent.event) {
            eventsByRally[rallyEvent.rally_id].push({
              event_id: rallyEvent.event.id,
              event_name: rallyEvent.event.name,
              event_order: rallyEvent.event_order,
              country: rallyEvent.event.country,
              surface_type: rallyEvent.event.surface_type
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
        optional_notes: rally.description,
        type_name: rally.game_type_name || 'Competition',
        events: eventsByRally[rally.id] || [], // Events included here too
        creator_name: 'Rally Admin'
      }))

      console.log(`✅ Featured rallies loaded: ${transformedRallies.length} with events`)
      return transformedRallies
    },
    staleTime: 5 * 60 * 1000,
  })
}

// Hook to get user's rally registrations
export function useUserRallyRegistrations() {
  return useQuery({
    queryKey: rallyKeys.registrations(),
    queryFn: async (): Promise<UserRallyRegistration[]> => {
      console.log('🔄 Loading user rally registrations...')
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        console.log('No user found')
        return []
      }

      const { data: registrations, error } = await supabase
        .from('rally_registrations')
        .select(`
          *,
          rally:rallies(name),
          class:game_classes(name)
        `)
        .eq('user_id', user.id)
        .order('registration_date', { ascending: false })

      if (error) {
        console.error('Error loading user registrations:', error)
        throw error
      }

      const transformedRegistrations: UserRallyRegistration[] = registrations?.map(reg => ({
        ...reg,
        rally_name: reg.rally?.name,
        class_name: reg.class?.name,
      })) || []

      console.log(`✅ User registrations loaded: ${transformedRegistrations.length}`)
      return transformedRegistrations
    },
    staleTime: 2 * 60 * 1000,
  })
}