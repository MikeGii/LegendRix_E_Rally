// src/components/results/RallyHeader.tsx - ENHANCED VERSION with approval system
'use client'

import { CompletedRally, RallyParticipant } from '@/hooks/useResultsManagement'
import { useRallyResultsStatus, useAutoCompleteResults, useApproveResults } from './hooks/useRallyResultsStatus'

interface RallyHeaderProps {
  rally: CompletedRally
  participants: RallyParticipant[]
  onAddParticipant?: () => void
}

export function RallyHeader({ rally, participants, onAddParticipant }: RallyHeaderProps) {
  const { data: resultsStatus } = useRallyResultsStatus(rally.id)
  const autoCompleteMutation = useAutoCompleteResults()
  const approveResultsMutation = useApproveResults()

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
  
  // Use status from hook if available, otherwise calculate from participants
  const progressPercentage = resultsStatus?.progress_percentage || 
    (participants.length > 0 ? Math.round((participantsWithResults.length / participants.length) * 100) : 0)
  
  const isReadyForApproval = progressPercentage === 100 && resultsStatus?.results_completed && !resultsStatus?.results_approved

  const handleAutoComplete = async () => {
    if (participantsNeedingResults.length === 0) return

    const message = `Kas oled kindel, et soovid automaatselt seada ${participantsNeedingResults.length} puuduva osaleja tulemused 0 punktile?`
    
    if (confirm(message)) {
      await autoCompleteMutation.mutateAsync(rally.id)
    }
  }

  const handleApproveResults = async () => {
    const message = `Kas oled kindel, et soovid kinnitada ralli "${rally.name}" tulemused? Pärast kinnitamist ilmuvad tulemused avalikus edetabelis.`
    
    if (confirm(message)) {
      await approveResultsMutation.mutateAsync(rally.id)
    }
  }

  return (
    <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-xl font-bold text-white">
              {rally.name}
            </h2>
            {resultsStatus?.results_approved && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                ✅ Kinnitatud
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-slate-400 mb-3">
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
          {/* Auto Complete Results Button */}
          {participantsNeedingResults.length > 0 && !resultsStatus?.results_approved && (
            <button
              onClick={handleAutoComplete}
              disabled={autoCompleteMutation.isPending}
              className="px-4 py-2 bg-orange-600/20 hover:bg-orange-600/30 text-orange-400 border border-orange-600/30 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-50"
            >
              {autoCompleteMutation.isPending ? (
                <>⏳ Täiendan...</>
              ) : (
                <>🔄 Täienda automaatselt ({participantsNeedingResults.length})</>
              )}
            </button>
          )}

          {onAddParticipant && !resultsStatus?.results_approved && (
            <button
              onClick={onAddParticipant}
              className="px-4 py-2 bg-green-600/20 hover:bg-green-600/30 text-green-400 border border-green-600/30 rounded-lg text-sm font-medium transition-all duration-200"
            >
              ➕ Lisa osaleja
            </button>
          )}
        </div>
      </div>

      {/* Progress Section */}
      <div className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">Tulemuste sisestamise progress</span>
            <span className="text-white font-medium">{progressPercentage}%</span>
          </div>
          
          <div className="w-full bg-slate-700/50 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-500 ${
                progressPercentage === 100 
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                  : 'bg-gradient-to-r from-blue-500 to-purple-500'
              }`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{participantsWithResults.length} / {participants.length} osalejal tulemused sisestatud</span>
            {resultsStatus?.results_completed && (
              <span className="text-green-400">✓ Tulemused salvestatud</span>
            )}
          </div>
        </div>

        {/* Approval Button */}
        {isReadyForApproval && (
          <div className="border-t border-slate-700/50 pt-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h4 className="text-white font-medium mb-1">Valmis kinnitamiseks</h4>
                <p className="text-slate-400 text-sm">
                  Kõik tulemused on sisestatud. Kinnita tulemused, et need ilmuksid avalikus edetabelis.
                </p>
              </div>
              
              <button
                onClick={handleApproveResults}
                disabled={approveResultsMutation.isPending}
                className="ml-4 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-50 flex items-center gap-2 shadow-lg"
              >
                {approveResultsMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Kinnitan...
                  </>
                ) : (
                  <>
                    🏆 Kinnita tulemused
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Status Display */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-slate-900/30 rounded-lg p-3">
            <div className="text-2xl font-bold text-white">{participants.length}</div>
            <div className="text-xs text-slate-400">Kokku osalejaid</div>
          </div>
          
          <div className="bg-slate-900/30 rounded-lg p-3">
            <div className="text-2xl font-bold text-green-400">{participantsWithResults.length}</div>
            <div className="text-xs text-slate-400">Tulemused sisestatud</div>
          </div>
          
          <div className="bg-slate-900/30 rounded-lg p-3">
            <div className="text-2xl font-bold text-orange-400">{participantsNeedingResults.length}</div>
            <div className="text-xs text-slate-400">Ootab tulemusi</div>
          </div>
        </div>

        {/* Approval Info */}
        {resultsStatus?.results_approved && resultsStatus.approved_at && (
          <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
            <div className="flex items-start">
              <span className="text-green-400 text-lg mr-3">✅</span>
              <div>
                <p className="text-green-400 font-medium">Tulemused kinnitatud</p>
                <p className="text-green-300 text-sm mt-1">
                  Kinnitatud: {formatDate(resultsStatus.approved_at)}
                </p>
                <p className="text-green-300 text-sm">
                  Tulemused on nüüd nähtavad avalikus edetabelis.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}