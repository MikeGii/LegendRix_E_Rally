// src/hooks/useOptimizedRallies.ts - COMPLETE VERSION - All Original Features Preserved
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

// ============================================================================
// INTERFACES - COMPLETE AND COMPREHENSIVE
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
  // Computed properties - ALL INCLUDED
  game_name?: string
  game_type_name?: string
  registered_participants?: number
  total_events?: number
  total_tracks?: number
  events?: RallyEvent[]
  // Additional computed fields for UI
  can_register?: boolean
  is_past?: boolean
  real_time_status?: string
  
  // ADD THESE NEW FIELDS FOR STATUS MANAGEMENT
  display_status?: string        // Status to display in UI (real-time or inactive)
  needs_status_update?: boolean  // True if DB status differs from real-time status
  db_status?: string            // Original database status for comparison
  admin_note?: string           // Admin notes (e.g., "Deactivated", "Status needs update")
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
// QUERY KEYS - COMPREHENSIVE
// ============================================================================

export const rallyKeys = {
  all: ['rallies'] as const,
  lists: () => [...rallyKeys.all, 'list'] as const,
  list: (filters?: any) => [...rallyKeys.lists(), { filters }] as const,
  upcoming: (limit?: number) => [...rallyKeys.all, 'upcoming', limit] as const,
  featured: (limit?: number) => [...rallyKeys.all, 'featured', limit] as const,
  adminAll: (limit?: number) => [...rallyKeys.all, 'admin-all', limit] as const,
  userRegistrations: (userId?: string) => [...rallyKeys.all, 'user-registrations', userId] as const,
}

// ============================================================================
// SHARED HELPER FUNCTIONS - COMPREHENSIVE AND ROBUST
// ============================================================================

const loadParticipantCounts = async (rallyIds: string[]): Promise<Record<string, number>> => {
  if (rallyIds.length === 0) return {}

  try {
    const { data: registrationCounts, error: registrationsError } = await supabase
      .from('rally_registrations')
      .select('rally_id')
      .in('rally_id', rallyIds)
      .in('status', ['registered', 'confirmed'])

    if (registrationsError) {
      console.error('Error loading registration counts:', registrationsError)
      return {}
    }

    // Initialize all rallies with 0 count
    const participantCounts: Record<string, number> = {}
    rallyIds.forEach(rallyId => {
      participantCounts[rallyId] = 0
    })

    // Count participants per rally
    if (registrationCounts && registrationCounts.length > 0) {
      registrationCounts.forEach(reg => {
        participantCounts[reg.rally_id] = (participantCounts[reg.rally_id] || 0) + 1
      })
    }

    console.log('✅ Participant counts loaded:', participantCounts)
    return participantCounts
  } catch (error) {
    console.error('Error in loadParticipantCounts:', error)
    return {}
  }
}

const loadRallyEventsAndTracks = async (rallyIds: string[]) => {
  if (rallyIds.length === 0) return { eventsByRally: {}, totalTracksByRally: {} }

  try {
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
      return { eventsByRally: {}, totalTracksByRally: {} }
    }

    // Initialize all rallies
    const eventsByRally: Record<string, RallyEvent[]> = {}
    const totalTracksByRally: Record<string, number> = {}
    
    rallyIds.forEach(rallyId => {
      eventsByRally[rallyId] = []
      totalTracksByRally[rallyId] = 0
    })

    // Process rally events and tracks
    if (rallyEvents && rallyEvents.length > 0) {
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
              surface_type: ret.track.surface_type || '',
              length_km: ret.track.length_km || 0,
              track_order: ret.track_order || 0
            }))
            .sort((a, b) => a.track_order - b.track_order)

          eventsByRally[rallyEvent.rally_id].push({
            event_id: gameEvent.id,
            event_name: gameEvent.name,
            event_order: rallyEvent.event_order || 0,
            tracks: tracks
          })

          // Count tracks for this rally
          totalTracksByRally[rallyEvent.rally_id] += tracks.length
        }
      })

      // Sort events by order within each rally
      Object.keys(eventsByRally).forEach(rallyId => {
        eventsByRally[rallyId].sort((a, b) => a.event_order - b.event_order)
      })
    }

    console.log('✅ Events and tracks loaded:', {
      totalEvents: Object.values(eventsByRally).reduce((sum, events) => sum + events.length, 0),
      totalTracks: Object.values(totalTracksByRally).reduce((sum, count) => sum + count, 0)
    })

    return { eventsByRally, totalTracksByRally }
  } catch (error) {
    console.error('Error in loadRallyEventsAndTracks:', error)
    return { eventsByRally: {}, totalTracksByRally: {} }
  }
}

// ============================================================================
// HELPER FUNCTIONS FOR STATUS CHECKING - COMPREHENSIVE
// ============================================================================

