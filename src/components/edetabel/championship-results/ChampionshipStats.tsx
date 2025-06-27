// src/components/edetabel/championship-results/ChampionshipStats.tsx
'use client'

interface ChampionshipStatsProps {
  results: any
}

export function ChampionshipStats({ results }: ChampionshipStatsProps) {
  return (
    <div className="bg-gray-900/30 backdrop-blur-sm border border-gray-800 rounded-xl p-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div className="space-y-1">
          <div className="text-2xl font-bold text-red-400 font-['Orbitron']">
            {results.total_rounds}
          </div>
          <div className="text-sm text-gray-400">Etappi</div>
        </div>
        <div className="space-y-1">
          <div className="text-2xl font-bold text-green-400 font-['Orbitron']">
            {results.participants.length}
          </div>
          <div className="text-sm text-gray-400">Osalejat</div>
        </div>
        <div className="space-y-1">
          <div className="text-2xl font-bold text-purple-400 font-['Orbitron']">
            {results.linked_participants}
          </div>
          <div className="text-sm text-gray-400">Seotud</div>
        </div>
        <div className="space-y-1">
          <div className="text-2xl font-bold text-orange-400 font-['Orbitron']">
            {results.unlinked_participants}
          </div>
          <div className="text-sm text-gray-400">Sidumata</div>
        </div>
      </div>
    </div>
  )
}