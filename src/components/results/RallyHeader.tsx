// src/components/results/RallyHeader.tsx - FIXED VERSION with better approval logic
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

  // FIXED: Better logic for determining participants with results
  const participantsWithResults = participants.filter(p => p.results_entered)
  const participantsNeedingResults = participants.filter(p => !p.results_entered)
  
  // Use status from hook if available, otherwise calculate from participants
  const progressPercentage = resultsStatus?.progress_percentage || 
    (participants.length > 0 ? Math.round((participantsWithResults.length / participants.length) * 100) : 0)
  
  // FIXED: Better approval readiness logic
  const isReadyForApproval = progressPercentage === 100 && 
    resultsStatus?.results_completed && 
    !resultsStatus?.results_approved &&
    participantsNeedingResults.length === 0

  const handleAutoComplete = async () => {
    if (participantsNeedingResults.length === 0) return

    const message = `Kas oled kindel, et soovid automaatselt seada ${participantsNeedingResults.length} puuduva osaleja tulemused 0 punktile?\n\nNeed osalejad saavad viimased kohad ralli lõpus.`
    
    if (confirm(message)) {
      try {
        await autoCompleteMutation.mutateAsync(rally.id)
      } catch (error) {
        console.error('Auto-complete failed:', error)
        alert('Viga automaatsel täiendamisel. Palun proovi uuesti.')
      }
    }
  }

  const handleApproveResults = async () => {
    const message = `Kas oled kindel, et soovid kinnitada ralli "${rally.name}" tulemused?\n\nPärast kinnitamist:\n• Tulemused ilmuvad avalikus edetabelis\n• Tulemusi ei saa enam muuta\n• Ralli märgitakse lõpetatuks`
    
    if (confirm(message)) {
      try {
        await approveResultsMutation.mutateAsync(rally.id)
        alert('Tulemused on edukalt kinnitatud ja avaldatud!')
      } catch (error) {
        console.error('Approval failed:', error)
        alert(`Viga tulemuste kinnitamisel: ${error instanceof Error ? error.message : 'Tundmatu viga'}`)
      }
    }
  }

  return (
    <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 space-y-6">
      {/* Rally Info Header */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-white mb-2">{rally.name}</h2>
          <div className="text-slate-400 text-sm space-y-1">
            <p>📅 {formatDate(rally.competition_date)}</p>
            <p>🎮 {rally.game_name} - {rally.game_type_name}</p>
            {rally.description && <p>📝 {rally.description}</p>}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          {/* FIXED: Auto Complete Button - show only when there are missing results and not approved */}
          {participantsNeedingResults.length > 0 && !resultsStatus?.results_approved && (
            <button
              onClick={handleAutoComplete}
              disabled={autoCompleteMutation.isPending}
              className="px-4 py-2 bg-orange-600/20 hover:bg-orange-600/30 text-orange-400 border border-orange-600/30 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-50"
              title="Seab puuduvate osalejate tulemused automaatselt 0 punktile ja viimastele kohtadele"
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
              <span className="text-green-400">✓ Tulemused valmis</span>
            )}
          </div>
        </div>

        {/* FIXED: Approval Section - show when ready */}
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

        {/* Status Messages */}
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

        {/* FIXED: Warning when not all results are entered */}
        {participantsNeedingResults.length > 0 && !resultsStatus?.results_approved && (
          <div className="bg-amber-900/20 border border-amber-500/30 rounded-lg p-4">
            <div className="flex items-start">
              <span className="text-amber-400 text-lg mr-3">⚠️</span>
              <div>
                <p className="text-amber-400 font-medium">Pooleli tulemused</p>
                <p className="text-amber-300 text-sm mt-1">
                  {participantsNeedingResults.length} osalejal puuduvad veel tulemused. 
                  Kasuta "Täienda automaatselt" nuppu, et seada neile 0 punkti.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}