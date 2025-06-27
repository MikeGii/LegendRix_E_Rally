// src/components/edetabel/championship-results/ChampionshipHeader.tsx
'use client'

interface ChampionshipHeaderProps {
  championshipName: string
  results: any
  selectedClass: string
  setSelectedClass: (value: string) => void
  sortedClasses: string[]
  resultsByClass: Record<string, any[]>
}

export function ChampionshipHeader({
  championshipName,
  results,
  selectedClass,
  setSelectedClass,
  sortedClasses,
  resultsByClass
}: ChampionshipHeaderProps) {
  return (
    <div className="sticky top-0 bg-black/95 backdrop-blur-xl border-b border-red-500/30 p-6 z-10">
      <div className="pr-16">
        <h2 className="text-2xl font-black text-white font-['Orbitron'] tracking-wider mb-2">
          {championshipName}
        </h2>
        
        <div className="flex items-center space-x-4 text-sm text-gray-400 mb-4">
          <span className="flex items-center space-x-2">
            <span className="text-red-400">🏆</span>
            <span>Meistrivõistlus</span>
          </span>
          {results && (
            <>
              <span className="flex items-center space-x-2">
                <span className="text-red-400">🏁</span>
                <span>{results.total_rounds} etappi</span>
              </span>
              <span className="flex items-center space-x-2">
                <span className="text-red-400">👥</span>
                <span>{results.participants?.length || 0} osalejat</span>
              </span>
            </>
          )}
        </div>

        {/* Class Filter */}
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-400">Klass:</label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-4 py-2 bg-gray-900/50 border border-gray-800 rounded-lg text-gray-300 text-sm focus:outline-none focus:border-red-500/50"
          >
            <option value="all">Kõik klassid</option>
            {sortedClasses.map(className => (
              <option key={className} value={className}>
                {className} ({resultsByClass[className]?.length || 0})
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}