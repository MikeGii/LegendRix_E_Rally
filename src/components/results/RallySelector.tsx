// src/components/results/RallySelector.tsx - ENHANCED with approved rallies toggle
'use client'

import { useState } from 'react'
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
  const [showApproved, setShowApproved] = useState(false)

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

  // FILTER RALLIES: Separate completed (need work) from approved (done)
  const unapprovedRallies = rallies.filter(rally => !rally.results_completed)
  const approvedRallies = rallies.filter(rally => rally.results_completed)
  
  // Show different rallies based on toggle
  const displayRallies = showApproved ? approvedRallies : unapprovedRallies

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
      {/* Header with Toggle */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
            <span className="text-purple-400 text-lg">🏁</span>
          </div>
          <h3 className="text-lg font-semibold text-white">
            {showApproved ? 'Kinnitatud tulemused' : 'Vajab tulemusi'}
          </h3>
        </div>

        {/* Toggle Button */}
        <button
          onClick={() => setShowApproved(!showApproved)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
            showApproved 
              ?'bg-orange-500/20 text-orange-400 border border-orange-500/30 hover:bg-orange-500/30'
              : 'bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30' 
          }`}
        >
          {showApproved ? '← Ootel' : 'Näita kinnitatuid'}
        </button>
      </div>

      {/* Stats Bar */}
      <div className="mb-4 p-3 bg-slate-900/50 rounded-lg">
        <div className="grid grid-cols-2 gap-3 text-center">
          <div className="space-y-1">
            <div className="text-lg font-bold text-orange-400">{unapprovedRallies.length}</div>
            <div className="text-xs text-slate-400">Vajab tööd</div>
          </div>
          <div className="space-y-1">
            <div className="text-lg font-bold text-green-400">{approvedRallies.length}</div>
            <div className="text-xs text-slate-400">Kinnitatud</div>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
          <p className="text-red-400 text-sm">Viga rallide laadimisel</p>
        </div>
      )}

      {/* Rally List */}
      {displayRallies.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-slate-700/50 rounded-lg flex items-center justify-center mx-auto mb-3">
            <span className="text-2xl text-slate-500">
              {showApproved ? '✅' : '📋'}
            </span>
          </div>
          <p className="text-slate-400 text-sm">
            {showApproved 
              ? 'Kinnitatud tulemustega rallisid pole' 
              : 'Tulemusi vajavaid rallisid pole'
            }
          </p>
          {!showApproved && rallies.length === 0 && (
            <div className="mt-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
              <p className="text-blue-400 text-xs">
                💡 Vihje: Loo Rally Management lehel uus ralli ja määra selle kuupäev minevikku
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {displayRallies.map((rally) => (
            <div
              key={rally.id}
              onClick={() => onSelectRally(rally.id)}
              className={`
                p-4 rounded-xl border cursor-pointer transition-all duration-200 
                ${selectedRallyId === rally.id
                  ? 'bg-blue-500/20 border-blue-500/50 shadow-lg shadow-blue-500/25'
                  : 'bg-slate-900/50 border-slate-700/50 hover:border-slate-600/50 hover:bg-slate-800/50'
                }
              `}
            >
              {/* Rally Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h4 className={`font-medium text-sm leading-tight ${
                    selectedRallyId === rally.id ? 'text-blue-300' : 'text-white'
                  }`}>
                    {rally.name}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    {rally.game_name} • {getTimeAgo(rally.competition_date)}
                  </p>
                </div>
                
                {/* Status Badge */}
                <div className={`px-2 py-1 rounded-md text-xs font-medium ${
                  rally.results_completed
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-orange-500/20 text-orange-400'
                }`}>
                  {rally.results_completed ? 'Valmis' : 'Ootel'}
                </div>
              </div>

              {/* Rally Stats */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="flex items-center space-x-2">
                  <span className="text-slate-500">👥</span>
                  <span className="text-slate-400">{rally.participant_count} osalejat</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-slate-500">📅</span>
                  <span className="text-slate-400">
                    {new Date(rally.competition_date).toLocaleDateString('et-EE', {
                      day: 'numeric',
                      month: 'short'
                    })}
                  </span>
                </div>
              </div>

              {/* Description Preview */}
              {rally.description && (
                <div className="mt-2 pt-2 border-t border-slate-700/30">
                  <p className="text-xs text-slate-500 line-clamp-2">
                    {rally.description}
                  </p>
                </div>
              )}

              {/* Selection Indicator */}
              {selectedRallyId === rally.id && (
                <div className="mt-3 pt-2 border-t border-blue-500/30">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                    <span className="text-xs text-blue-400 font-medium">Valitud</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Instructions */}
      {displayRallies.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-700/30">
          <p className="text-xs text-slate-500 text-center">
            {showApproved 
              ? 'Vaata kinnitatud tulemusi'
              : 'Kliki rallile tulemuste sisestamiseks'
            }
          </p>
        </div>
      )}
    </div>
  )
}