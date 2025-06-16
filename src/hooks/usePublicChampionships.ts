import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export interface PublicChampionship {
  id: string
  name: string
  season_year: number
  is_active: boolean
  total_rallies: number
  total_participants: number
  game_name?: string
  game_type_name?: string
}

export function usePublicChampionships() {
  return useQuery({
    queryKey: ['public-championships'],
    queryFn: async (): Promise<PublicChampionship[]> => {
      console.log('🔄 Loading public championships...')
      
      const { data, error } = await supabase
        .from('championships')
        .select(`
          id,
          name,
          season_year,
          is_active,
          game_id,
          game_type_id,
          games(name),
          game_types(name),
          championship_rallies(
            rally_id,
            rallies(
              rally_results(participant_name)
            )
          )
        `)
        .eq('is_active', true) // Only active championships
        .order('season_year', { ascending: false })
        .order('name')

      if (error) {
        console.error('Error loading public championships:', error)
        throw error
      }

      // Process data to calculate totals
      const championships = (data || []).map(championship => {
        const participantNames = new Set()
        let totalRallies = 0

        // Handle nested data structure
        if (championship.championship_rallies && Array.isArray(championship.championship_rallies)) {
          championship.championship_rallies.forEach((cr: any) => {
            totalRallies++
            // Check if rallies exists and has rally_results
            if (cr.rallies && cr.rallies.rally_results && Array.isArray(cr.rallies.rally_results)) {
              cr.rallies.rally_results.forEach((result: any) => {
                if (result.participant_name) {
                  participantNames.add(result.participant_name)
                }
              })
            }
          })
        }

        return {
          id: championship.id,
          name: championship.name,
          season_year: championship.season_year,
          is_active: championship.is_active,
          total_rallies: totalRallies,
          total_participants: participantNames.size,
          // Access games and game_types as arrays (Supabase returns them as arrays)
          game_name: championship.games && Array.isArray(championship.games) && championship.games.length > 0 ? championship.games[0].name : null,
          game_type_name: championship.game_types && Array.isArray(championship.game_types) && championship.game_types.length > 0 ? championship.game_types[0].name : null
        }
      })

      console.log(`✅ Loaded ${championships.length} public championships`)
      return championships
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - public data doesn't change often
  })
}