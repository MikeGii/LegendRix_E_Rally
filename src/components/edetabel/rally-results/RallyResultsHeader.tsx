// src/components/edetabel/rally-results/RallyResultsHeader.tsx
'use client'

import type { ApprovedRally } from '@/hooks/useApprovedRallies'

interface RallyResultsHeaderProps {
  rally: ApprovedRally
  results: any[]
  selectedClass: string
  setSelectedClass: (value: string) => void
  sortedClasses: string[]
  resultsByClass: Record<string, any[]>
  rallyEvents: any[]
}

export function RallyResultsHeader({
  rally,
  results,
  selectedClass,
  setSelectedClass,
  sortedClasses,
  resultsByClass,
  rallyEvents
}: RallyResultsHeaderProps) {
  return (
    <div className="sticky top-0 bg-black/95 backdrop-blur-xl border-b border-red-500/30 p-6 z-10">
      <div className="pr-16">
        <h2 className="text-2xl font-black text-white font-['Orbitron'] tracking-wider mb-2">
          {rally.name}
        </h2>
        <div className="flex items-center space-x-4 text-sm text-gray-400">
          <span className="flex items-center space-x-2">
            <span className="text-red-400">📅</span>
            <span>{new Date(rally.competition_date).toLocaleDateString('et-EE')}</span>
          </span>
          <span className="flex items-center space-x-2">
            <span className="text-red-400">🎮</span>
            <span>{rally.game_name}</span>
          </span>
          <span className="flex items-center space-x-2">
            <span className="text-red-400">👥</span>
            <span>{results.length} osalejat</span>
          </span>
        </div>

        {/* Rally Events */}
        {rallyEvents.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
            <span className="text-red-400">🏁 Sündmused:</span>
            {rallyEvents.map((event, index) => (
              <span key={event.event_id} className="text-gray-400">
                {index + 1}. {event.event_name}
                {event.tracks.length > 0 && (
                  <span className="text-gray-500 ml-1">
                    ({event.tracks.map(t => (t.track as any)?.name || 'Unknown').join(', ')})
                  </span>
                )}
              </span>
            ))}
          </div>
        )}

        {/* Class Filter */}
        <div className="mt-4 flex items-center gap-2">
          <label className="text-sm text-gray-400">Klass:</label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-4 py-2 bg-gray-900/50 border border-gray-800 rounded-lg text-gray-300 text-sm focus:outline-none focus:border-red-500/50"
          >
            <option value="all">Kõik klassid</option>
            {sortedClasses.map(className => (
              <option key={className} value={className}>
                {className} ({resultsByClass[className].length})
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}