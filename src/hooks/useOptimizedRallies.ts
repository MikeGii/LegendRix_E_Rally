import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

interface Rally {
  id: string
  name: string
  game: string
  date: string
  registration_deadline: string
  status: string
  description?: string
  created_by: string
  created_at: string
  updated_at: string
}

export interface TransformedRally {
  rally_id: string
  rally_game_id: string
  rally_type_id: string
  rally_date: string
  registration_ending_date: string
  optional_notes?: string
  created_by: string
  created_at: string
  updated_at: string
  game_name: string
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

export const rallyKeys = {
  all: ['rallies'] as const,
  lists: () => [...rallyKeys.all, 'list'] as const,
  list: (filters: string) => [...rallyKeys.lists(), { filters }] as const,
  upcoming: () => [...rallyKeys.all, 'upcoming'] as const,
  registrations: () => [...rallyKeys.all, 'registrations'] as const,
}

export function useUpcomingRallies(limit: number = 10) {
  return useQuery({
    queryKey: [...rallyKeys.upcoming(), { limit }],
    queryFn: async (): Promise<TransformedRally[]> => {
      console.log('🔄 Loading upcoming rallies...')
      
      const { data: rallies, error } = await supabase
        .from('rallies')
        .select('*')
        .eq('status', 'upcoming')
        .gte('date', new Date().toISOString())
        .order('date', { ascending: true })
        .limit(limit)

      if (error) {
        console.error('Error loading rallies:', error)
        throw error
      }

      const transformedRallies: TransformedRally[] = rallies?.map(rally => ({
        rally_id: rally.id,
        rally_game_id: rally.game,
        rally_type_id: 'championship',
        rally_date: rally.date,
        registration_ending_date: rally.registration_deadline,
        optional_notes: rally.description,
        created_by: rally.created_by,
        created_at: rally.created_at,
        updated_at: rally.updated_at,
        game_name: rally.game,
        type_name: 'Championship',
        events: [],
        creator_name: 'Rally Admin'
      })) || []

      console.log(`✅ Upcoming rallies loaded: ${transformedRallies.length}`)
      return transformedRallies
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - rally data doesn't change often
  })
}

export function useRallyRegistration() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (rallyId: string) => {
      console.log('🔄 Registering for rally:', rallyId)
      
      const { data: currentUser } = await supabase.auth.getUser()
      
      if (!currentUser.user) {
        throw new Error('User not authenticated')
      }

      const { data, error } = await supabase
        .from('rally_registrations')
        .insert([{
          rally_id: rallyId,
          user_id: currentUser.user.id,
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