// src/components/teams/TeamHeaderSection.tsx
'use client'

import { useState, useEffect } from 'react'
import { useUserTeamStatus, useUserTeam, useTeams, useApplyForTeam, Team } from '@/hooks/useTeams'
import { useAuth } from '@/components/AuthProvider'
import { TeamApplicationModal } from './TeamApplicationModal'

// Available Teams Table Component with enhanced design
function AvailableTeamsTable({ onSelectTeam }: { onSelectTeam: (team: Team) => void }) {
  const { data: teams = [], isLoading } = useTeams()

  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8 shadow-2xl">
        <div className="flex justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-slate-600 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-400">Laadin saadaolevaid tiime...</p>
          </div>
        </div>
      </div>
    )
  }

  if (teams.length === 0) {
    return null
  }

  return (
    <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="px-8 py-6 border-b border-slate-700/50 bg-slate-900/30">
        <h3 className="text-xl font-semibold text-white flex items-center gap-3">
          <span className="text-2xl">🎮</span>
          Saadaolevad tiimid
        </h3>
      </div>
      
      {/* Table */}
      <div className="p-8">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="text-left py-4 px-4 text-sm font-medium text-slate-300 uppercase tracking-wider">Tiimi nimi</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-slate-300 uppercase tracking-wider">Mäng / Klass</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-slate-300 uppercase tracking-wider">Tiimi pealik</th>
                <th className="text-center py-4 px-4 text-sm font-medium text-slate-300 uppercase tracking-wider">Kohtade olek</th>
                <th className="text-center py-4 px-4 text-sm font-medium text-slate-300 uppercase tracking-wider">Tegevus</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/30">
              {teams.map((team) => {
                const isFull = team.members_count >= team.max_members_count
                const fillPercentage = (team.members_count / team.max_members_count) * 100
                
                return (
                  <tr 
                    key={team.id}
                    className="hover:bg-slate-700/20 transition-all duration-200 group"
                  >
                    <td className="py-5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
                          <span className="text-lg">🏁</span>
                        </div>
                        <p className="text-white font-medium">{team.team_name}</p>
                      </div>
                    </td>
                    <td className="py-5 px-4">
                      <div>
                        <p className="text-sm text-white font-medium">{team.game?.name || 'N/A'}</p>
                        <p className="text-xs text-slate-400 mt-1">{team.game_class?.name || 'N/A'}</p>
                      </div>
                    </td>
                    <td className="py-5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-slate-700/50 rounded-full flex items-center justify-center">
                          <span className="text-xs">👤</span>
                        </div>
                        <div>
                          <p className="text-sm text-slate-300">{team.manager?.player_name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-5 px-4">
                      <div className="flex items-center justify-center gap-3">
                        <div className="flex flex-col items-center">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold text-white">{team.members_count}</span>
                            <span className="text-slate-400">/</span>
                            <span className="text-lg text-slate-400">{team.max_members_count}</span>
                          </div>
                          <div className="w-24 h-2 bg-slate-700/50 rounded-full overflow-hidden mt-2">
                            <div 
                              className={`h-full transition-all duration-500 ease-out ${
                                isFull ? 'bg-red-500' : fillPercentage > 75 ? 'bg-yellow-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${fillPercentage}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-5 px-4 text-center">
                      <button
                        onClick={() => onSelectTeam(team)}
                        disabled={isFull}
                        className={`px-6 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 transform hover:scale-105 ${
                          isFull
                            ? 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
                            : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white shadow-lg shadow-green-900/20'
                        }`}
                      >
                        {isFull ? '✖ Täis' : '✓ Kandideeri'}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export function TeamHeaderSection() {
  const { user } = useAuth()
  const { data: teamStatus, isLoading: statusLoading, refetch: refetchStatus } = useUserTeamStatus()
  const { data: userTeamData, isLoading: teamLoading, refetch: refetchTeam } = useUserTeam()
  
  // Modal state moved to parent component
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)
  const applyForTeamMutation = useApplyForTeam()

  const handleApply = async (teamId: string) => {
    try {
      await applyForTeamMutation.mutateAsync(teamId)
      alert('Taotlus edukalt saadetud!')
      setSelectedTeam(null)
    } catch (error: any) {
      alert(error.message || 'Viga taotluse saatmisel')
    }
  }

  // Refetch team status when component mounts or user changes
  useEffect(() => {
    if (user?.id) {
      refetchStatus()
      refetchTeam()
    }
  }, [user?.id, refetchStatus, refetchTeam])

  if (statusLoading || teamLoading) {
    return (
      <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-12 shadow-2xl">
        <div className="flex justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-slate-600 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-400">Laadin tiimi andmeid...</p>
          </div>
        </div>
      </div>
    )
  }

  // User has no team
  if (!teamStatus?.hasTeam) {
    return (
      <>
        <div className="space-y-8">
          {/* No Team Message with enhanced design */}
          <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-12 shadow-2xl">
            <div className="text-center">
              <div className="w-32 h-32 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-red-900/20">
                <span className="text-6xl animate-pulse">🚫</span>
              </div>
              <h2 className="text-3xl font-bold text-white mb-4 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                Sa ei ole veel seotud ühegi tiimiga
              </h2>
              <p className="text-slate-400 max-w-2xl mx-auto text-lg">
                Liitu mõne olemasoleva tiimiga või loo oma tiim, et hakata võistlema koos teistega.
              </p>
            </div>
          </div>

          {/* Available Teams Table */}
          <AvailableTeamsTable onSelectTeam={setSelectedTeam} />
        </div>
        
        {/* Application Modal - Now outside of the table */}
        {selectedTeam && (
          <TeamApplicationModal
            team={selectedTeam}
            onClose={() => setSelectedTeam(null)}
            onApply={handleApply}
          />
        )}
      </>
    )
  }

  // User has a team - Enhanced design
  if (userTeamData) {
    const { team, isManager } = userTeamData
    const fillPercentage = (team.members_count / team.max_members_count) * 100
    
    return (
      <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-2xl overflow-hidden">
        {/* Team Header with gradient background */}
        <div className="bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 px-8 py-10 border-b border-slate-700/50">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              {isManager && (
                <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center animate-pulse">
                  <span className="text-2xl">👑</span>
                </div>
              )}
              <h2 className="text-3xl font-bold text-white">
                {team.team_name}
              </h2>
            </div>
            <div className="flex items-center justify-center gap-2">
              <span className={`px-4 py-1.5 rounded-full text-sm font-medium ${
                isManager 
                  ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' 
                  : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
              }`}>
                {isManager ? '👑 Tiimi Pealik' : '👥 Tiimi Liige'}
              </span>
            </div>
          </div>
        </div>

        {/* Team Info Grid with cards */}
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Competition Class Card */}
            <div className="bg-slate-900/50 rounded-xl border border-slate-700/50 p-6 hover:border-slate-600/50 transition-all duration-200 group">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <span className="text-xl">🎮</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-slate-400 mb-1">Võistlusklass</p>
                  <p className="text-lg font-semibold text-white">
                    {team.game?.name || 'Määramata'}
                  </p>
                  <p className="text-sm text-slate-500 mt-1">
                    {team.game_class?.name || 'Klass määramata'}
                  </p>
                </div>
              </div>
            </div>

            {/* Team Vehicle Card */}
            <div className="bg-slate-900/50 rounded-xl border border-slate-700/50 p-6 hover:border-slate-600/50 transition-all duration-200 group">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-purple-600/20 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <span className="text-xl">🚗</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-slate-400 mb-1">Tiimi sõiduk</p>
                  <p className="text-lg font-semibold text-white">
                    {team.vehicle?.vehicle_name || 'Määramata'}
                  </p>
                </div>
              </div>
            </div>

            {/* Members Count Card */}
            <div className="bg-slate-900/50 rounded-xl border border-slate-700/50 p-6 hover:border-slate-600/50 transition-all duration-200 group">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-green-600/20 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <span className="text-xl">👥</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-slate-400 mb-1">Liikmete arv</p>
                  <div className="flex items-baseline gap-2 mb-3">
                    <p className="text-2xl font-bold text-white">{team.members_count}</p>
                    <p className="text-lg text-slate-400">/ {team.max_members_count}</p>
                  </div>
                  <div className="w-full h-3 bg-slate-700/50 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ease-out rounded-full ${
                        fillPercentage === 100 ? 'bg-gradient-to-r from-red-500 to-red-600' : 
                        fillPercentage > 75 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' : 
                        'bg-gradient-to-r from-green-500 to-emerald-500'
                      }`}
                      style={{ width: `${fillPercentage}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Manager Info Card - Full width on mobile */}
            <div className="bg-slate-900/50 rounded-xl border border-slate-700/50 p-6 hover:border-slate-600/50 transition-all duration-200 group md:col-span-2 lg:col-span-1">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-yellow-600/20 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <span className="text-xl">👤</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-slate-400 mb-1">Tiimi pealik</p>
                  <p className="text-lg font-semibold text-white">
                    {isManager ? 'Sina' : team.manager?.player_name || 'Teadmata'}
                  </p>
                  {!isManager && team.manager?.player_name && (
                    <p className="text-sm text-slate-500 mt-1">
                      @{team.manager.player_name}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Fallback - user has team but we couldn't load the data
  return (
    <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-12 shadow-2xl">
      <div className="text-center">
        <div className="w-32 h-32 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-yellow-900/20">
          <span className="text-6xl">⚠️</span>
        </div>
        <h2 className="text-3xl font-bold text-white mb-4">
          Tiimi andmete laadimine ebaõnnestus
        </h2>
        <p className="text-slate-400 max-w-2xl mx-auto text-lg">
          Sa kuulud tiimi, kuid me ei saanud hetkel tiimi andmeid laadida. Palun proovi hiljem uuesti.
        </p>
      </div>
    </div>
  )
}