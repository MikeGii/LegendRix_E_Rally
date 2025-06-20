// src/hooks/useOptimizedRallies.ts - CLEANED AND OPTIMIZED VERSION
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

// ============================================================================
// INTERFACES - CLEANED AND CONSOLIDATED
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
// SERVER-SIDE STATUS UPDATE (CORE FUNCTION)
// ============================================================================

export function useServerSideStatusUpdate() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async () => {
      console.log('🔄 Triggering server-side rally status update...')
      
      const response = await fetch('/api/rallies/update-statuses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Server status update failed')
      }

      const result = await response.json()
      console.log('✅ Server-side status update result:', result)
      return result
    },
    onSuccess: (data) => {
      console.log(`✅ Server updated ${data.updated} rally statuses`)
      // Invalidate all rally-related queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: rallyKeys.all })
      queryClient.invalidateQueries({ queryKey: ['public_rallies'] })
    },
    onError: (error) => {
      console.error('❌ Server-side status update failed:', error)
    }
  })
}

// ============================================================================
// AUTO-UPDATE WRAPPER
// ============================================================================

export function useAutoUpdateRallyStatuses() {
  const serverUpdate = useServerSideStatusUpdate()
  
  return useMutation({
    mutationFn: async () => {
      console.log('🔄 Starting rally status auto-update via server...')
      const result = await serverUpdate.mutateAsync()
      return result
    },
    onSuccess: (data) => {
      console.log(`✅ Auto-update complete: ${data.updated} rallies updated`)
    },
    onError: (error) => {
      console.error('❌ Auto-update failed:', error)
    }
  })
}

// ============================================================================
// 1. ALL RALLIES HOOK - MAIN RALLY LOADER
// ============================================================================

export function useAllRallies(limit = 20) {
  const serverUpdate = useServerSideStatusUpdate()
  
  return useQuery({
    queryKey: [...rallyKeys.all, 'all-rallies', limit],
    queryFn: async (): Promise<TransformedRally[]> => {
      console.log('🔄 Loading ALL rallies with server-side status update...')
      
      // Update statuses first
      try {
        await serverUpdate.mutateAsync()
      } catch (error) {
        console.warn('⚠️ Server status update failed, continuing:', error)
      }
      
      const { data: rallies, error } = await supabase
        .from('rallies')
        .select(`
          *,
          game:games(name),
          game_type:game_types(name)
        `)
        .eq('is_active', true)
        .order('competition_date', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('Error loading all rallies:', error)
        throw error
      }

      if (!rallies || rallies.length === 0) {
        console.log('No rallies found')
        return []
      }

      const rallyIds = rallies.map(rally => rally.id)

      // Get rally events
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
      }

      // Get participant counts
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
          registered_participants: participantCounts[rally.id] || 0
        }
      })

      console.log(`✅ ALL rallies loaded: ${transformedRallies.length} with real participant counts`)
      return transformedRallies
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // Auto-refetch every 5 minutes
  })
}

// ============================================================================
// 2. FEATURED RALLIES HOOK - FIXED MISSING FUNCTION
// ============================================================================

