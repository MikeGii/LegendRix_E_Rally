// src/components/teams/TeamsList.tsx
'use client'

import { useTeams } from '@/hooks/useTeams'

export function TeamsList() {
  const { data: teams = [], isLoading } = useTeams()

  if (isLoading) {
    return (
      <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8">
        <div className="flex justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-slate-600 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-400">Laadin tiime...</p>
          </div>
        </div>
      </div>
    )
  }

  if (teams.length === 0) {
    return (
      <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8">
        <div className="text-center">
          <p className="text-slate-400">Ühtegi tiimi pole veel loodud.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8">
      <h2 className="text-xl font-semibold text-white mb-6">Olemasolevad tiimid</h2>
      
      <div className="space-y-4">
        {teams.map((team) => (
          <div
            key={team.id}
            className="bg-slate-900/50 rounded-xl border border-slate-700/50 p-6 hover:bg-slate-800/50 transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-white">{team.team_name}</h3>
                <div className="mt-2 space-y-1">
                  <p className="text-sm text-slate-400">
                    👤 Pealik: {team.manager?.name}
                    {team.manager?.player_name && ` (${team.manager.player_name})`}
                  </p>
                  <p className="text-sm text-slate-400">
                    👥 Liikmeid: {team.members_count} / {team.max_members_count}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {/* Progress bar for members */}
                <div className="w-32 h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 transition-all duration-300"
                    style={{ width: `${(team.members_count / team.max_members_count) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}