// src/components/results/RallyHeader.tsx - FIXED: Match existing interface
'use client'

import { useState } from 'react'
import { useRallyResultsStatus, useApproveResults } from './hooks/useRallyResultsStatus'
import type { CompletedRally, RallyParticipant } from '@/hooks/useResultsManagement'

interface RallyHeaderProps {
  rally: CompletedRally
  participants: RallyParticipant[]
  onAddParticipant?: () => void
}

export function RallyHeader({ rally, participants, onAddParticipant }: RallyHeaderProps) {
  const [showProgressInfo, setShowProgressInfo] = useState(false)
  
  // Data hooks
  const { data: resultsStatus } = useRallyResultsStatus(rally.id)
  const approveResultsMutation = useApproveResults()

  // Calculate participants with results
  const participantsWithResults = participants.filter(p => p.results_entered)
  const participantsNeedingResults = participants.filter(p => !p.results_entered)
  
  const progressPercentage = participants.length > 0 
    ? Math.round((participantsWithResults.length / participants.length) * 100) 
    : 0

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('et-EE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (!rally) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
        <div className="text-slate-400">Ralli andmeid ei leitud</div>
      </div>
    )
  }

  const handleApproveResults = async () => {
    if (window.confirm('Kas olete kindel, et soovite tulemused kinnitada? Pärast kinnitamist ei saa tulemusi enam muuta.')) {
      try {
        await approveResultsMutation.mutateAsync(rally.id)
        alert('Tulemused on edukalt kinnitatud!')
      } catch (error) {
        console.error('Error approving results:', error)
        alert('Tulemuste kinnitamine ebaõnnestus. Palun proovige uuesti.')
      }
    }
  }

  const canApprove = resultsStatus?.results_completed && !resultsStatus?.results_approved
  const isApproved = resultsStatus?.results_approved || false

  return (
    <div className="bg-gradient-to-r from-slate-800/80 to-slate-800/40 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl flex items-center justify-center">
            <span className="text-2xl">🏁</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">{rally.name}</h1>
            <p className="text-slate-300">
              {formatDate(rally.competition_date)}
            </p>
            {rally.game_name && (
              <p className="text-slate-400 text-sm">
                🎮 {rally.game_name} {rally.game_type_name && `- ${rally.game_type_name}`}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {isApproved && (
            <div className="flex items-center space-x-2 px-4 py-2 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg">
              <span className="w-2 h-2 bg-green-400 rounded-full"></span>
              <span className="font-medium">Tulemused kinnitatud</span>
            </div>
          )}

          {canApprove && (
            <button
              onClick={handleApproveResults}
              disabled={approveResultsMutation.isPending}
              className="flex items-center space-x-2 px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 border border-orange-500/30 rounded-lg transition-all duration-200 disabled:opacity-50"
            >
              <span>{approveResultsMutation.isPending ? 'Kinnitamine...' : 'Kinnita tulemused'}</span>
            </button>
          )}

          {resultsStatus?.results_completed && (
            <div className="flex items-center space-x-2 px-4 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg">
              <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
              <span className="font-medium">Tulemused sisestatud</span>
            </div>
          )}
        </div>
      </div>

      {rally.description && (
        <div className="mt-4 pt-4 border-t border-slate-700/50">
          <p className="text-slate-300 text-sm">{rally.description}</p>
        </div>
      )}
    </div>
  )
}