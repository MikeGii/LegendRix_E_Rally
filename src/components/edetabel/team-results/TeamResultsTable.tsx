// src/components/edetabel/team-results/TeamResultsTable.tsx
'use client'

import { useState } from 'react'
import type { TeamRallyResult } from '@/hooks/useTeamRallyResults'

interface TeamResultsTableProps {
  teams: TeamRallyResult[]
  selectedClass: string
}

export function TeamResultsTable({ teams, selectedClass }: TeamResultsTableProps) {
  const [expandedTeams, setExpandedTeams] = useState<Set<string>>(new Set())

  const toggleTeam = (teamId: string) => {
    setExpandedTeams(prev => {
      const newSet = new Set(prev)
      if (newSet.has(teamId)) {
        newSet.delete(teamId)
      } else {
        newSet.add(teamId)
      }
      return newSet
    })
  }

  // Group teams by class if showing all classes
  const teamsByClass = selectedClass === 'all' 
    ? teams.reduce((acc, team) => {
        const className = team.class_name
        if (!acc[className]) {
          acc[className] = []
        }
        acc[className].push(team)
        return acc
      }, {} as Record<string, TeamRallyResult[]>)
    : { [selectedClass]: teams }

  // Sort classes
  const sortedClasses = Object.keys(teamsByClass).sort((a, b) => {
    const priorityA = getClassPriority(a)
    const priorityB = getClassPriority(b)
    
    if (priorityA !== priorityB) {
      return priorityA - priorityB
    }
    
    return a.localeCompare(b)
  })

  return (
    <div className="space-y-8">
      {sortedClasses.map(className => (
        <div key={className} className="relative">
          {/* Class Header */}
          {selectedClass === 'all' && (
            <div className="mb-4">
              <h3 className="text-lg font-bold text-red-400 font-['Orbitron'] tracking-wider uppercase">
                {className}
              </h3>
              <div className="mt-2 h-px bg-red-500/30"></div>
            </div>
          )}

          {/* Teams Table */}
          <div className="space-y-2">
            {teamsByClass[className].map((team, index) => (
              <div
                key={team.team_id}
                className="tech-border rounded-xl overflow-hidden transition-all duration-300"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Team Header Row */}
                <div
                  className={`p-4 cursor-pointer transition-all duration-300 hover:bg-red-500/5 ${
                    expandedTeams.has(team.team_id) ? 'bg-red-500/10' : ''
                  }`}
                  onClick={() => toggleTeam(team.team_id)}
                >
                  <div className="flex items-center justify-between">
                    {/* Left side: Position and Team Name */}
                    <div className="flex items-center gap-4">
                      <div className="text-center min-w-[50px]">
                        <div className={`text-2xl font-bold ${getPositionColor(team.team_position)}`}>
                          {team.team_position}.
                        </div>
                        {team.team_position <= 3 && (
                          <div className="text-sm mt-0.5">{getPositionEmoji(team.team_position)}</div>
                        )}
                      </div>
                      
                      <div>
                        <h4 className="text-lg font-bold text-white group-hover:text-red-400 transition-colors">
                          {team.team_name}
                        </h4>
                        <p className="text-sm text-gray-400">
                          {team.member_count} liiget • Top 3 panustajat
                        </p>
                      </div>
                    </div>

                    {/* Right side: Points and Expand Icon */}
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${getPositionColor(team.team_position)}`}>
                          {team.total_points}
                        </div>
                        <div className="text-xs text-gray-500 uppercase">punkti</div>
                      </div>
                      
                      <div className={`transition-transform duration-300 ${
                        expandedTeams.has(team.team_id) ? 'rotate-180' : ''
                      }`}>
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Members Section */}
                {expandedTeams.has(team.team_id) && (
                  <div className="bg-black/30 border-t border-red-500/20 p-4">
                    <div className="space-y-1">
                      {team.members.map((member, idx) => (
                        <div
                          key={`${member.user_id}-${idx}`}
                          className={`flex items-center justify-between py-2 px-3 rounded-lg transition-all duration-200 ${
                            member.contributed
                              ? 'bg-red-500/10 border border-red-500/20'
                              : 'bg-gray-900/30 opacity-60'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className={`text-sm font-medium ${
                              member.contributed ? 'text-red-400' : 'text-gray-500'
                            }`}>
                              {idx + 1}.
                            </span>
                            <span className={`text-sm ${
                              member.contributed ? 'text-white' : 'text-gray-400'
                            }`}>
                              {member.player_name}
                            </span>
                            {member.contributed && idx < 3 && (
                              <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full border border-red-500/30">
                                TOP {idx + 1}
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-bold ${
                              member.contributed ? 'text-red-400' : 'text-gray-500'
                            }`}>
                              {member.points} punkti
                            </span>
                            {!member.contributed && (
                              <span className="text-xs text-gray-500">(ei läinud arvesse)</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Summary */}
                    <div className="mt-3 pt-3 border-t border-red-500/20">
                      <p className="text-xs text-gray-400">
                        * Võistkonna punktisumma arvutatakse 3 parima liikme punktide põhjal
                      </p>
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

// Helper functions
function getClassPriority(className: string): number {
  const lowerName = className.toLowerCase()
  if (lowerName.includes('pro') && !lowerName.includes('semi')) return 1
  if (lowerName.includes('semi')) return 2
  if (lowerName.includes('juunior') || lowerName.includes('junior')) return 3
  return 4
}

function getPositionColor(position: number): string {
  switch (position) {
    case 1:
      return 'text-yellow-400'
    case 2:
      return 'text-gray-300'
    case 3:
      return 'text-orange-400'
    default:
      return 'text-white'
  }
}

function getPositionEmoji(position: number): string {
  switch (position) {
    case 1:
      return '🥇'
    case 2:
      return '🥈'
    case 3:
      return '🥉'
    default:
      return ''
  }
}