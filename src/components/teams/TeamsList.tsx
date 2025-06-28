// src/components/teams/TeamsList.tsx
'use client'

import { useState } from 'react'
import { useTeams, useDeleteTeam, Team } from '@/hooks/useTeams'
import { TeamEditModal } from './TeamEditModal'

export function TeamsList() {
  const { data: teams = [], isLoading } = useTeams()
  const deleteTeamMutation = useDeleteTeam()
  const [editingTeam, setEditingTeam] = useState<Team | null>(null)
  const [deletingTeamId, setDeletingTeamId] = useState<string | null>(null)

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
                        
                        <div className="mt-4 grid grid-cols-2 gap-3">
                          {/* Game & Class */}
                          <div className="flex items-center gap-2">
                            <span className="text-red-500/60">⬢</span>
                            <div>
                              <p className="text-xs text-gray-500 uppercase tracking-wider">Mäng</p>
                              <p className="text-sm text-gray-300 font-medium">
                                {team.game?.name || 'Määramata'}
                              </p>
                            </div>
                          </div>
                          
                          {/* Class */}
                          <div className="flex items-center gap-2">
                            <span className="text-purple-500/60">◈</span>
                            <div>
                              <p className="text-xs text-gray-500 uppercase tracking-wider">Klass</p>
                              <p className="text-sm text-gray-300 font-medium">
                                {team.game_class?.name || 'Määramata'}
                              </p>
                            </div>
                          </div>
                          
                          {/* Vehicle */}
                          <div className="flex items-center gap-2">
                            <span className="text-orange-500/60">◆</span>
                            <div>
                              <p className="text-xs text-gray-500 uppercase tracking-wider">Sõiduk</p>
                              <p className="text-sm text-gray-300 font-medium">
                                {team.vehicle?.vehicle_name || 'Määramata'}
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
                          
                          <p className="text-xs text-gray-500 mt-1 font-['Orbitron'] uppercase tracking-wider">
                            Liikmeid
                          </p>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => setEditingTeam(team)}
                            className="group/btn relative px-4 py-2 futuristic-btn futuristic-btn-secondary rounded-lg flex items-center gap-2 text-sm"
                          >
                            <span className="relative z-10">✏️</span>
                            <span className="relative z-10 font-['Orbitron'] uppercase tracking-wider">Muuda</span>
                          </button>
                          
                          <button
                            onClick={() => handleDelete(team)}
                            disabled={deletingTeamId === team.id}
                            className="group/btn relative px-4 py-2 futuristic-btn futuristic-btn-primary rounded-lg flex items-center gap-2 text-sm disabled:opacity-50"
                          >
                            <span className="relative z-10">🗑️</span>
                            <span className="relative z-10 font-['Orbitron'] uppercase tracking-wider">
                              {deletingTeamId === team.id ? 'Kustutan...' : 'Kustuta'}
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
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