// src/hooks/useOptimizedRallies.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
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
  registered_participants?: number
  total_events?: number
  total_tracks?: number
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
// ALL RALLIES HOOK - NEW - Includes past and future rallies
// ============================================================================

export function useAllRallies(limit = 20) {
  return useQuery({
    queryKey: [...rallyKeys.all, 'all-rallies', limit],
    queryFn: async (): Promise<TransformedRally[]> => {
      console.log('🔄 Loading ALL rallies (including past ones) with participant counts...')
      
      // First, get the basic rally data
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

      // Get rally events (same logic as useUpcomingRallies)
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

      // FIXED: Get actual participant counts from rally_registrations
      const { data: registrationCounts, error: registrationsError } = await supabase
        .from('rally_registrations')
        .select('rally_id')
        .in('rally_id', rallyIds)
        .in('status', ['registered', 'confirmed']) // Only count active registrations

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

      // Group events by rally ID (same logic as useUpcomingRallies)
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

      // FIXED: Transform data with real participant counts
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
          registered_participants: participantCounts[rally.id] || 0 // FIXED: Real count!
        }
      })

      console.log(`✅ ALL rallies loaded: ${transformedRallies.length} with real participant counts`)
      return transformedRallies
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

// ============================================================================
// UPCOMING RALLIES HOOK - ORIGINAL (only upcoming/open rallies)
// ============================================================================

export function useUpcomingRallies(limit = 10) {
  return useQuery({
    queryKey: rallyKeys.upcoming(limit),
    queryFn: async (): Promise<TransformedRally[]> => {
      console.log('🔄 Loading upcoming rallies for users...')
      
      const { data: rallies, error } = await supabase
        .from('rallies')
        .select(`
          *,
          game:games(name),
          game_type:game_types(name)
        `)
        .eq('is_active', true) // Users only see active rallies
        .in('status', ['upcoming', 'registration_open', 'registration_closed']) // Only upcoming statuses
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

      // Same transformation logic as before...
      const rallyIds = rallies.map(rally => rally.id)

      // Get participant counts
      const { data: registrationCounts, error: registrationsError } = await supabase
        .from('rally_registrations')
        .select('rally_id')
        .in('rally_id', rallyIds)
        .in('status', ['registered', 'confirmed'])

      if (registrationsError) {
        console.error('Error loading registration counts:', registrationsError)
      }

      const participantCounts: Record<string, number> = {}
      rallyIds.forEach(rallyId => {
        participantCounts[rallyId] = 0
      })

      if (registrationCounts) {
        registrationCounts.forEach(reg => {
          participantCounts[reg.rally_id] = (participantCounts[reg.rally_id] || 0) + 1
        })
      }

      const transformedRallies: TransformedRally[] = rallies.map((rally: any) => ({
        ...rally,
        game_name: rally.game?.name || 'Unknown Game',
        game_type_name: rally.game_type?.name || 'Unknown Type',
        registered_participants: participantCounts[rally.id] || 0
      }))

      console.log(`✅ Loaded ${transformedRallies.length} upcoming rallies for users`)
      return transformedRallies
    },
    staleTime: 2 * 60 * 1000,
  })
}

// ============================================================================
// FEATURED RALLIES HOOK - CLEANED
// ============================================================================

export function useFeaturedRallies(limit = 5) {
  const autoUpdate = useAutoUpdateRallyStatuses()

  return useQuery({
    queryKey: rallyKeys.featured(limit),
    queryFn: async (): Promise<RealRally[]> => {
      console.log('🔄 Loading featured rallies with events and tracks...')
      
      try {
        console.log('🔄 Running auto-update for featured rallies...')
        await autoUpdate.mutateAsync()
      } catch (error) {
        console.warn('Status update failed for featured rallies, continuing:', error)
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

export function useAutoUpdateRallyStatuses() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async () => {
      console.log('🔄 Starting rally status auto-update...')
      const currentTime = new Date().toISOString()
      const now = new Date()
      
      // FIXED: Get ALL rallies, not just active ones
      const { data: rallies, error: fetchError } = await supabase
        .from('rallies')
        .select('id, competition_date, registration_deadline, status, is_active')
        // REMOVED: .eq('is_active', true) - now includes all rallies
      
      if (fetchError) throw fetchError
      if (!rallies) return { updated: 0 }
      
      let updatedCount = 0
      
      for (const rally of rallies) {
        const competitionDate = new Date(rally.competition_date)
        const registrationDeadline = new Date(rally.registration_deadline)
        // FIXED: Changed to 1 hour as per requirements
        const oneHourAfterCompetition = new Date(competitionDate.getTime() + (1 * 60 * 60 * 1000))
        
        let newStatus = rally.status
        
        // Determine correct status based on dates
        if (now > oneHourAfterCompetition) {
          // Rally finished more than 1 hour ago -> move to past (completed)
          newStatus = 'completed'
        } else if (now > competitionDate) {
          // Rally is currently happening
          newStatus = 'active'
        } else if (now > registrationDeadline) {
          // Registration deadline passed but rally hasn't started
          newStatus = 'registration_closed'
        } else {
          // Registration is still open
          newStatus = 'registration_open'
        }
        
        // CRITICAL FIX: Only update status, NEVER set is_active = false automatically
        if (newStatus !== rally.status) {
          console.log(`📅 Updating rally ${rally.id} status: ${rally.status} → ${newStatus}`)
          
          const { error: updateError } = await supabase
            .from('rallies')
            .update({ 
              status: newStatus,
              updated_at: currentTime
              // REMOVED: Any is_active updates
            })
            .eq('id', rally.id)
          
          if (updateError) {
            console.error(`Error updating rally ${rally.id}:`, updateError)
          } else {
            updatedCount++
          }
        }
      }
      
      console.log(`✅ Rally status update complete. Updated ${updatedCount} rallies.`)
      return { updated: updatedCount }
    },
    onSuccess: () => {
      // Invalidate all rally-related queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: rallyKeys.all })
      queryClient.invalidateQueries({ queryKey: ['public_rallies'] })
    }
  })
}

// Helper hook to run auto-update when loading rallies
export function useAllRalliesWithAutoUpdate(limit = 20) {
  const autoUpdate = useAutoUpdateRallyStatuses()
  
  return useQuery({
    queryKey: [...rallyKeys.all, 'all-rallies-auto-update', limit],
    queryFn: async (): Promise<TransformedRally[]> => {
      console.log('🔄 Loading ALL rallies with auto status update...')
      
      // First, update statuses
      try {
        await autoUpdate.mutateAsync()
      } catch (error) {
        console.warn('Status update failed, continuing with rally fetch:', error)
      }
      
      // Then fetch rallies (same logic as useAllRallies)
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

      // Get rally events (same as before)
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

      // Transform data (same as before)
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
          registered_participants: 0
        }
      })

      console.log(`✅ ALL rallies loaded with auto-updated statuses: ${transformedRallies.length}`)
      return transformedRallies
    },
    staleTime: 5 * 60 * 1000,
  })
}

