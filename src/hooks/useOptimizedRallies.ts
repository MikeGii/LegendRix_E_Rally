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
}

export const rallyKeys = {
  all: ['user_rallies'] as const,
  upcoming: () => [...rallyKeys.all, 'upcoming'] as const,
  registrations: () => [...rallyKeys.all, 'registrations'] as const,
  featured: () => [...rallyKeys.all, 'featured'] as const,
}

// Updated hook to fetch real rally data
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

      // Transform to match existing component interface
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

// Hook to get featured rallies
export function useFeaturedRallies(limit: number = 3) {
  return useQuery({
    queryKey: [...rallyKeys.featured(), { limit }],
    queryFn: async (): Promise<RealRally[]> => {
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

      const transformedRallies: RealRally[] = rallies?.map(rally => ({
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

// Rally registration mutation
export function useRallyRegistration() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ rallyId, classId }: { rallyId: string; classId: string }) => {
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

      const { data, error } = await supabase
        .from('rally_registrations')
        .insert([{
          rally_id: rallyId,
          user_id: currentUser.user.id,
          class_id: classId,
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