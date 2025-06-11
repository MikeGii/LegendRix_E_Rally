// src/hooks/useOptimizedRallies.ts - Enhanced version with better rally information
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
  // Rally events and tracks details
  rally_events?: RallyEventDetail[]
  available_classes?: RallyClassDetail[]
  user_registration?: UserRallyRegistration | null
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

export interface RallyEventDetail {
  id: string
  event_id: string
  event_name: string
  event_order: number
  country?: string
  surface_type?: string
  tracks: RallyTrackDetail[]
}

export interface RallyTrackDetail {
  id: string
  track_id: string
  track_name: string
  track_order: number
  length_km?: number
  stage_number?: number
  surface_type?: string
  is_special_stage: boolean
}

export interface RallyClassDetail {
  id: string
  class_id: string
  class_name: string
  max_participants?: number
  entry_fee_modifier: number
  registered_count?: number
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
  entry_fee_paid: number
  payment_status: 'pending' | 'paid' | 'refunded' | 'waived'
  class_name?: string
  rally_name?: string
  notes?: string
}

export interface TransformedRally extends RealRally {
  // Additional computed fields for display
  canRegister: boolean
  registrationStatus: 'open' | 'closed' | 'full' | 'expired'
  daysUntilEvent: number
  daysUntilRegistrationDeadline: number
}

export const rallyKeys = {
  all: ['user_rallies'] as const,
  upcoming: () => [...rallyKeys.all, 'upcoming'] as const,
  registrations: () => [...rallyKeys.all, 'registrations'] as const,
  featured: () => [...rallyKeys.all, 'featured'] as const,
  detailed: (rallyId: string) => [...rallyKeys.all, 'detailed', rallyId] as const,
}

