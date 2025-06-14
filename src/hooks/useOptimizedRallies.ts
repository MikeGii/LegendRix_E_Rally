// src/hooks/useOptimizedRallies.ts - Complete Optimized Rallies Hook
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

// ============================================================================
// INTERFACES
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
  prize_pool: number
  entry_fee: number
  rules: string
  is_featured: boolean
  is_active: boolean
  created_by: string
  created_at: string
  updated_at: string
  // Added missing game properties that components expect
  game_name?: string
  game_type_name?: string
  // Added missing computed properties that CompetitionsModal expects
  registered_participants?: number
  total_events?: number
  total_tracks?: number
  // Added missing events property that CompetitionsModal expects
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
  prize_pool: number
  entry_fee: number
  rules: string
  is_featured: boolean
  is_active: boolean
  created_by: string
  created_at: string
  updated_at: string
  // Additional computed fields
  rally_id: string
  rally_game_id: string
  rally_type_id: string
  rally_date: string
  registration_ending_date: string
  optional_notes: string
  type_name: string
  creator_name: string
  events: RallyEvent[]
  // ADD THESE MISSING PROPERTIES THAT YOUR COMPONENTS EXPECT:
  game_name?: string        // <- This is what's missing!
  game_type_name?: string   // <- This might also be missing
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
  car_number?: number
  team_name?: string
  notes?: string
  entry_fee_paid: number
  payment_status: 'pending' | 'paid' | 'refunded' | 'waived'
  created_at: string
  updated_at: string
  // Joined data
  rally_name?: string
  class_name?: string
  rally_competition_date?: string
  rally_status?: string
}

export interface UserStats {
  totalUsers: number
  pendingEmail: number
  pendingApproval: number
  approved: number
}

// ============================================================================
// QUERY KEYS
// ============================================================================

export const rallyKeys = {
  all: ['rallies'] as const,
  lists: () => [...rallyKeys.all, 'list'] as const,
  list: (filters: string) => [...rallyKeys.lists(), { filters }] as const,
  details: () => [...rallyKeys.all, 'detail'] as const,
  detail: (id: string) => [...rallyKeys.details(), id] as const,
  upcoming: (limit?: number) => [...rallyKeys.all, 'upcoming', limit] as const,
  featured: (limit?: number) => [...rallyKeys.all, 'featured', limit] as const,
  registrations: () => [...rallyKeys.all, 'registrations'] as const,
  userRegistrations: (userId: string) => [...rallyKeys.registrations(), 'user', userId] as const,
}

// ============================================================================
// UPCOMING RALLIES HOOK
// ============================================================================

export function useUpcomingRallies(limit = 10) {
  return useQuery({
    queryKey: rallyKeys.upcoming(limit),
    queryFn: async (): Promise<TransformedRally[]> => {
      console.log('🔄 Loading upcoming rallies...')
      
      // FIXED: Remove 'platform' from games selection
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

      // Rest of the transformation logic...
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

      // Transform data
      const transformedRallies = rallies.map(rally => {
        return {
          ...rally,
          game_name: rally.game?.name || 'Unknown Game',
          game_type_name: rally.game_type?.name || 'Unknown Type',
          // Remove game_platform since it doesn't exist in your DB
          // game_platform: rally.game?.platform || undefined,
          total_events: 0, // Calculate if needed
          total_tracks: 0, // Calculate if needed
          registered_participants: 0 // Calculate if needed
        }
      })

      console.log(`✅ Upcoming rallies loaded: ${transformedRallies.length}`)
      return transformedRallies
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// ============================================================================
// FEATURED RALLIES HOOK
// ============================================================================

export function useFeaturedRallies(limit = 5) {
  return useQuery({
    queryKey: rallyKeys.featured(limit),
    queryFn: async (): Promise<RealRally[]> => {
      console.log('🔄 Loading featured rallies with events and tracks...')
      
      // FIXED: Remove 'platform' from games selection
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

      // Rest of the transformation logic remains the same...
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
        events: [], // Populate if needed
        // ADD THE MISSING PROPERTIES:
        game_name: rally.game?.name || 'Unknown Game',
        game_type_name: rally.game_type?.name || 'Unknown Type',
        // Don't include game_platform since it doesn't exist
      }))

      console.log(`✅ Featured rallies loaded: ${transformedRallies.length}`)
      return transformedRallies
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// ============================================================================
// USER RALLY REGISTRATIONS HOOK (Enhanced - Returns ALL registrations)
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

      // Enhanced query to include rally information - NO FILTERING HERE
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

      // Transform but don't filter - let the component decide what to show
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
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

// ============================================================================
// USER STATS HOOK
// ============================================================================

export function useUserStats() {
  return useQuery({
    queryKey: ['user_stats'],
    queryFn: async (): Promise<UserStats> => {
      console.log('🔄 Loading user statistics...')
      
      const { data: users, error } = await supabase
        .from('users')
        .select('email_verified, admin_approved, status')

      if (error) {
        console.error('Error loading user stats:', error)
        throw error
      }

      const stats = {
        totalUsers: users?.length || 0,
        pendingEmail: users?.filter(user => !user.email_verified).length || 0,
        pendingApproval: users?.filter(user => user.email_verified && !user.admin_approved).length || 0,
        approved: users?.filter(user => user.email_verified && user.admin_approved).length || 0
      }

      console.log('✅ User stats loaded:', stats)
      return stats
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

// Helper function to check if a registration should be hidden
export function shouldHideRegistration(registration: UserRallyRegistration): boolean {
  if (!registration.rally_competition_date) return false
  
  const now = new Date()
  const oneDayAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000))
  const competitionDate = new Date(registration.rally_competition_date)
  
  // Hide if competition date is more than 1 day in the past
  return competitionDate < oneDayAgo
}

// Hook to get active registrations only (public utility)
export function useActiveUserRegistrations() {
  const { data: allRegistrations = [], ...rest } = useUserRallyRegistrations()
  
  // Additional client-side filtering if needed
  const activeRegistrations = allRegistrations.filter(registration => 
    !shouldHideRegistration(registration)
  )
  
  return {
    data: activeRegistrations,
    ...rest
  }
}

// Hook to get rally by ID
export function useRally(rallyId: string) {
  return useQuery({
    queryKey: rallyKeys.detail(rallyId),
    queryFn: async (): Promise<TransformedRally | null> => {
      if (!rallyId) return null
      
      console.log('🔄 Loading rally details:', rallyId)
      
      const { data: rally, error } = await supabase
        .from('rallies')
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
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Hook to get all rallies with optional filtering
export function useAllRallies(filters?: { status?: string; featured?: boolean }) {
  const queryKey = rallyKeys.list(JSON.stringify(filters))
  
  return useQuery({
    queryKey,
    queryFn: async (): Promise<TransformedRally[]> => {
      console.log('🔄 Loading all rallies with filters:', filters)
      
      let query = supabase
        .from('rallies')
        .select('*')
        .eq('is_active', true)
        .order('competition_date', { ascending: true })

      if (filters?.status) {
        query = query.eq('status', filters.status)
      }

      if (filters?.featured !== undefined) {
        query = query.eq('is_featured', filters.featured)
      }

      const { data: rallies, error } = await query

      if (error) {
        console.error('Error loading rallies:', error)
        throw error
      }

      console.log(`✅ All rallies loaded: ${rallies?.length || 0}`)
      return rallies || []
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}