export function useFeaturedRallies(limit = 5) {
  const serverUpdate = useServerSideStatusUpdate()

  return useQuery({
    queryKey: rallyKeys.featured(limit),
    queryFn: async (): Promise<TransformedRally[]> => {
      console.log('🔄 Loading featured rallies...')
      
      // Update statuses first
      try {
        await serverUpdate.mutateAsync()
      } catch (error) {
        console.warn('⚠️ Server status update failed for featured rallies, continuing:', error)
      }

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

      // Get rally events and tracks for featured rallies (same logic as useAllRallies)
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
          registered_participants: 0 // Featured rallies don't need participant counts for display
        }
      })

      console.log(`✅ Featured rallies loaded: ${transformedRallies.length}`)
      return transformedRallies
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// ============================================================================
// 3. USER REGISTRATIONS HOOK
// ============================================================================

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

      console.log(`✅ User registrations loaded: ${transformedRegistrations.length}`)
      return transformedRegistrations
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// ============================================================================
// 4. ADMIN ALL RALLIES HOOK (FOR RALLY MANAGEMENT)
// ============================================================================

export function useAdminAllRallies(limit = 50) {
  const serverUpdate = useServerSideStatusUpdate()

  return useQuery({
    queryKey: [...rallyKeys.all, 'admin-all-rallies', limit],
    queryFn: async (): Promise<TransformedRally[]> => {
      console.log('🔄 Loading ALL rallies for admin (including inactive)...')

      // Auto-update statuses before loading admin rallies
      try {
        await serverUpdate.mutateAsync()
      } catch (error) {
        console.warn('⚠️ Server status update failed for admin rallies, continuing:', error)
      }
  
      const { data: rallies, error } = await supabase
        .from('rallies')
        .select(`
          *,
          game:games(name),
          game_type:game_types(name)
        `)
        // NO is_active filter - admin sees everything
        .order('competition_date', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('Error loading all rallies for admin:', error)
        throw error
      }

      if (!rallies || rallies.length === 0) {
        console.log('No rallies found for admin')
        return []
      }

      // Transform with minimal data for admin view (no need for events/tracks in management view)
      const transformedRallies = rallies.map(rally => ({
        ...rally,
        game_name: rally.game?.name || 'Unknown Game',
        game_type_name: rally.game_type?.name || 'Unknown Type',
        events: [],
        total_events: 0,
        total_tracks: 0,
        registered_participants: 0
      }))

      console.log(`✅ ALL admin rallies loaded: ${transformedRallies.length}`)
      return transformedRallies
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // Auto-refetch every 5 minutes
  })
}

// ============================================================================
// HELPER FUNCTIONS FOR STATUS CHECKING
// ============================================================================

export const getRallyStatus = (rally: { 
  competition_date: string, 
  registration_deadline: string, 
  status?: string 
}) => {
  const now = new Date()
  const competitionDate = new Date(rally.competition_date)
  const registrationDeadline = new Date(rally.registration_deadline)
  const oneHourAfterCompetition = new Date(competitionDate.getTime() + (1 * 60 * 60 * 1000))
  
  // Calculate actual status based on current time
  if (now > oneHourAfterCompetition) {
    return 'completed'
  } else if (now > competitionDate) {
    return 'active'
  } else if (now > registrationDeadline) {
    return 'registration_closed'
  } else {
    return 'registration_open'
  }
}

export const canRegisterToRally = (rally: { 
  competition_date: string, 
  registration_deadline: string, 
  status?: string 
}) => {
  const now = new Date()
  const registrationDeadline = new Date(rally.registration_deadline)
  const competitionDate = new Date(rally.competition_date)
  
  // Can register only if:
  // 1. Registration deadline hasn't passed
  // 2. Competition hasn't started yet
  return registrationDeadline > now && competitionDate > now
}

export const isRallyInPast = (rally: { 
  competition_date: string 
}) => {
  const now = new Date()
  const competitionDate = new Date(rally.competition_date)
  const oneHourAfterCompetition = new Date(competitionDate.getTime() + (1 * 60 * 1000))
  
  return now > oneHourAfterCompetition
}

export const getStatusDisplayText = (status: string) => {
  switch (status) {
    case 'registration_open': return 'Registreerimine avatud'
    case 'registration_closed': return 'Registreerimine suletud'
    case 'active': return 'Käimasolev'
    case 'completed': return 'Lõppenud'
    case 'upcoming': return 'Tulemas'
    case 'cancelled': return 'Tühistatud'
    default: return status
  }
}

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'registration_open': return 'bg-green-500/20 text-green-400 border-green-500/30'
    case 'registration_closed': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
    case 'active': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
    case 'completed': return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
    case 'upcoming': return 'bg-slate-500/20 text-slate-400 border-slate-500/30'
    case 'cancelled': return 'bg-red-500/20 text-red-400 border-red-500/30'
    default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30'
  }
}