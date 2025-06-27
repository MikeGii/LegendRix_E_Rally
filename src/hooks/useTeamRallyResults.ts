// src/hooks/useTeamRallyResults.ts
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export interface TeamRallyResult {
  team_id: string
  team_name: string
  class_id: string
  class_name: string
  rally_id: string
  total_points: number
  team_position: number
  member_count: number
  members: {
    user_id: string
    player_name: string
    points: number
    contributed: boolean
  }[]
}

export function useTeamRallyResults(rallyId: string) {
  return useQuery({
    queryKey: ['team-rally-results', rallyId],
    queryFn: async (): Promise<TeamRallyResult[]> => {
      if (!rallyId) return []

      console.log('🔄 Loading team results for rally:', rallyId)

      // Step 1: Get team totals
      const { data: teamTotals, error: totalsError } = await supabase
        .from('team_rally_totals')
        .select('*')
        .eq('rally_id', rallyId)
        .order('class_name')
        .order('team_total_points', { ascending: false })

      if (totalsError) {
        console.error('Error loading team totals:', totalsError)
        throw totalsError
      }

      if (!teamTotals || teamTotals.length === 0) {
        console.log('No team results found for this rally')
        return []
      }

      // Step 2: Get individual member results
      const teamIds = Array.from(new Set(teamTotals.map(t => t.team_id)))
      console.log('Looking for member results for teams:', teamIds)
      
      const { data: memberResults, error: membersError } = await supabase
        .from('team_rally_results')
        .select('*')
        .eq('rally_id', rallyId)
        .in('team_id', teamIds)

      if (membersError) {
        console.error('Error loading member results:', membersError)
        console.warn('Continuing without member data')
      }

      console.log('Member results loaded:', memberResults)

      // Step 3: Get player names from users table
      let enrichedMemberResults = memberResults || []
      
      if (memberResults && memberResults.length > 0) {
        const userIds = Array.from(new Set(memberResults.map(m => m.user_id).filter(Boolean)))
        
        if (userIds.length > 0) {
          const { data: users, error: usersError } = await supabase
            .from('users')
            .select('id, player_name')
            .in('id', userIds)

          if (usersError) {
            console.error('Error loading user names:', usersError)
          } else if (users) {
            const userMap = new Map(users.map(u => [u.id, u.player_name]))
            enrichedMemberResults = memberResults.map(member => ({
              ...member,
              player_name: userMap.get(member.user_id) || 'Tundmatu mängija'
            }))
          }
        }
      }

      // Step 4: Group member results by team
      const membersByTeam = enrichedMemberResults.reduce((acc, member) => {
        if (!acc[member.team_id]) {
          acc[member.team_id] = []
        }
        
        acc[member.team_id].push({
          user_id: member.user_id,
          player_name: member.player_name || 'Tundmatu mängija',
          points: member.overall_points || member.points || 0,
          contributed: false
        })
        
        return acc
      }, {} as Record<string, any[]>)

      // Step 5: Mark top 3 members per team as contributed
      Object.keys(membersByTeam).forEach(teamId => {
        const members = membersByTeam[teamId]
        members.sort((a, b) => b.points - a.points)
        members.slice(0, 3).forEach(member => {
          member.contributed = true
        })
      })

      // Step 6: Calculate positions within each class
      const positionsByClass: Record<string, number> = {}
      
      // Step 7: Format final results
      const formattedResults: TeamRallyResult[] = teamTotals.map(team => {
        const classKey = team.class_id
        if (!positionsByClass[classKey]) {
          positionsByClass[classKey] = 0
        }
        positionsByClass[classKey]++

        return {
          team_id: team.team_id,
          team_name: team.team_name,
          class_id: team.class_id,
          class_name: team.class_name,
          rally_id: team.rally_id,
          total_points: team.team_total_points || 0,
          team_position: positionsByClass[classKey],
          member_count: team.participating_members || 0,
          members: membersByTeam[team.team_id] || []
        }
      })

      console.log('Formatted team results:', formattedResults)
      console.log('Members by team:', membersByTeam)

      return formattedResults
    },
    enabled: !!rallyId,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  })
}