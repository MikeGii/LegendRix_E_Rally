// src/components/teams/TeamHeaderSection.tsx
'use client'

import { useState, useEffect } from 'react'
import { useUserTeamStatus, useUserTeam, useTeams, useApplyForTeam, Team } from '@/hooks/useTeams'
import { useAuth } from '@/components/AuthProvider'
import { TeamApplicationModal } from './TeamApplicationModal'

// Available Teams Table Component
function AvailableTeamsTable() {
  const { data: teams = [], isLoading } = useTeams()
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

  if (isLoading) {
    return (
      <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8">
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
    <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8">
      <h3 className="text-xl font-semibold text-white mb-6">Saadaolevad tiimid</h3>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700/50">
              <th className="text-left py-3 px-4 text-sm font-medium text-slate-300">Tiimi nimi</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-slate-300">Mäng / Klass</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-slate-300">Tiimi pealik</th>
              <th className="text-center py-3 px-4 text-sm font-medium text-slate-300">Liikmete arv</th>
              <th className="text-center py-3 px-4 text-sm font-medium text-slate-300">Max liikmeid</th>
              <th className="text-center py-3 px-4 text-sm font-medium text-slate-300">Tegevus</th>
            </tr>
          </thead>
          <tbody>
            {teams.map((team, index) => (
              <tr 
                key={team.id}
                className={`border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors ${
                  index % 2 === 0 ? 'bg-slate-900/20' : ''
                }`}
              >
                <td className="py-4 px-4 text-white font-medium">{team.team_name}</td>
                <td className="py-4 px-4 text-slate-300">
                  <div>
                    <p className="text-sm">{team.game?.name || 'N/A'}</p>
                    <p className="text-xs text-slate-400">{team.game_class?.name || 'N/A'}</p>
                  </div>
                </td>
                <td className="py-4 px-4 text-slate-300">
                  {team.manager?.name}
                  {team.manager?.player_name && (
                    <span className="text-sm text-slate-400 ml-1">
                      ({team.manager.player_name})
                    </span>
                  )}
                </td>
                <td className="py-4 px-4 text-center text-slate-300">{team.members_count}</td>
                <td className="py-4 px-4 text-center text-slate-300">{team.max_members_count}</td>
                <td className="py-4 px-4 text-center">
                  <button
                    onClick={() => setSelectedTeam(team)}
                    disabled={team.members_count >= team.max_members_count}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                      team.members_count >= team.max_members_count
                        ? 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
                        : 'bg-green-600/20 hover:bg-green-600/30 text-green-400 hover:text-green-300'
                    }`}
                  >
                    {team.members_count >= team.max_members_count ? 'Täis' : 'Kandideeri'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Application Modal */}
      {selectedTeam && (
        <TeamApplicationModal
          team={selectedTeam}
          onClose={() => setSelectedTeam(null)}
          onApply={handleApply}
        />
      )}
    </div>
  )
}

export function TeamHeaderSection() {
  const { user } = useAuth()
  const { data: teamStatus, isLoading: statusLoading, refetch: refetchStatus } = useUserTeamStatus()
  const { data: userTeamData, isLoading: teamLoading, refetch: refetchTeam } = useUserTeam()

  // Refetch team status when component mounts or user changes
  useEffect(() => {
    if (user?.id) {
      refetchStatus()
      refetchTeam()
    }
  }, [user?.id, refetchStatus, refetchTeam])

  if (statusLoading || teamLoading) {
    return (
      <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-12">
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
      <div className="space-y-8">
        {/* No Team Message */}
        <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-12">
          <div className="text-center">
            <div className="w-24 h-24 bg-red-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <span className="text-5xl">🚫</span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">
              Sa ei ole veel seotud ühegi tiimiga
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Liitu mõne olemasoleva tiimiga või loo oma tiim, et hakata võistlema koos teistega.
            </p>
          </div>
        </div>

        {/* Available Teams Table */}
        <AvailableTeamsTable />
      </div>
    )
  }

  // User has a team
  if (userTeamData) {
    const { team, isManager } = userTeamData
    
    return (
      <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8">
        {/* Welcome Message */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">
            {isManager 
              ? `Tere tulemast ${team.team_name} manageerija`
              : `Tere tulemast ${team.team_name} liige`
            }
          </h2>
          <p className="text-slate-400">
            {isManager 
              ? '👑 Sa oled selle tiimi pealik'
              : '👥 Sa oled selle tiimi liige'
            }
          </p>
        </div>

        {/* Team Info */}
        <div className="bg-slate-900/50 rounded-xl border border-slate-700/50 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Team Name */}
            <div>
              <p className="text-sm text-slate-400 mb-1">Tiimi nimi</p>
              <p className="text-lg font-medium text-white">{team.team_name}</p>
            </div>

            {/* Members Count */}
            <div>
              <p className="text-sm text-slate-400 mb-1">Liikmete arv</p>
              <p className="text-lg font-medium text-white">
                {team.members_count} / {team.max_members_count}
              </p>
              <div className="mt-2 w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 transition-all duration-300"
                  style={{ width: `${(team.members_count / team.max_members_count) * 100}%` }}
                />
              </div>
            </div>

            {/* Manager Info */}
            <div>
              <p className="text-sm text-slate-400 mb-1">Tiimi pealik</p>
              <p className="text-lg font-medium text-white">
                {isManager ? 'Sina' : team.manager?.name || 'Teadmata'}
                {!isManager && team.manager?.player_name && (
                  <span className="text-sm text-slate-400 ml-2">
                    ({team.manager.player_name})
                  </span>
                )}
              </p>
            </div>
          </div>


        </div>
      </div>
    )
  }

  // Fallback - user has team but we couldn't load the data
  return (
    <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-12">
      <div className="text-center">
        <div className="w-24 h-24 bg-yellow-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <span className="text-5xl">⚠️</span>
        </div>
        <h2 className="text-2xl font-bold text-white mb-4">
          Tiimi andmete laadimine ebaõnnestus
        </h2>
        <p className="text-slate-400 max-w-2xl mx-auto">
          Sa kuulud tiimi, kuid me ei saanud hetkel tiimi andmeid laadida. Palun proovi hiljem uuesti.
        </p>
      </div>
    </div>
  )
}