// src/components/results/TeamResultsInterface.tsx
'use client'

import { useState } from 'react'
import { useTeamRallyResults } from '@/hooks/useTeamRallyResults'
import { LoadingState } from '@/components/shared/States'

interface TeamResultsInterfaceProps {
  rallyId: string
  rallyName: string
}

export function TeamResultsInterface({ rallyId, rallyName }: TeamResultsInterfaceProps) {
  const [expandedTeams, setExpandedTeams] = useState<Set<string>>(new Set())
  const [selectedClass, setSelectedClass] = useState<string>('all')
  
  const { data: teamResults = [], isLoading, error } = useTeamRallyResults(rallyId)

  // Debug logging
  console.log('Team Results Data:', teamResults)

  // Get unique classes
  const classes = Array.from(new Set(teamResults.map(t => t.class_name))).sort()

  // Filter results by selected class
  const filteredResults = selectedClass === 'all' 
    ? teamResults 
    : teamResults.filter(t => t.class_name === selectedClass)

  // Group by class for display
  const resultsByClass = filteredResults.reduce((acc, result) => {
    if (!acc[result.class_name]) {
      acc[result.class_name] = []
    }
    acc[result.class_name].push(result)
    return acc
  }, {} as Record<string, typeof teamResults>)

  const toggleTeamExpansion = (teamId: string) => {
    const newExpanded = new Set(expandedTeams)
    if (newExpanded.has(teamId)) {
      newExpanded.delete(teamId)
    } else {
      newExpanded.add(teamId)
    }
    setExpandedTeams(newExpanded)
  }

  const getPositionColor = (position: number) => {
    switch (position) {
      case 1: return 'text-yellow-400'
      case 2: return 'text-slate-300'
      case 3: return 'text-orange-400'
      default: return 'text-slate-400'
    }
  }

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1: return '🥇'
      case 2: return '🥈'
      case 3: return '🥉'
      default: return ''
    }
  }

  if (isLoading) {
    return <LoadingState message="Laen võistkondlikke tulemusi..." />
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-6 text-center">
        <p className="text-red-400">Viga tulemuste laadimisel</p>
        <p className="text-sm text-red-400/70 mt-1">{error.message}</p>
      </div>
    )
  }

  if (teamResults.length === 0) {
    return (
      <div className="bg-slate-800/30 backdrop-blur-xl rounded-xl border border-slate-700/50 p-8 text-center">
        <div className="w-16 h-16 bg-slate-700/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">👥</span>
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">Võistkondlikke tulemusi pole</h3>
        <p className="text-slate-400 text-sm">
          Selle ralli kohta pole veel võistkondlikke tulemusi arvutatud.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with class filter */}
      <div className="bg-slate-800/30 backdrop-blur-xl rounded-xl border border-slate-700/50 p-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-lg font-semibold text-white">Võistkondlikud tulemused</h2>
            <p className="text-sm text-slate-400 mt-1">{rallyName}</p>
          </div>
          
          {/* Class filter */}
          {classes.length > 1 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-400">Klass:</span>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="bg-slate-800/50 border border-slate-600/50 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500/50"
              >
                <option value="all">Kõik klassid</option>
                {classes.map(cls => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Results by class */}
      {Object.entries(resultsByClass).map(([className, classResults]) => (
        <div key={className} className="bg-slate-800/30 backdrop-blur-xl rounded-xl border border-slate-700/50">
          {/* Class header */}
          <div className="px-6 py-4 border-b border-slate-700/50">
            <h3 className="text-base font-semibold text-white">{className}</h3>
            <p className="text-sm text-slate-400 mt-1">{classResults.length} võistkonda</p>
          </div>

          {/* Team results */}
          <div className="divide-y divide-slate-700/30">
            {classResults.map((team) => (
              <div key={team.team_id} className="relative">
                {/* Team summary row */}
                <div
                  className={`
                    px-6 py-4 cursor-pointer transition-colors hover:bg-slate-700/20
                    ${expandedTeams.has(team.team_id) ? 'bg-slate-700/10' : ''}
                  `}
                  onClick={() => toggleTeamExpansion(team.team_id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {/* Position */}
                      <div className="text-center min-w-[40px]">
                        <div className={`text-2xl font-bold ${getPositionColor(team.team_position)}`}>
                          {team.team_position}
                        </div>
                        {team.team_position <= 3 && (
                          <div className="text-lg">{getPositionIcon(team.team_position)}</div>
                        )}
                      </div>

                      {/* Team info */}
                      <div>
                        <h4 className="text-base font-medium text-white">{team.team_name}</h4>
                        <p className="text-sm text-slate-400">
                          {team.member_count} liiget • {team.members?.filter(m => m.contributed).length || 0} panustajat
                        </p>
                      </div>
                    </div>

                    {/* Points and expand icon */}
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${getPositionColor(team.team_position)}`}>
                          {team.total_points}
                        </div>
                        <div className="text-xs text-slate-500">punkti</div>
                      </div>
                      <div className={`transition-transform ${expandedTeams.has(team.team_id) ? 'rotate-180' : ''}`}>
                        <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded member details */}
                {expandedTeams.has(team.team_id) && (
                  <div className="bg-slate-900/30 border-t border-slate-700/30">
                    <div className="px-6 py-3">
                      <h5 className="text-sm font-medium text-slate-300 mb-3">Võistkonna liikmed</h5>
                      <div className="space-y-2">
                        {team.members && team.members.length > 0 ? (
                          team.members.map((member, idx) => (
                            <div 
                              key={`${team.team_id}-${member.user_id || idx}`}
                              className={`
                                flex items-center justify-between py-2 px-3 rounded-lg
                                ${member.contributed 
                                  ? 'bg-slate-800/50 border border-slate-700/50' 
                                  : 'opacity-60'
                                }
                              `}
                            >
                              <div className="flex items-center gap-3">
                                <span className="text-sm text-slate-500 min-w-[20px]">
                                  {idx + 1}.
                                </span>
                                <div>
                                  <span className="text-sm text-white">{member.player_name || 'Tundmatu mängija'}</span>
                                  {member.contributed && (
                                    <span className="ml-2 text-xs text-green-400">✓ Arvestatud</span>
                                  )}
                                </div>
                              </div>
                              <div className="text-sm font-medium text-slate-300">
                                {member.points} punkti
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-slate-500 text-center py-3">
                            Võistkonna liikmete andmed puuduvad
                          </p>
                        )}
                      </div>
                      {team.members && team.members.length > 3 && (
                        <p className="text-xs text-slate-500 mt-3 text-center">
                          * Võistkonna tulemusse läheb 3 parima liikme punktisumma
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}