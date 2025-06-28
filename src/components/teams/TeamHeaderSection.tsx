// src/components/teams/TeamHeaderSection.tsx
'use client'

import { useState, useEffect } from 'react'
import { useUserTeamStatus, useUserTeam, useTeams, useApplyForTeam, Team } from '@/hooks/useTeams'
import { useAuth } from '@/components/AuthProvider'
import { TeamApplicationModal } from './TeamApplicationModal'

// Available Teams Table Component with futuristic design
function AvailableTeamsTable({ onSelectTeam }: { onSelectTeam: (team: Team) => void }) {
  const { data: teams = [], isLoading } = useTeams()

  if (isLoading) {
    return (
      <div className="relative bg-gradient-to-br from-gray-900/90 to-black backdrop-blur-xl rounded-2xl border border-red-500/20 p-8 overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-[0.02] pointer-events-none"></div>
        <div className="flex justify-center relative z-10">
          <div className="text-center">
            <div className="w-12 h-12 border-2 border-gray-700 border-t-red-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400 font-['Orbitron'] uppercase tracking-wider">Laadin saadaolevaid tiime...</p>
          </div>
        </div>
      </div>
    )
  }

  if (teams.length === 0) {
    return null
  }

  return (
    <div className="relative bg-gradient-to-br from-gray-900/90 to-black backdrop-blur-xl rounded-2xl border border-red-500/20 overflow-hidden">
      {/* Animated background pattern */}
      <div className="absolute inset-0 grid-pattern opacity-[0.02] pointer-events-none"></div>
      
      {/* Gradient orb for ambience */}
      <div className="absolute bottom-0 right-0 w-64 h-64 gradient-orb gradient-orb-orange opacity-10"></div>
      
      {/* Header */}
      <div className="relative z-10 px-8 py-6 border-b border-red-500/20 bg-black/30">
        <h3 className="text-xl font-bold text-white font-['Orbitron'] uppercase tracking-wider flex items-center gap-3">
          <span className="text-red-500 text-2xl">⬢</span>
          Saadaolevad tiimid
        </h3>
      </div>
      
      {/* Table */}
      <div className="relative z-10 p-8">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-red-500/20">
                <th className="text-left py-4 px-4 text-sm font-bold text-gray-400 font-['Orbitron'] uppercase tracking-wider">
                  Tiimi nimi
                </th>
                <th className="text-left py-4 px-4 text-sm font-bold text-gray-400 font-['Orbitron'] uppercase tracking-wider">
                  Mäng / Klass
                </th>
                <th className="text-left py-4 px-4 text-sm font-bold text-gray-400 font-['Orbitron'] uppercase tracking-wider">
                  Pealik
                </th>
                <th className="text-center py-4 px-4 text-sm font-bold text-gray-400 font-['Orbitron'] uppercase tracking-wider">
                  Liikmed
                </th>
                <th className="text-center py-4 px-4 text-sm font-bold text-gray-400 font-['Orbitron'] uppercase tracking-wider">
                  Tegevus
                </th>
              </tr>
            </thead>
            <tbody>
              {teams.map((team, index) => {
                const fillPercentage = (team.members_count / team.max_members_count) * 100
                const isFull = fillPercentage >= 100
                
                return (
                  <tr 
                    key={team.id} 
                    className={`border-b border-gray-800/50 transition-all duration-300 hover:bg-red-500/5 ${
                      index % 2 === 0 ? 'bg-gray-900/20' : ''
                    }`}
                  >
                    <td className="py-5 px-4">
                      <div className="font-bold text-white hover:text-red-400 transition-colors">
                        {team.team_name}
                      </div>
                    </td>
                    <td className="py-5 px-4">
                      <div>
                        <p className="text-sm text-white font-medium">{team.game?.name || 'N/A'}</p>
                        <p className="text-xs text-gray-500 mt-1 font-['Orbitron']">{team.game_class?.name || 'N/A'}</p>
                      </div>
                    </td>
                    <td className="py-5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-red-900/30 to-red-800/20 border border-red-500/30 rounded-lg flex items-center justify-center">
                          <span className="text-xs">👤</span>
                        </div>
                        <div>
                          <p className="text-sm text-gray-300">{team.manager?.player_name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-5 px-4">
                      <div className="flex items-center justify-center gap-3">
                        <div className="flex flex-col items-center">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold text-white font-['Orbitron']">{team.members_count}</span>
                            <span className="text-gray-500">/</span>
                            <span className="text-lg text-gray-400 font-['Orbitron']">{team.max_members_count}</span>
                          </div>
                          <div className="w-24 h-1 bg-gray-800 rounded-full overflow-hidden mt-2">
                            <div 
                              className={`h-full transition-all duration-500 ease-out ${
                                isFull ? 'bg-red-500' : fillPercentage > 75 ? 'bg-orange-500' : 'bg-green-500'
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
                        className={`px-6 py-2.5 rounded-xl font-['Orbitron'] uppercase tracking-wider text-sm font-bold transition-all duration-200 transform hover:scale-105 ${
                          isFull
                            ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'
                            : 'futuristic-btn bg-gradient-to-r from-green-900/50 to-green-800/30 border border-green-500/50 text-green-400 hover:shadow-[0_0_20px_rgba(34,197,94,0.5)]'
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
      <div className="relative bg-gradient-to-br from-gray-900/90 to-black backdrop-blur-xl rounded-2xl border border-red-500/20 p-12 overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-[0.02] pointer-events-none"></div>
        <div className="flex justify-center relative z-10">
          <div className="text-center">
            <div className="w-12 h-12 border-2 border-gray-700 border-t-red-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400 font-['Orbitron'] uppercase tracking-wider">Laadin tiimi andmeid...</p>
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
          {/* No Team Message with futuristic design */}
          <div className="relative bg-gradient-to-br from-gray-900/90 to-black backdrop-blur-xl rounded-2xl border border-red-500/20 p-12 overflow-hidden">
            {/* Animated background pattern */}
            <div className="absolute inset-0 grid-pattern opacity-[0.02] pointer-events-none"></div>
            
            {/* Gradient orbs */}
            <div className="absolute top-0 left-0 w-48 h-48 gradient-orb gradient-orb-red opacity-20"></div>
            <div className="absolute bottom-0 right-0 w-48 h-48 gradient-orb gradient-orb-orange opacity-20"></div>
            
            <div className="text-center relative z-10">
              <div className="w-32 h-32 bg-gradient-to-br from-red-900/30 to-orange-900/20 border border-red-500/30 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(255,0,64,0.3)]">
                <span className="text-6xl animate-pulse">🚫</span>
              </div>
              <h2 className="text-3xl font-black text-white mb-4 font-['Orbitron'] uppercase tracking-wider">
                <span className="text-glow-red">Sa ei ole veel seotud ühegi tiimiga</span>
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto text-lg">
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

  // User has a team - Futuristic design
  if (userTeamData) {
    const { team, isManager } = userTeamData
    const fillPercentage = (team.members_count / team.max_members_count) * 100
    
    return (
      <div className="relative bg-gradient-to-br from-gray-900/90 to-black backdrop-blur-xl rounded-2xl border border-red-500/20 overflow-hidden">
        {/* Animated background pattern */}
        <div className="absolute inset-0 grid-pattern opacity-[0.02] pointer-events-none"></div>
        
        {/* Team Header with gradient background */}
        <div className="relative bg-gradient-to-r from-red-500/10 via-purple-500/10 to-orange-500/10 px-8 py-10 border-b border-red-500/20">
          <div className="absolute inset-0 scan-line"></div>
          
          <div className="text-center relative z-10">
            <div className="flex items-center justify-center gap-3 mb-4">
              {isManager && (
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-500/30 to-orange-500/20 border border-yellow-500/50 rounded-xl flex items-center justify-center animate-pulse shadow-[0_0_20px_rgba(234,179,8,0.5)]">
                  <span className="text-2xl">👑</span>
                </div>
              )}
              <h2 className="text-3xl font-black text-white font-['Orbitron'] uppercase tracking-wider">
                <span className="text-glow-red">{team.team_name}</span>
              </h2>
            </div>
            <div className="flex items-center justify-center gap-2">
              <span className={`px-4 py-1.5 rounded-full text-sm font-bold font-['Orbitron'] uppercase tracking-wider ${
                isManager 
                  ? 'bg-gradient-to-r from-yellow-900/30 to-orange-900/20 text-yellow-400 border border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.3)]' 
                  : 'bg-gradient-to-r from-purple-900/30 to-purple-800/20 text-purple-400 border border-purple-500/50'
              }`}>
                {isManager ? '👑 Tiimi Pealik' : '👥 Tiimi Liige'}
              </span>
            </div>
          </div>
        </div>

        {/* Team Info Grid with futuristic cards */}
        <div className="relative z-10 p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Competition Class Card */}
            <div className="group tech-border rounded-xl p-6 bg-gradient-to-br from-gray-900/50 to-black/50 hover:shadow-[0_0_30px_rgba(255,0,64,0.2)] transition-all duration-300">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-900/30 to-purple-800/20 border border-purple-500/30 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <span className="text-xl text-purple-400">◈</span>
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-1 font-['Orbitron'] uppercase tracking-wider">Võistlusklass</p>
                  <p className="text-lg font-bold text-white">
                    {team.game?.name || 'Määramata'}
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    {team.game_class?.name || 'Klass määramata'}
                  </p>
                </div>
              </div>
            </div>

            {/* Vehicle Card */}
            <div className="group tech-border rounded-xl p-6 bg-gradient-to-br from-gray-900/50 to-black/50 hover:shadow-[0_0_30px_rgba(255,69,0,0.2)] transition-all duration-300">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-900/30 to-orange-800/20 border border-orange-500/30 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <span className="text-xl text-orange-400">◆</span>
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-1 font-['Orbitron'] uppercase tracking-wider">Sõiduk</p>
                  <p className="text-lg font-bold text-white">
                    {team.vehicle?.vehicle_name || 'Määramata'}
                  </p>
                </div>
              </div>
            </div>

            {/* Members Card */}
            <div className="group tech-border rounded-xl p-6 bg-gradient-to-br from-gray-900/50 to-black/50 hover:shadow-[0_0_30px_rgba(255,0,64,0.2)] transition-all duration-300">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-red-900/30 to-red-800/20 border border-red-500/30 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <span className="text-xl text-red-400">◉</span>
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-1 font-['Orbitron'] uppercase tracking-wider">Tiimi täituvus</p>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl font-bold text-white font-['Orbitron']">{team.members_count}</span>
                    <span className="text-gray-500">/</span>
                    <span className="text-lg text-gray-400 font-['Orbitron']">{team.max_members_count}</span>
                  </div>
                  <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ease-out ${
                        fillPercentage >= 100 ? 'bg-red-500' : fillPercentage > 75 ? 'bg-orange-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${fillPercentage}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return null
}