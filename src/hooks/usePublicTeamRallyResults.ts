// src/hooks/usePublicTeamRallyResults.ts
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { TeamRallyResult } from './useTeamRallyResults'

export function usePublicTeamRallyResults(rallyId: string) {
  return useQuery({
    queryKey: ['public-team-rally-results', rallyId],
    queryFn: async (): Promise<TeamRallyResult[]> => {
      if (!rallyId) return []

      console.log('🔄 Loading public team results for rally:', rallyId)

      // First check if rally is public
      const { data: rallyStatus, error: statusError } = await supabase
        .from('rally_results_status')
        .select('is_public')
        .eq('rally_id', rallyId)
        .eq('results_approved', true)
        .single()

      if (statusError || !rallyStatus?.is_public) {
        console.log('Rally is not public or not found')
        return []
      }

      // Get team totals
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

      // Get individual member results
      const teamIds = Array.from(new Set(teamTotals.map(t => t.team_id)))
      
      const { data: memberResults, error: membersError } = await supabase
        .from('team_rally_results')
        .select('*')
        .eq('rally_id', rallyId)
        .in('team_id', teamIds)

      if (membersError) {
        console.error('Error loading member results:', membersError)
      }

      // Get player names from users table
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

      // Group member results by team
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

      // Mark top 3 members per team as contributed
      Object.keys(membersByTeam).forEach(teamId => {
        const members = membersByTeam[teamId]
        members.sort((a, b) => b.points - a.points)
        members.slice(0, 3).forEach(member => {
          member.contributed = true
        })
      })

      // Calculate positions within each class
      const positionsByClass: Record<string, number> = {}
      
      // Format final results
      const formattedResults: TeamRallyResult[] = teamTotals.map(team => {
        const classKey = team.class_id || team.class_name
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

      console.log(`✅ Loaded ${formattedResults.length} team results`)
      return formattedResults
    },
    enabled: !!rallyId,
    staleTime: 5 * 60 * 1000,
  })
}