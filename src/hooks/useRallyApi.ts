import { supabase } from '@/lib/supabase'

interface Rally {
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

export function useRallyApi() {
  const fetchUpcomingRallies = async (limit: number = 10): Promise<Rally[]> => {
    try {
      const { data, error } = await supabase
        .from('rallies')
        .select(`
          id,
          name,
          game,
          date,
          registration_deadline,
          status,
          description,
          created_by,
          created_at,
          updated_at
        `)
        .eq('status', 'upcoming')
        .gte('date', new Date().toISOString())
        .order('date', { ascending: true })
        .limit(limit)

      if (error) {
        console.error('Error fetching rallies:', error)
        throw error
      }

      // Transform data to match your expected format
      return data?.map(rally => ({
        rally_id: rally.id,
        rally_game_id: rally.game,
        rally_type_id: 'championship', // Default type
        rally_date: rally.date,
        registration_ending_date: rally.registration_deadline,
        optional_notes: rally.description,
        created_by: rally.created_by,
        created_at: rally.created_at,
        updated_at: rally.updated_at,
        game_name: rally.game,
        type_name: 'Championship',
        events: [], // Will be populated later when you add events table
        creator_name: 'Admin'
      })) || []

    } catch (error) {
      console.error('Failed to fetch upcoming rallies:', error)
      return []
    }
  }

  const registerForRally = async (rallyId: string) => {
    try {
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

      return { success: true, data }
    } catch (error) {
      console.error('Failed to register for rally:', error)
      return { success: false, error }
    }
  }

  return {
    fetchUpcomingRallies,
    registerForRally
  }
}