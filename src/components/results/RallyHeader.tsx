// src/components/results/RallyHeader.tsx
'use client'

import { CompletedRally, RallyParticipant } from '@/hooks/useResultsManagement'

interface RallyHeaderProps {
  rally: CompletedRally
  participants: RallyParticipant[]
  onAddParticipant?: () => void
}

export function RallyHeader({ rally, participants, onAddParticipant }: RallyHeaderProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('et-EE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const participantsWithResults = participants.filter(p => p.results_entered)
  const participantsNeedingResults = participants.filter(p => !p.results_entered)

  return (
    <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white mb-2">
            {rally.name}
          </h2>
          <div className="flex items-center space-x-4 text-sm text-slate-400">
            <span>📅 {formatDate(rally.competition_date)}</span>
            <span>🎮 {rally.game_name}</span>
            <span>👥 {participants.length} osalejat</span>
          </div>
          {rally.description && (
            <p className="text-slate-300 text-sm mt-2 max-w-2xl">
              {rally.description}
            </p>
          )}
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          {onAddParticipant && (
            <button
              onClick={onAddParticipant}
              className="px-4 py-2 bg-green-600/20 hover:bg-green-600/30 text-green-400 border border-green-600/30 rounded-lg text-sm font-medium transition-all duration-200"
            >
              ➕ Lisa osaleja
            </button>
          )}
          <div className={`px-3 py-2 rounded-lg text-sm font-medium ${
            rally.results_completed 
              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
              : 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
          }`}>
            {rally.results_completed ? '✅ Tulemused valmis' : '⏳ Ootab tulemusi'}
          </div>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-slate-900/50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-white">{participants.length}</div>
          <div className="text-sm text-slate-400">Kokku osalejaid</div>
        </div>
        <div className="bg-slate-900/50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-green-400">
            {participantsWithResults.length}
          </div>
          <div className="text-sm text-slate-400">Tulemused sisestatud</div>
        </div>
        <div className="bg-slate-900/50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-orange-400">
            {participantsNeedingResults.length}
          </div>
          <div className="text-sm text-slate-400">Ootab tulemusi</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-sm text-slate-400 mb-2">
          <span>Edenemise käik</span>
          <span>{participants.length > 0 ? Math.round((participantsWithResults.length / participants.length) * 100) : 0}%</span>
        </div>
        <div className="w-full bg-slate-700/50 rounded-full h-2">
          <div 
            className="bg-green-500 h-2 rounded-full transition-all duration-500"
            style={{ 
              width: participants.length > 0 
                ? `${(participantsWithResults.length / participants.length) * 100}%` 
                : '0%' 
            }}
          ></div>
        </div>
      </div>
    </div>
  )
}