// Enhanced hook to fetch detailed rally information
export function useDetailedRallies(limit: number = 10) {
  return useQuery({
    queryKey: [...rallyKeys.upcoming(), { limit, detailed: true }],
    queryFn: async (): Promise<TransformedRally[]> => {
      console.log('🔄 Loading detailed rallies from Rally Management...')
      
      // Get current user for registration status
      const { data: { user } } = await supabase.auth.getUser()
      
      // Fetch rallies with all related data
      const { data: rallies, error } = await supabase
        .from('rally_details')
        .select(`
          *,
          rally_events:rally_events(
            id,
            event_id,
            event_order,
            event:game_events(
              id,
              name,
              country,
              surface_type
            ),
            rally_event_tracks:rally_event_tracks(
              id,
              track_id,
              track_order,
              track:event_tracks(
                id,
                name,
                length_km,
                stage_number,
                surface_type,
                is_special_stage
              )
            )
          ),
          rally_classes:rally_classes(
            id,
            class_id,
            max_participants,
            entry_fee_modifier,
            class:game_classes(
              id,
              name
            )
          )
        `)
        .eq('is_active', true)
        .in('status', ['upcoming', 'registration_open', 'registration_closed', 'active'])
        .gte('competition_date', new Date().toISOString())
        .order('competition_date', { ascending: true })
        .limit(limit)

      if (error) {
        console.error('Error loading detailed rallies:', error)
        throw error
      }

      // Get user registrations if user is logged in
      let userRegistrations: UserRallyRegistration[] = []
      if (user) {
        const { data: registrations } = await supabase
          .from('rally_registrations')
          .select(`
            *,
            class:game_classes(name)
          `)
          .eq('user_id', user.id)

        userRegistrations = registrations?.map(reg => ({
          ...reg,
          class_name: reg.class?.name,
        })) || []
      }

      // Transform rallies with enhanced information
      const transformedRallies: TransformedRally[] = rallies?.map(rally => {
        const now = new Date()
        const competitionDate = new Date(rally.competition_date)
        const registrationDeadline = new Date(rally.registration_deadline)
        
        // Calculate time differences
        const daysUntilEvent = Math.ceil((competitionDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        const daysUntilRegistrationDeadline = Math.ceil((registrationDeadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        
        // Transform rally events
        const rally_events: RallyEventDetail[] = rally.rally_events?.map((re: any) => ({
          id: re.id,
          event_id: re.event_id,
          event_name: re.event?.name || 'Unknown Event',
          event_order: re.event_order,
          country: re.event?.country,
          surface_type: re.event?.surface_type,
          tracks: re.rally_event_tracks?.map((ret: any) => ({
            id: ret.id,
            track_id: ret.track_id,
            track_name: ret.track?.name || 'Unknown Track',
            track_order: ret.track_order,
            length_km: ret.track?.length_km,
            stage_number: ret.track?.stage_number,
            surface_type: ret.track?.surface_type,
            is_special_stage: ret.track?.is_special_stage || false,
          })) || []
        })) || []

        // Transform available classes
        const available_classes: RallyClassDetail[] = rally.rally_classes?.map((rc: any) => ({
          id: rc.id,
          class_id: rc.class_id,
          class_name: rc.class?.name || 'Unknown Class',
          max_participants: rc.max_participants,
          entry_fee_modifier: rc.entry_fee_modifier,
          registered_count: 0 // TODO: Add actual count from registrations
        })) || []

        // Find user registration for this rally
        const user_registration = userRegistrations.find(reg => reg.rally_id === rally.id) || null

        // Determine registration status
        let registrationStatus: 'open' | 'closed' | 'full' | 'expired' = 'closed'
        let canRegister = false

        if (rally.status === 'registration_open' && daysUntilRegistrationDeadline > 0) {
          if (rally.max_participants && rally.registered_participants >= rally.max_participants) {
            registrationStatus = 'full'
          } else {
            registrationStatus = 'open'
            canRegister = !user_registration && user !== null
          }
        } else if (daysUntilRegistrationDeadline <= 0) {
          registrationStatus = 'expired'
        }

        return {
          ...rally,
          // Enhanced data
          rally_events,
          available_classes,
          user_registration,
          // Computed fields
          canRegister,
          registrationStatus,
          daysUntilEvent,
          daysUntilRegistrationDeadline,
          // Compatibility fields
          rally_id: rally.id,
          rally_game_id: rally.game_id || '',
          rally_type_id: rally.game_type_id || '',
          rally_date: rally.competition_date,
          registration_ending_date: rally.registration_deadline,
          optional_notes: rally.description,
          type_name: rally.game_type_name || 'Competition',
          events: rally_events.map(event => ({
            event_id: event.event_id,
            event_name: event.event_name,
            event_order: event.event_order,
            country: event.country,
            surface_type: event.surface_type
          })),
          creator_name: 'Rally Admin'
        }
      }) || []

      console.log(`✅ Detailed rallies loaded: ${transformedRallies.length}`)
      return transformedRallies
    },
    staleTime: 3 * 60 * 1000, // 3 minutes - detailed data needs more frequent updates
  })
}

// Enhanced upcoming rallies hook (simplified version for quick display)
export function useUpcomingRallies(limit: number = 10) {
  return useQuery({
    queryKey: [...rallyKeys.upcoming(), { limit }],
    queryFn: async (): Promise<RealRally[]> => {
      console.log('🔄 Loading upcoming rallies from Rally Management...')
      
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

      // Transform to match existing interface for compatibility
      const transformedRallies: RealRally[] = rallies?.map(rally => ({
        ...rally,
        // Map to existing interface for compatibility
        rally_id: rally.id,
        rally_game_id: rally.game_id || '',
        rally_type_id: rally.game_type_id || '',
        rally_date: rally.competition_date,
        registration_ending_date: rally.registration_deadline,
        optional_notes: rally.description,
        type_name: rally.game_type_name || 'Competition',
        events: [], // We'll load this separately if needed
        creator_name: 'Rally Admin'
      })) || []

      console.log(`✅ Upcoming rallies loaded: ${transformedRallies.length}`)
      return transformedRallies
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - rally data changes less frequently
  })
}

// Hook to get featured rallies with enhanced details
export function useFeaturedRallies(limit: number = 3) {
  return useQuery({
    queryKey: [...rallyKeys.featured(), { limit }],
    queryFn: async (): Promise<TransformedRally[]> => {
      console.log('🔄 Loading featured rallies...')
      
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

      const transformedRallies: TransformedRally[] = rallies?.map(rally => ({
        ...rally,
        rally_id: rally.id,
        rally_game_id: rally.game_id || '',
        rally_type_id: rally.game_type_id || '',
        rally_date: rally.competition_date,
        registration_ending_date: rally.registration_deadline,
        optional_notes: rally.description,
        type_name: rally.game_type_name || 'Competition',
        events: [],
        creator_name: 'Rally Admin'
      })) || []

      console.log(`✅ Featured rallies loaded: ${transformedRallies.length}`)
      return transformedRallies
    },
    staleTime: 5 * 60 * 1000,
  })
}

// Hook to get user's rally registrations with enhanced details
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
          rally:rallies(
            name,
            competition_date,
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

// Rally registration mutation with enhanced error handling
export function useRallyRegistration() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ rallyId, classId, teamName, notes }: { 
      rallyId: string; 
      classId: string; 
      teamName?: string;
      notes?: string;
    }) => {
      console.log('🔄 Registering for rally:', rallyId)
      
      const { data: currentUser } = await supabase.auth.getUser()
      
      if (!currentUser.user) {
        throw new Error('User not authenticated')
      }

      // Check if user is already registered
      const { data: existing } = await supabase
        .from('rally_registrations')
        .select('id')
        .eq('rally_id', rallyId)
        .eq('user_id', currentUser.user.id)
        .single()

      if (existing) {
        throw new Error('You are already registered for this rally')
      }

      // Check rally capacity
      const { data: rally } = await supabase
        .from('rallies')
        .select('max_participants, registered_participants')
        .eq('id', rallyId)
        .single()

      if (rally?.max_participants && rally.registered_participants >= rally.max_participants) {
        throw new Error('Rally is full')
      }

      const { data, error } = await supabase
        .from('rally_registrations')
        .insert([{
          rally_id: rallyId,
          user_id: currentUser.user.id,
          class_id: classId,
          team_name: teamName,
          notes: notes,
          status: 'registered'
        }])
        .select()
        .single()

      if (error) {
        console.error('Registration error:', error)
        throw error
      }

      console.log('✅ Rally registration successful')
      return { success: true, data }
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: rallyKeys.all })
    },
    onError: (error) => {
      console.error('❌ Rally registration failed:', error)
    }
  })
}