// ============================================================================
// STEP 3: Add New Admin Rally Hook - Include All Rallies
// ============================================================================

// Add this NEW function to src/hooks/useOptimizedRallies.ts:

export function useAdminAllRallies(limit = 50) {
  const autoUpdate = useAutoUpdateRallyStatuses()

  return useQuery({
    queryKey: [...rallyKeys.all, 'admin-all-rallies', limit],
    queryFn: async (): Promise<TransformedRally[]> => {
      console.log('🔄 Loading ALL rallies for admin (including inactive)...')

      // ADD THIS: Auto-update statuses before loading admin rallies
      try {
        console.log('🔄 Running auto-update for admin rallies...')
        await autoUpdate.mutateAsync()
      } catch (error) {
        console.warn('Status update failed for admin rallies, continuing:', error)
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

      const rallyIds = rallies.map(rally => rally.id)

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

      // Transform data with additional admin info
      const transformedRallies: TransformedRally[] = rallies.map((rally: any) => ({
        ...rally,
        game_name: rally.game?.name || 'Unknown Game',
        game_type_name: rally.game_type?.name || 'Unknown Type',
        registered_participants: participantCounts[rally.id] || 0,
        // Add visual indicators for admin
        display_status: !rally.is_active ? 'inactive' : rally.status,
        is_visible_to_users: rally.is_active
      }))

      console.log(`✅ Loaded ${transformedRallies.length} rallies for admin (including ${transformedRallies.filter(r => !r.is_active).length} inactive)`)
      return transformedRallies
    },
    staleTime: 2 * 60 * 1000,
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
  const oneHourAfterCompetition = new Date(competitionDate.getTime() + (1 * 60 * 60 * 1000))
  
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