export const getRallyStatus = (rally: { 
  competition_date: string, 
  registration_deadline: string, 
  status?: string 
}): string => {
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
}): boolean => {
  const now = new Date()
  const registrationDeadline = new Date(rally.registration_deadline)
  const competitionDate = new Date(rally.competition_date)
  
  // Can register only if both deadlines haven't passed
  return registrationDeadline > now && competitionDate > now
}

export const isRallyInPast = (rally: { 
  competition_date: string 
}): boolean => {
  const now = new Date()
  const competitionDate = new Date(rally.competition_date)
  const oneHourAfterCompetition = new Date(competitionDate.getTime() + (1 * 60 * 60 * 1000))
  
  return now > oneHourAfterCompetition
}

export const getStatusDisplayText = (status: string): string => {
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

export const getStatusColor = (status: string): string => {
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

// ============================================================================
// ENHANCED RALLY TRANSFORMATION FUNCTION
// ============================================================================

const transformRallyWithFullData = (
  rally: any, 
  participantCounts: Record<string, number>,
  eventsByRally: Record<string, RallyEvent[]>,
  totalTracksByRally: Record<string, number>
): TransformedRally => {
  const rallyEvents = eventsByRally[rally.id] || []
  const realTimeStatus = getRallyStatus(rally)
  const canRegister = canRegisterToRally(rally)
  const isPast = isRallyInPast(rally)
  
  return {
    ...rally,
    game_name: rally.game?.name || rally.games?.name || 'Unknown Game',
    game_type_name: rally.game_type?.name || rally.game_types?.name || 'Unknown Type',
    events: rallyEvents,
    total_events: rallyEvents.length,
    total_tracks: totalTracksByRally[rally.id] || 0,
    registered_participants: participantCounts[rally.id] || 0,
    // Additional computed fields
    can_register: canRegister,
    is_past: isPast,
    real_time_status: realTimeStatus
  }
}

// ============================================================================
// THROTTLED SERVER-SIDE STATUS UPDATE
// ============================================================================

let isUpdating = false
let lastUpdateTime = 0
const UPDATE_COOLDOWN = 30000 // 30 seconds

export function useServerSideStatusUpdate() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async () => {
      const now = Date.now()
      
      if (isUpdating) {
        console.log('⏳ Status update already in progress, skipping...')
        return { updated: 0, total: 0, message: 'Update already in progress' }
      }
      
      if (now - lastUpdateTime < UPDATE_COOLDOWN) {
        const remainingTime = Math.ceil((UPDATE_COOLDOWN - (now - lastUpdateTime)) / 1000)
        console.log(`⏳ Status update on cooldown for ${remainingTime} seconds`)
        return { updated: 0, total: 0, message: `Cooldown active: ${remainingTime}s remaining` }
      }
      
      isUpdating = true
      console.log('🔄 Triggering server-side rally status update...')
      
      try {
        const response = await fetch('/api/rallies/update-statuses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Server status update failed')
        }

        const result = await response.json()
        console.log('✅ Server-side status update result:', result)
        lastUpdateTime = now
        return result
      } finally {
        isUpdating = false
      }
    },
    onSuccess: (data) => {
      if (data.updated > 0) {
        console.log(`✅ Server updated ${data.updated} rally statuses`)
        queryClient.invalidateQueries({ queryKey: rallyKeys.all })
        queryClient.invalidateQueries({ queryKey: ['public_rallies'] })
      } else {
        console.log('ℹ️ No rally statuses needed updating')
      }
    },
    onError: (error) => {
      console.error('❌ Server-side status update failed:', error)
      isUpdating = false
    }
  })
}

// ============================================================================
// 1. ALL RALLIES HOOK - COMPLETE WITH ALL DATA
// ============================================================================

