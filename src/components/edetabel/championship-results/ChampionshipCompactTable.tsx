// src/components/edetabel/championship-results/ChampionshipCompactTable.tsx
'use client'

import { ClickablePlayerName } from '@/components/player/ClickablePlayerName'
import { getPositionColor, getPodiumIcon } from '../rally-results/helpers'

interface ChampionshipCompactTableProps {
  participants: any[]
  sortedRallies: any[]
  onPlayerModalStateChange: (isOpen: boolean) => void
}

export function ChampionshipCompactTable({ 
  participants, 
  sortedRallies,
  onPlayerModalStateChange
}: ChampionshipCompactTableProps) {
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

  // Determine if we need ultra-compact mode
  const isCompact = sortedRallies.length > 15

  return (
    <div className="bg-gray-900/20 rounded-xl overflow-hidden">
      {/* Grid Header */}
      <div 
        className="sticky top-0 bg-gray-900/50 backdrop-blur-sm border-b border-gray-800 text-xs font-['Orbitron'] text-gray-400 uppercase tracking-wider"
      >
        <div 
          className="grid gap-1 py-2 px-3"
          style={{
            gridTemplateColumns: isCompact 
              ? `60px 1fr 80px ${sortedRallies.map(() => '40px').join(' ')} 60px`
              : `1fr 2fr 1fr ${sortedRallies.map(() => '1fr').join(' ')} 1fr`
          }}
        >
          <div className="text-center">Koht</div>
          <div className="text-left">Osaleja</div>
          <div className="text-center">Klass</div>
          {sortedRallies.map((_, index) => (
            <div key={index} className="text-center text-red-400">
              E{index + 1}
            </div>
          ))}
          <div className="text-center">Punktid</div>
        </div>
      </div>

      {/* Grid Body */}
      <div className="divide-y divide-gray-800/50">
        {participants.map((participant, index) => {
          const position = participant.championship_position
          const isTopThree = position && position <= 3
          
          return (
            <div 
              key={participant.participant_key || `${participant.participant_name}-${index}`}
              className={`
                grid gap-1 py-2 px-3 text-sm hover:bg-gray-800/30 transition-colors
                ${isTopThree ? 'bg-gradient-to-r from-gray-800/30 to-transparent' : ''}
                ${index % 2 === 0 ? 'bg-gray-900/10' : ''}
              `}
              style={{
                gridTemplateColumns: isCompact 
                  ? `60px 1fr 80px ${sortedRallies.map(() => '40px').join(' ')} 60px`
                  : `1fr 2fr 1fr ${sortedRallies.map(() => '1fr').join(' ')} 1fr`
              }}
            >
              {/* Position */}
              <div className="text-center flex items-center justify-center">
                <span className={`font-bold ${getPositionColor(position)}`}>
                  {position || '-'}
                </span>
                {!isCompact && <span className="ml-1">{getPodiumIcon(position)}</span>}
              </div>

              {/* Name */}
              <div className="justify-self-start w-full">
                {renderParticipantName(participant)}
              </div>

              {/* Class */}
              <div className="text-center text-gray-300 text-sm">
                {participant.class_name}
              </div>

              {/* Rally Scores */}
              {sortedRallies.map((rally) => {
                const rallyScore = participant.rally_scores.find(rs => rs.rally_id === rally.rally_id)
                return (
                  <div key={rally.rally_id} className="text-center">
                    {rallyScore?.participated ? (
                      <div className="flex flex-col items-center">
                        <span className="text-white font-medium text-xs">
                          {rallyScore.overall_points}
                        </span>
                        {!isCompact && rallyScore.class_position && (
                          <span className="text-xs text-gray-500">
                            {rallyScore.class_position}.
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-600 text-xs">-</span>
                    )}
                  </div>
                )
              })}

              {/* Total Points */}
              <div className="text-center">
                <span className={`font-bold text-sm ${getPositionColor(position)}`}>
                  {participant.total_overall_points}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}