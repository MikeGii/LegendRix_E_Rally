// src/components/edetabel/championship-results/ChampionshipWarnings.tsx
'use client'

interface ChampionshipWarningsProps {
  warnings: string[]
}

export function ChampionshipWarnings({ warnings }: ChampionshipWarningsProps) {
  return (
    <div className="mt-6 bg-orange-900/20 border border-orange-800/50 rounded-xl p-4">
      <h4 className="text-orange-400 font-['Orbitron'] font-bold mb-2 flex items-center">
        <span className="mr-2">⚠️</span>
        Hoiatused:
      </h4>
      <ul className="text-orange-300 text-sm space-y-1">
        {warnings.map((warning, index) => (
          <li key={index} className="flex items-start">
            <span className="text-orange-400 mr-2">•</span>
            <span>{warning}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}