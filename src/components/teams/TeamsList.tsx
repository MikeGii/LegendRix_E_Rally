// src/components/teams/TeamsList.tsx
'use client'

import { useState } from 'react'
import { useTeams, useDeleteTeam, Team } from '@/hooks/useTeams'
import { TeamEditModal } from './TeamEditModal'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

// Hook to fetch team members for a specific team
function useTeamMembers(teamId: string) {
  return useQuery({
    queryKey: ['team-members', teamId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('team_members')
        .select(`
          user_id,
          role,
          joined_at,
          users (
            name,
            player_name
          )
        `)
        .eq('team_id', teamId)
        .eq('status', 'approved')
        .order('role', { ascending: false }) // Manager first
        .order('joined_at', { ascending: true })

      if (error) {
        console.error('Error fetching team members:', error)
        throw error
      }

      // Transform the data
      return (data || []).map(item => ({
        user_id: item.user_id,
        role: item.role,
        joined_at: item.joined_at,
        user: Array.isArray(item.users) ? item.users[0] : item.users
      }))
    },
    enabled: !!teamId,
    staleTime: 30 * 1000,
  })
}

// Component to display team members
function TeamMembersDisplay({ teamId }: { teamId: string }) {
  const { data: members = [], isLoading } = useTeamMembers(teamId)
  
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <div className="w-4 h-4 border-2 border-gray-600 border-t-red-500 rounded-full animate-spin"></div>
        <span>Laadin liikmeid...</span>
      </div>
    )
  }

  return (
    <div className="mt-4 pt-4 border-t border-gray-800/50">
      <h4 className="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wider">Tiimi liikmed</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {members.map((member, index) => (
          <div 
            key={member.user_id}
            className="flex items-center gap-3 p-3 bg-gray-900/50 rounded-lg border border-gray-800/50 group hover:border-red-500/30 transition-all duration-300"
          >
            {/* Role indicator */}
            <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
              member.role === 'manager' 
                ? 'bg-gradient-to-br from-red-900/30 to-red-800/20 border border-red-500/30' 
                : 'bg-gradient-to-br from-gray-800/30 to-gray-700/20 border border-gray-600/30'
            }`}>
              <span className={`text-sm ${
                member.role === 'manager' ? 'text-red-400' : 'text-gray-400'
              }`}>
                {member.role === 'manager' ? '👑' : `${index + 1}`}
              </span>
            </div>
            
            {/* Member info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate group-hover:text-red-400 transition-colors">
                {member.user?.player_name || member.user?.name || 'Tundmatu'}
              </p>
              <p className="text-xs text-gray-500">
                {member.role === 'manager' ? 'Pealik' : 'Liige'}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function TeamsList() {
  const { data: teams = [], isLoading } = useTeams()
  const deleteTeamMutation = useDeleteTeam()
  const [editingTeam, setEditingTeam] = useState<Team | null>(null)
  const [deletingTeamId, setDeletingTeamId] = useState<string | null>(null)
  const [expandedTeamId, setExpandedTeamId] = useState<string | null>(null)

  const handleDelete = async (team: Team) => {
    if (!confirm(`Kas oled kindel, et soovid kustutada tiimi "${team.team_name}"?`)) {
      return
    }

    setDeletingTeamId(team.id)
    try {
      await deleteTeamMutation.mutateAsync(team.id)
      alert('Tiim edukalt kustutatud!')
    } catch (error) {
      alert('Viga tiimi kustutamisel')
    } finally {
      setDeletingTeamId(null)
    }
  }

  const toggleTeamExpand = (teamId: string) => {
    setExpandedTeamId(expandedTeamId === teamId ? null : teamId)
  }

  if (isLoading) {
    return (
      <div className="relative bg-gradient-to-br from-gray-900/90 to-black backdrop-blur-xl rounded-2xl border border-red-500/20 p-8 overflow-hidden">
        {/* Animated background pattern */}
        <div className="absolute inset-0 grid-pattern opacity-[0.02] pointer-events-none"></div>
        
        <div className="flex justify-center relative z-10">
          <div className="text-center">
            <div className="w-12 h-12 border-2 border-gray-700 border-t-red-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400 font-['Orbitron'] uppercase tracking-wider">Laadin tiime...</p>
          </div>
        </div>
      </div>
    )
  }

  if (teams.length === 0) {
    return (
      <div className="relative bg-gradient-to-br from-gray-900/90 to-black backdrop-blur-xl rounded-2xl border border-red-500/20 p-8 overflow-hidden">
        {/* Animated background pattern */}
        <div className="absolute inset-0 grid-pattern opacity-[0.02] pointer-events-none"></div>
        
        <div className="text-center relative z-10">
          <p className="text-gray-400 font-['Orbitron'] uppercase tracking-wider">Ühtegi tiimi pole veel loodud.</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="relative bg-gradient-to-br from-gray-900/90 to-black backdrop-blur-xl rounded-2xl border border-red-500/20 overflow-hidden">
        {/* Animated background pattern */}
        <div className="absolute inset-0 grid-pattern opacity-[0.02] pointer-events-none"></div>
        
        {/* Scanning line effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="scan-line"></div>
        </div>

        {/* Header */}
        <div className="relative z-10 px-8 py-6 border-b border-red-500/20 bg-black/30">
          <h2 className="text-xl font-bold text-white font-['Orbitron'] uppercase tracking-wider flex items-center gap-3">
            <span className="text-red-500">▣</span>
            Olemasolevad tiimid
          </h2>
        </div>
        
        {/* Teams Grid */}
        <div className="relative z-10 p-8">
          <div className="space-y-6">
            {teams.map((team) => {
              const memberPercentage = (team.members_count / team.max_members_count) * 100
              const isFull = memberPercentage >= 100
              const isExpanded = expandedTeamId === team.id
              
              return (
                <div
                  key={team.id}
                  className="group relative tech-border rounded-xl transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,0,64,0.3)]"
                >
                  {/* Background gradient on hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/5 to-red-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl pointer-events-none"></div>
                  
                  <div className="relative z-10 p-6">
                    <div className="flex items-center justify-between">
                      {/* Team Info */}
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-white font-['Orbitron'] uppercase tracking-wide group-hover:text-glow-red transition-all duration-300">
                          {team.team_name}
                        </h3>
                        
                        {/* Details Grid */}
                        <div className="grid grid-cols-2 gap-4 mt-3">
                          {/* Game & Class */}
                          <div className="flex items-center gap-2">
                            <span className="text-red-500/60">●</span>
                            <div>
                              <p className="text-xs text-gray-500 uppercase tracking-wider">Mäng</p>
                              <p className="text-sm text-gray-300 font-medium">
                                {team.game?.name} - {team.game_class?.name}
                              </p>
                            </div>
                          </div>
                          
                          {/* Manager */}
                          <div className="flex items-center gap-2">
                            <span className="text-red-500/60">◉</span>
                            <div>
                              <p className="text-xs text-gray-500 uppercase tracking-wider">Pealik</p>
                              <p className="text-sm text-gray-300 font-medium">
                                {team.manager?.player_name}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Right Side - Members & Actions */}
                      <div className="flex items-center gap-6 ml-8">
                        {/* Members Progress */}
                        <div className="text-center">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-2xl font-bold text-white font-['Orbitron']">
                              {team.members_count}
                            </span>
                            <span className="text-gray-500">/</span>
                            <span className="text-lg text-gray-400 font-['Orbitron']">
                              {team.max_members_count}
                            </span>
                          </div>
                          
                          <div className="w-32 h-1 bg-gray-800 rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-500 ${
                                isFull ? 'bg-red-500' : memberPercentage > 75 ? 'bg-orange-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${memberPercentage}%` }}
                            />
                          </div>
                          
                          <p className="text-xs text-gray-500 mt-1">Liikmed</p>
                        </div>
                        
                        {/* Actions */}
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => toggleTeamExpand(team.id)}
                            className="px-3 py-1.5 bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 hover:text-white rounded-lg text-sm font-medium transition-all duration-200 border border-gray-700/50 hover:border-gray-600/50"
                          >
                            {isExpanded ? 'Peida liikmed' : 'Näita liikmeid'}
                          </button>
                          
                          <button
                            onClick={() => setEditingTeam(team)}
                            className="px-3 py-1.5 bg-blue-900/30 hover:bg-blue-800/40 text-blue-400 hover:text-blue-300 rounded-lg text-sm font-medium transition-all duration-200 border border-blue-800/50 hover:border-blue-700/50"
                          >
                            Muuda
                          </button>
                          
                          <button
                            onClick={() => handleDelete(team)}
                            disabled={deletingTeamId === team.id}
                            className="px-3 py-1.5 bg-red-900/30 hover:bg-red-800/40 text-red-400 hover:text-red-300 rounded-lg text-sm font-medium transition-all duration-200 border border-red-800/50 hover:border-red-700/50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {deletingTeamId === team.id ? 'Kustutan...' : 'Kustuta'}
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Expanded Team Members Section */}
                    {isExpanded && (
                      <TeamMembersDisplay teamId={team.id} />
                    )}
                  </div>
                  
                  {/* Tech corner accents */}
                  <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-red-500/30 rounded-tl-lg"></div>
                  <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-red-500/30 rounded-tr-lg"></div>
                  <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-red-500/30 rounded-bl-lg"></div>
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-red-500/30 rounded-br-lg"></div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editingTeam && (
        <TeamEditModal
          team={editingTeam}
          onClose={() => setEditingTeam(null)}
        />
      )}
    </>
  )
}