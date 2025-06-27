// src/components/edetabel/championship-results/ChampionshipResultsTable.tsx
'use client'

import { ClickablePlayerName } from '@/components/player/ClickablePlayerName'
import { getPositionColor, getPodiumIcon } from '../rally-results/helpers'

interface ChampionshipResultsTableProps {
  participants: any[]
  sortedRallies: any[]
  showClass?: boolean
  onPlayerModalStateChange: (isOpen: boolean) => void
}

export function ChampionshipResultsTable({ 
  participants, 
  sortedRallies,
  showClass = true,
  onPlayerModalStateChange
}: ChampionshipResultsTableProps) {
  // Sort participants by championship position
  const sortedParticipants = [...participants].sort((a, b) => {
    const aPos = a.championship_position || 999
    const bPos = b.championship_position || 999
    
    if (aPos !== bPos) {
      return aPos - bPos
    }
    
    // If positions are equal, sort by overall points
    return (b.total_overall_points || 0) - (a.total_overall_points || 0)
  })

  const renderParticipantName = (participant: any) => {
    const isRegisteredUser = participant.user_id && participant.user_id !== 'manual-participant'

    if (isRegisteredUser) {
      return (
        <ClickablePlayerName
          userId={participant.user_id}
          playerName={participant.participant_name}
          participantType="registered"
          className="text-white font-medium hover:text-red-400 transition-colors"
          onModalOpen={() => onPlayerModalStateChange(true)}
          onModalClose={() => onPlayerModalStateChange(false)}
        />
      )
    } else {
      return (
        <ClickablePlayerName
          playerName={participant.participant_name}
          participantType="manual"
          className="font-medium text-gray-400"
        />
      )
    }
  }

  // Determine if we need compact mode based on rally count
  const isCompact = sortedRallies.length > 15

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="sticky top-0 bg-black/90 backdrop-blur-xl">
          <tr className="border-b border-gray-800">
            <th className="sticky left-0 z-20 bg-black/90 px-3 py-3 text-left text-sm font-['Orbitron'] text-gray-400 uppercase tracking-wider border-r border-gray-800">
              Koht
            </th>
            <th className="sticky left-[60px] z-20 bg-black/90 px-3 py-3 text-left text-sm font-['Orbitron'] text-gray-400 uppercase tracking-wider border-r border-gray-800">
              Osaleja
            </th>
            {showClass && (
              <th className="sticky left-[220px] z-20 bg-black/90 px-3 py-3 text-left text-sm font-['Orbitron'] text-gray-400 uppercase tracking-wider border-r border-gray-800">
                Klass
              </th>
            )}
            
            {/* Rally Headers */}
            {sortedRallies.map((rally, index) => (
              <th key={rally.rally_id} className="px-2 py-3 text-center text-sm font-['Orbitron'] text-gray-400">
                <div className="flex flex-col items-center">
                  <span className="text-red-400">E{index + 1}</span>
                  {!isCompact && (
                    <span className="text-xs text-gray-500 mt-1">{rally.rally_name}</span>
                  )}
                </div>
              </th>
            ))}
            
            {/* Points Headers */}
            <th className="px-3 py-3 text-center text-sm font-['Orbitron'] text-gray-400 uppercase tracking-wider bg-green-900/20">
              Punktid
            </th>
            <th className="px-3 py-3 text-center text-sm font-['Orbitron'] text-gray-400 uppercase tracking-wider bg-orange-900/20">
              Lisa
            </th>
            <th className="px-3 py-3 text-center text-sm font-['Orbitron'] text-gray-400 uppercase tracking-wider bg-red-900/20">
              Kokku
            </th>
            <th className="px-3 py-3 text-center text-sm font-['Orbitron'] text-gray-400 uppercase tracking-wider">
              Etappe
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedParticipants.map((participant, index) => {
            const position = participant.championship_position
            const isTopThree = position && position <= 3
            
            return (
              <tr 
                key={participant.participant_key || `${participant.participant_name}-${index}`}
                className={`
                  border-b border-gray-900 hover:bg-gray-900/30 transition-colors
                  ${isTopThree ? 'bg-gradient-to-r from-gray-900/50 to-gray-900/30' : ''}
                  ${index % 2 === 0 ? 'bg-gray-900/20' : 'bg-gray-900/10'}
                `}
              >
                {/* Position */}
                <td className="sticky left-0 z-10 bg-black/80 px-3 py-2 border-r border-gray-800">
                  <div className="flex items-center space-x-2">
                    <span className={`font-bold ${getPositionColor(position)}`}>
                      {position || '-'}
                    </span>
                    <span>{getPodiumIcon(position)}</span>
                  </div>
                </td>
                
                {/* Name */}
                <td className="sticky left-[60px] z-10 bg-black/80 px-3 py-2 border-r border-gray-800">
                  {renderParticipantName(participant)}
                </td>
                
                {/* Class */}
                {showClass && (
                  <td className="sticky left-[220px] z-10 bg-black/80 px-3 py-2 text-gray-300 text-sm border-r border-gray-800">
                    {participant.class_name}
                  </td>
                )}
                
                {/* Rally Scores */}
                {sortedRallies.map((rally) => {
                  const rallyScore = participant.rally_scores.find(rs => rs.rally_id === rally.rally_id)
                  return (
                    <td key={rally.rally_id} className="px-2 py-2 text-center">
                      {rallyScore?.participated ? (
                        <div className="flex flex-col items-center">
                          <span className="text-white font-medium text-sm">
                            {rallyScore.overall_points}
                          </span>
                          {rallyScore.class_position && (
                            <span className="text-xs text-gray-500">
                              {rallyScore.class_position}.
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-600">-</span>
                      )}
                    </td>
                  )
                })}
                
                {/* Points Columns */}
                <td className="px-3 py-2 text-center bg-green-900/10">
                  <span className="text-green-400 font-semibold">
                    {participant.total_rally_points}
                  </span>
                </td>
                <td className="px-3 py-2 text-center bg-orange-900/10">
                  <span className="text-orange-400 font-semibold">
                    {participant.total_extra_points}
                  </span>
                </td>
                <td className="px-3 py-2 text-center bg-red-900/10">
                  <span className="text-red-400 font-bold text-lg">
                    {participant.total_overall_points}
                  </span>
                </td>
                <td className="px-3 py-2 text-center">
                  <span className="text-gray-300">
                    {participant.rounds_participated}
                  </span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}