export function useAllRallies(limit = 20) {
  return useQuery({
    queryKey: rallyKeys.upcoming(limit),
    queryFn: async (): Promise<TransformedRally[]> => {
      console.log('🔄 Loading ALL rallies with complete data...')
      
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

      // Load all required data
      const [participantCounts, { eventsByRally, totalTracksByRally }] = await Promise.all([
        loadParticipantCounts(rallyIds),
        loadRallyEventsAndTracks(rallyIds)
      ])

      // Transform with all data
      const transformedRallies = rallies.map(rally => 
        transformRallyWithFullData(rally, participantCounts, eventsByRally, totalTracksByRally)
      )

      console.log(`✅ ALL rallies loaded: ${transformedRallies.length}`)
      console.log('📊 Sample data:', transformedRallies[0] ? {
        name: transformedRallies[0].name,
        participants: transformedRallies[0].registered_participants,
        events: transformedRallies[0].total_events,
        tracks: transformedRallies[0].total_tracks,
        status: transformedRallies[0].real_time_status
      } : 'No rallies')
      
      return transformedRallies
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: false,
  })
}

// ============================================================================
// 2. FEATURED RALLIES HOOK - COMPLETE WITH ALL DATA
// ============================================================================

export function useFeaturedRallies(limit = 3) {
  return useQuery({
    queryKey: rallyKeys.featured(limit),
    queryFn: async (): Promise<TransformedRally[]> => {
      console.log('🔄 Loading featured rallies with complete data...')
      
      const { data: rallies, error } = await supabase
        .from('rallies')
        .select(`
          *,
          game:games(name),
          game_type:game_types(name)
        `)
        .eq('is_featured', true)
        .eq('is_active', true)
        .in('status', ['upcoming', 'registration_open', 'registration_closed'])
        .order('competition_date', { ascending: true })
        .limit(limit)

      if (error) {
        console.error('Error loading featured rallies:', error)
        throw error
      }

      if (!rallies || rallies.length === 0) {
        console.log('No featured rallies found')
        return []
      }

      const rallyIds = rallies.map(rally => rally.id)

      // Load all required data for featured rallies
      const [participantCounts, { eventsByRally, totalTracksByRally }] = await Promise.all([
        loadParticipantCounts(rallyIds),
        loadRallyEventsAndTracks(rallyIds)
      ])

      // Transform with all data
      const transformedRallies = rallies.map(rally => 
        transformRallyWithFullData(rally, participantCounts, eventsByRally, totalTracksByRally)
      )

      console.log(`✅ Featured rallies loaded: ${transformedRallies.length}`)
      console.log('📊 Sample featured data:', transformedRallies[0] ? {
        name: transformedRallies[0].name,
        participants: transformedRallies[0].registered_participants,
        events: transformedRallies[0].total_events,
        tracks: transformedRallies[0].total_tracks,
        status: transformedRallies[0].real_time_status
      } : 'No featured rallies')
      
      return transformedRallies
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

// ============================================================================
// 3. ADMIN ALL RALLIES HOOK - COMPLETE WITH ALL DATA
// ============================================================================

export function useAdminAllRallies(limit = 50) {
  return useQuery({
    queryKey: rallyKeys.adminAll(limit),
    queryFn: async (): Promise<TransformedRally[]> => {
      console.log('🔄 Loading ALL admin rallies with complete data...')

      const { data: rallies, error } = await supabase
        .from('rallies')
        .select(`
          *,
          game:games(name),
          game_type:game_types(name)
        `)
        // Admin sees everything including inactive
        .order('competition_date', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('Error loading admin rallies:', error)
        throw error
      }

      if (!rallies || rallies.length === 0) {
        console.log('No rallies found for admin')
        return []
      }

      const rallyIds = rallies.map(rally => rally.id)

      // Load all required data for admin view
      const [participantCounts, { eventsByRally, totalTracksByRally }] = await Promise.all([
        loadParticipantCounts(rallyIds),
        loadRallyEventsAndTracks(rallyIds)
      ])

      // Transform with all data
      const transformedRallies = rallies.map(rally => 
        transformRallyWithFullData(rally, participantCounts, eventsByRally, totalTracksByRally)
      )

      console.log(`✅ Admin rallies loaded: ${transformedRallies.length}`)
      console.log('📊 Sample admin data:', transformedRallies[0] ? {
        name: transformedRallies[0].name,
        participants: transformedRallies[0].registered_participants,
        events: transformedRallies[0].total_events,
        tracks: transformedRallies[0].total_tracks,
        status: transformedRallies[0].real_time_status
      } : 'No admin rallies')
      
      return transformedRallies
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: false,
  })
}

// ============================================================================
// 4. USER RALLY REGISTRATIONS HOOK - COMPLETE
// ============================================================================

export function useUserRallyRegistrations() {
  return useQuery({
    queryKey: rallyKeys.userRegistrations(),
    queryFn: async (): Promise<UserRallyRegistration[]> => {
      console.log('🔄 Loading user rally registrations...')
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        console.log('No authenticated user found')
        return []
      }

      const { data: registrations, error } = await supabase
        .from('rally_registrations')
        .select(`
          *,
          rally:rallies(
            name,
            competition_date,
            status
          ),
          class:game_classes(name)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading user registrations:', error)
        throw error
      }

      const transformedRegistrations = (registrations || []).map(reg => ({
        ...reg,
        rally_name: (reg.rally as any)?.name || 'Unknown Rally',
        rally_competition_date: (reg.rally as any)?.competition_date,
        rally_status: (reg.rally as any)?.status,
        class_name: (reg.class as any)?.name || 'Unknown Class'
      }))

      console.log(`✅ User registrations loaded: ${transformedRegistrations.length}`)
      return transformedRegistrations
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

// ============================================================================
// AUTO-UPDATE WRAPPER
// ============================================================================

export function useAutoUpdateRallyStatuses() {
  const serverUpdate = useServerSideStatusUpdate()
  
  return useMutation({
    mutationFn: async () => {
      console.log('🔄 Starting rally status auto-update...')
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