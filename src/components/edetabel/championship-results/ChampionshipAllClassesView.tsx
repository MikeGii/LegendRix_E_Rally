// src/components/edetabel/championship-results/ChampionshipAllClassesView.tsx
'use client'

import { getClassPriority } from '../ChampionshipResultsModal'
import { ChampionshipCompactTable } from './ChampionshipCompactTable'

interface ChampionshipAllClassesViewProps {
  sortedClasses: string[]
  resultsByClass: Record<string, any[]>
  sortedRallies: any[]
  onPlayerModalStateChange: (isOpen: boolean) => void
}

export function ChampionshipAllClassesView({
  sortedClasses,
  resultsByClass,
  sortedRallies,
  onPlayerModalStateChange
}: ChampionshipAllClassesViewProps) {
  // Sort classes by priority
  const prioritizedClasses = [...sortedClasses].sort((a, b) => {
    return getClassPriority(a) - getClassPriority(b)
  })

  return (
    <div className="space-y-8">
      {prioritizedClasses.map(className => {
        const classParticipants = resultsByClass[className]
        
        // Sort participants within class
        const sortedParticipants = [...classParticipants].sort((a, b) => {
          const aPos = a.championship_position || 999
          const bPos = b.championship_position || 999
          return aPos - bPos
        })

        return (
          <div key={className} className="space-y-4">
            {/* Class Header */}
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-bold text-red-400 font-['Orbitron'] uppercase tracking-wider">
                {className}
              </h3>
              <div className="flex-1 h-px bg-gradient-to-r from-red-900/50 to-transparent"></div>
              <span className="text-gray-500 text-sm">{classParticipants.length} osalejat</span>
            </div>

            {/* Compact Table for Each Class */}
            <ChampionshipCompactTable
              participants={sortedParticipants}
              sortedRallies={sortedRallies}
              onPlayerModalStateChange={onPlayerModalStateChange}
            />
          </div>
        )
      })}
    </div>
  )
}