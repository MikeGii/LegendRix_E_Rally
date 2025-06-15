// src/components/results/RallySelector.tsx
'use client'

import { CompletedRally } from '@/hooks/useResultsManagement'

interface RallySelectorProps {
  rallies: CompletedRally[]
  selectedRallyId: string | null
  onSelectRally: (rallyId: string) => void
  isLoading: boolean
  error: Error | null
}

export function RallySelector({ 
  rallies, 
  selectedRallyId, 
  onSelectRally, 
  isLoading, 
  error 
}: RallySelectorProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('et-EE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTimeAgo = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)

    if (diffDays > 0) {
      return `${diffDays} päev${diffDays > 1 ? 'a' : ''} tagasi`
    } else if (diffHours > 0) {
      return `${diffHours} tund${diffHours > 1 ? 'i' : ''} tagasi`
    } else {
      return 'Äsja'
    }
  }

  if (isLoading) {
    return (
      <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
            <span className="text-purple-400 text-lg">🏁</span>
          </div>
          <h3 className="text-lg font-semibold text-white">Lõppenud rallid</h3>
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse bg-slate-700/30 rounded-xl h-20"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
          <span className="text-purple-400 text-lg">🏁</span>
        </div>
        <h3 className="text-lg font-semibold text-white">Lõppenud rallid</h3>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
          <p className="text-red-400 text-sm">Viga rallide laadimisel</p>
        </div>
      )}

      {rallies.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-2xl text-slate-500">🏆</span>
          </div>
          <p className="text-slate-400 text-sm">Lõppenud rallisid pole</p>
          <p className="text-slate-500 text-xs mt-1">
            Rallid kuvatakse siin 12h pärast võistluse lõppu
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {rallies.map((rally) => (
            <div
              key={rally.id}
              onClick={() => onSelectRally(rally.id)}
              className={`cursor-pointer rounded-xl border p-4 transition-all duration-200 hover:scale-[1.02] ${
                selectedRallyId === rally.id 
                  ? 'bg-blue-600/20 border-blue-500/50'
                  : 'bg-slate-700/30 border-slate-600/30 hover:bg-slate-700/50'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-medium text-white text-sm">
                  {rally.name}
                </h3>
                {!rally.results_completed && (
                  <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-1 rounded">
                    Vajab tähelepanu
                  </span>
                )}
                {rally.results_completed && (
                  <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">
                    Valmis
                  </span>
                )}
              </div>
              
              <div className="text-xs text-slate-400 space-y-1">
                <div>📅 {formatDate(rally.competition_date)}</div>
                <div>👥 {rally.participant_count} osavõtjat</div>
                {rally.game_name && (
                  <div>🎮 {rally.game_name}</div>
                )}
                {rally.results_needed_since && !rally.results_completed && (
                  <div className="text-orange-400">
                    ⏰ Lõppes {getTimeAgo(rally.results_needed_since)}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}