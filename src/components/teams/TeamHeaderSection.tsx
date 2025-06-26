// src/components/teams/TeamHeaderSection.tsx
'use client'

import { useUserTeamStatus, useUserTeam } from '@/hooks/useTeams'
import { useAuth } from '@/components/AuthProvider'

export function TeamHeaderSection() {
  const { user } = useAuth()
  const { data: teamStatus, isLoading: statusLoading } = useUserTeamStatus()
  const { data: userTeamData, isLoading: teamLoading } = useUserTeam()

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