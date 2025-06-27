// src/components/edetabel/rally-results/RallyResultsTable.tsx
'use client'

import { ClickablePlayerName } from '@/components/player/ClickablePlayerName'
import { getPositionColor, getPodiumIcon } from './helpers'

interface RallyResultsTableProps {
  results: any[]
  onPlayerModalStateChange: (isOpen: boolean) => void
}

export function RallyResultsTable({ 
  results, 
  onPlayerModalStateChange
}: RallyResultsTableProps) {
  // Sort results by class position
  const sortedResults = [...results].sort((a, b) => {
    const aPos = a.class_position || 999
    const bPos = b.class_position || 999
    
    if (aPos !== bPos) {
      return aPos - bPos
    }
    
    // If positions are equal, sort by overall points
    return (b.overall_points || 0) - (a.overall_points || 0)
  })

  // Check if any results have extra points
  const hasExtraPoints = results.some(result => result.extra_points > 0)

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-800">
            <th className="text-left py-3 px-4 text-sm font-['Orbitron'] text-gray-400 uppercase tracking-wider">
              Koht
            </th>
            <th className="text-left py-3 px-4 text-sm font-['Orbitron'] text-gray-400 uppercase tracking-wider">
              Mängija nimi
            </th>
            <th className="text-center py-3 px-4 text-sm font-['Orbitron'] text-gray-400 uppercase tracking-wider">
              Klass
            </th>
            <th className="text-center py-3 px-4 text-sm font-['Orbitron'] text-gray-400 uppercase tracking-wider">
              Punktid
            </th>
            <th className="text-center py-3 px-4 text-sm font-['Orbitron'] text-gray-400 uppercase tracking-wider">
              Lisapunktid
            </th>
            <th className="text-center py-3 px-4 text-sm font-['Orbitron'] text-gray-400 uppercase tracking-wider">
              Punktid kokku
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedResults.map((result, index) => {
            const isRegisteredUser = result.user_id && result.user_id !== 'manual-participant'
            
            return (
              <tr 
                key={result.id} 
                className="border-b border-gray-800/50 hover:bg-gray-900/30 transition-colors"
              >
                <td className="py-3 px-4">
                  <div className="flex items-center space-x-2">
                    <span className={`font-bold ${getPositionColor(result.class_position)}`}>
                      {result.class_position || '-'}
                    </span>
                    <span>{getPodiumIcon(result.class_position)}</span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  {isRegisteredUser ? (
                    <ClickablePlayerName
                      playerName={result.participant_name}
                      userId={result.user_id}
                      participantType="registered"
                      className="text-white hover:text-red-400 transition-colors cursor-pointer"
                      onModalOpen={() => onPlayerModalStateChange(true)}
                      onModalClose={() => onPlayerModalStateChange(false)}
                    />
                  ) : (
                    <ClickablePlayerName
                      playerName={result.participant_name}
                      participantType="manual"
                      className="text-gray-400"
                    />
                  )}
                </td>
                <td className="py-3 px-4 text-center text-gray-300">
                  {result.class_name}
                </td>
                <td className="py-3 px-4 text-center font-semibold text-gray-300">
                  {result.total_points || 0}
                </td>
                <td className="py-3 px-4 text-center">
                  <span className={result.extra_points > 0 ? 'text-green-400 font-semibold' : 'text-gray-500'}>
                    {result.extra_points > 0 ? `+${result.extra_points}` : '-'}
                  </span>
                </td>
                <td className="py-3 px-4 text-center">
                  <span className="font-bold text-red-400 text-lg">
                    {result.overall_points || 0}
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