// src/components/edetabel/team-results/TeamResultsHeader.tsx
'use client'

interface TeamResultsHeaderProps {
  rallyName: string
  selectedClass: string
  setSelectedClass: (className: string) => void
  availableClasses: string[]
  totalTeams: number
}

export function TeamResultsHeader({
  rallyName,
  selectedClass,
  setSelectedClass,
  availableClasses,
  totalTeams
}: TeamResultsHeaderProps) {
  return (
    <div className="sticky top-0 bg-black/95 backdrop-blur-xl border-b border-red-500/30 p-6 z-10">
      {/* Title Section */}
      <div className="mb-4">
        <h2 className="text-2xl font-black text-white font-['Orbitron'] tracking-wider mb-1">
          <span className="text-red-500">VÕISTKONDADE TULEMUSED</span>
        </h2>
        <p className="text-gray-400">{rallyName}</p>
      </div>

      {/* Stats and Class Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Stats */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-red-400">👥</span>
            <span className="text-sm text-gray-400">
              {totalTeams} {totalTeams === 1 ? 'võistkond' : 'võistkonda'}
            </span>
          </div>
        </div>

        {/* Class Filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">Klass:</span>
          <div className="flex bg-gray-900/50 rounded-lg p-1 border border-gray-800">
            <button
              onClick={() => setSelectedClass('all')}
              className={`px-4 py-1.5 rounded-md text-sm font-['Orbitron'] tracking-wider transition-all duration-300 ${
                selectedClass === 'all'
                  ? 'bg-red-600/20 text-red-400 border border-red-500/50'
                  : 'text-gray-400 hover:text-red-400/70'
              }`}
            >
              KÕIK KLASSID
            </button>
            {availableClasses.map(className => (
              <button
                key={className}
                onClick={() => setSelectedClass(className)}
                className={`px-4 py-1.5 rounded-md text-sm font-['Orbitron'] tracking-wider transition-all duration-300 ${
                  selectedClass === className
                    ? 'bg-red-600/20 text-red-400 border border-red-500/50'
                    : 'text-gray-400 hover:text-red-400/70'
                }`}
              >
                {className.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}