// Hook to get a single rally with complete details
export function useRallyDetails(rallyId: string) {
  return useQuery({
    queryKey: rallyKeys.detailed(rallyId),
    queryFn: async (): Promise<TransformedRally | null> => {
      if (!rallyId) return null
      
      console.log('🔄 Loading detailed rally:', rallyId)
      
      const { data: { user } } = await supabase.auth.getUser()
      
      const { data: rally, error } = await supabase
        .from('rally_details')
        .select(`
          *,
          rally_events:rally_events(
            id,
            event_id,
            event_order,
            event:game_events(
              id,
              name,
              country,
              surface_type
            ),
            rally_event_tracks:rally_event_tracks(
              id,
              track_id,
              track_order,
              track:event_tracks(
                id,
                name,
                length_km,
                stage_number,
                surface_type,
                is_special_stage
              )
            )
          ),
          rally_classes:rally_classes(
            id,
            class_id,
            max_participants,
            entry_fee_modifier,
            class:game_classes(
              id,
              name
            )
          )
        `)
        .eq('id', rallyId)
        .single()

      if (error) {
        console.error('Error loading rally details:', error)
        throw error
      }

      // Get user registration if logged in
      let user_registration = null
      if (user) {
        const { data: registration } = await supabase
          .from('rally_registrations')
          .select(`
            *,
            class:game_classes(name)
          `)
          .eq('rally_id', rallyId)
          .eq('user_id', user.id)
          .single()

        if (registration) {
          user_registration = {
            ...registration,
            class_name: registration.class?.name,
          }
        }
      }

      // Transform the rally data (same logic as in useDetailedRallies)
      const now = new Date()
      const competitionDate = new Date(rally.competition_date)
      const registrationDeadline = new Date(rally.registration_deadline)
      
      const daysUntilEvent = Math.ceil((competitionDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      const daysUntilRegistrationDeadline = Math.ceil((registrationDeadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      
      const rally_events: RallyEventDetail[] = rally.rally_events?.map((re: any) => ({
        id: re.id,
        event_id: re.event_id,
        event_name: re.event?.name || 'Unknown Event',
        event_order: re.event_order,
        country: re.event?.country,
        surface_type: re.event?.surface_type,
        tracks: re.rally_event_tracks?.map((ret: any) => ({
          id: ret.id,
          track_id: ret.track_id,
          track_name: ret.track?.name || 'Unknown Track',
          track_order: ret.track_order,
          length_km: ret.track?.length_km,
          stage_number: ret.track?.stage_number,
          surface_type: ret.track?.surface_type,
          is_special_stage: ret.track?.is_special_stage || false,
        })) || []
      })) || []

      const available_classes: RallyClassDetail[] = rally.rally_classes?.map((rc: any) => ({
        id: rc.id,
        class_id: rc.class_id,
        class_name: rc.class?.name || 'Unknown Class',
        max_participants: rc.max_participants,
        entry_fee_modifier: rc.entry_fee_modifier,
        registered_count: 0
      })) || []

      let registrationStatus: 'open' | 'closed' | 'full' | 'expired' = 'closed'
      let canRegister = false

      if (rally.status === 'registration_open' && daysUntilRegistrationDeadline > 0) {
        if (rally.max_participants && rally.registered_participants >= rally.max_participants) {
          registrationStatus = 'full'
        } else {
          registrationStatus = 'open'
          canRegister = !user_registration && user !== null
        }
      } else if (daysUntilRegistrationDeadline <= 0) {
        registrationStatus = 'expired'
      }

      const transformedRally: TransformedRally = {
        ...rally,
        rally_events,
        available_classes,
        user_registration,
        canRegister,
        registrationStatus,
        daysUntilEvent,
        daysUntilRegistrationDeadline,
        rally_id: rally.id,
        rally_game_id: rally.game_id || '',
        rally_type_id: rally.game_type_id || '',
        rally_date: rally.competition_date,
        registration_ending_date: rally.registration_deadline,
        optional_notes: rally.description,
        type_name: rally.game_type_name || 'Competition',
        events: rally_events.map(event => ({
          event_id: event.event_id,
          event_name: event.event_name,
          event_order: event.event_order,
          country: event.country,
          surface_type: event.surface_type
        })),
        creator_name: 'Rally Admin'
      }

      console.log('✅ Rally details loaded:', rally.name)
      return transformedRally
    },
    enabled: !!rallyId,
    staleTime: 5 * 60 * 1000,
  })
}