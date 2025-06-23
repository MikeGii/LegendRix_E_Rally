// src/components/results/ResultsEntryInterface.tsx - OPTIMIZED: Clean, universal interfaces
'use client'

import { useRallyClasses } from '@/hooks/useRallyManagement'
import { useResultsState } from './hooks/useResultsState'
import { useParticipantActions } from './hooks/useParticipantActions'
import { useSaveResults } from './hooks/useSaveResults'
import { useRallyResultsStatus } from './hooks/useRallyResultsStatus'
import { calculatePositionsFromPoints, clearParticipantResults } from './utils/resultCalculations'
import { ResultsHeader } from './components/ResultsHeader'
import { AddParticipantForm } from './components/AddParticipantForm'
import { ClassSeparatedParticipantsTable } from './components/ClassSeparatedParticipantsTable'
import { StatusMessages } from './components/StatusMessages'

interface ResultsEntryInterfaceProps {
  rallyId: string
  participants: any[]
  events: any[]
  isLoading: boolean
}

export function ResultsEntryInterface({ 
  rallyId, 
  participants, 
  events, 
  isLoading 
}: ResultsEntryInterfaceProps) {
  const { data: rallyClasses = [] } = useRallyClasses(rallyId)
  const { data: resultsStatus } = useRallyResultsStatus(rallyId)

  const {
    results,
    editMode,
    showAddParticipant,
    newParticipant,
    setEditMode,
    setShowAddParticipant,
    setNewParticipant,
    updateResult,
    removeParticipantFromState,
    resetNewParticipantForm
  } = useResultsState({ participants, rallyClasses })

  const {
    addManualParticipantMutation,
    removeParticipantMutation,
    handleAddParticipant,
    handleRemoveParticipant
  } = useParticipantActions({
    rallyId,
    onParticipantAdded: () => {
      resetNewParticipantForm()
      setShowAddParticipant(false)
    },
    onParticipantRemoved: removeParticipantFromState
  })

  const { saveResultsMutation, approveResultsMutation } = useSaveResults({
    rallyId,
    onSaveSuccess: () => {
      // Keep edit mode active after save
    }
  })

  const handleCalculatePositions = () => {
    calculatePositionsFromPoints(results, updateResult)
  }

  const handleClearResults = (participantId: string) => {
    clearParticipantResults(participantId, updateResult)
  }

  const handleSaveResults = () => {
    const allParticipants = participants.map(participant => {
      const result = results[participant.id]
      return {
        participantId: participant.id,
        playerName: participant.player_name || participant.participant_name,
        className: participant.class_name,
        overallPosition: result?.overallPosition || null,
        classPosition: result?.classPosition || null,
        totalPoints: result?.totalPoints || null,
        extraPoints: result?.extraPoints || null
      }
    })

    const participantsWithResults = allParticipants.filter(p => 
      p.overallPosition !== null || 
      p.classPosition !== null || 
      (p.totalPoints !== null && p.totalPoints !== 0) || 
      (p.extraPoints !== null && p.extraPoints !== 0)
    )

    if (participantsWithResults.length === 0) {
      if (!confirm('Ühtegi tulemust pole sisestatud. Kas soovite siiski salvestada?')) {
        return
      }
    }

    saveResultsMutation.mutate({ rallyId, allParticipants })
  }

  const handleAddParticipantSubmit = () => {
    if (newParticipant.playerName.trim() && newParticipant.className.trim()) {
      addManualParticipantMutation.mutate(newParticipant)
    }
  }

  const handleApproveResults = () => {
    if (confirm('Kas olete kindel, et soovite tulemused kinnitada? Pärast kinnitamist ei saa tulemusi enam muuta.')) {
      approveResultsMutation.mutate(rallyId)
    }
  }

  // Status checks
  const isResultsApproved = resultsStatus?.results_approved || false
  const canEdit = editMode && !isResultsApproved
  const canApprove = resultsStatus?.results_completed && !isResultsApproved

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-400">Andmete laadimine...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <StatusMessages 
        isSaving={saveResultsMutation.isPending}
        isApproving={approveResultsMutation.isPending}
        isApproved={isResultsApproved}
      />

      <ResultsHeader
        editMode={editMode}
        setEditMode={setEditMode}
        onCalculatePositions={handleCalculatePositions}
        onSaveResults={handleSaveResults}
        onApproveResults={canApprove ? handleApproveResults : undefined}
        onShowAddParticipant={() => setShowAddParticipant(true)}
        isSaving={saveResultsMutation.isPending}
        isApproving={approveResultsMutation.isPending}
        isApproved={isResultsApproved}
        canApprove={canApprove}
      />

      {editMode && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-amber-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-amber-400 text-sm">!</span>
            </div>
            <div>
              <h4 className="text-amber-400 font-medium mb-1">Lisa punktide süsteem</h4>
              <p className="text-amber-200/80 text-sm">
                <strong>Punktid:</strong> Tavalised rally punktid<br/>
                <strong>Lisa punktid:</strong> Lisaklassifikatsioonide punktid (nt WRC powerstage)<br/>
                <strong>Kokku punktid:</strong> Automaatselt arvutatud summa, mis määrab lõpliku positsiooni
              </p>
              <p className="text-amber-200/60 text-xs mt-2">
                Võrdsete kokkupunktide korral määrab parema koha see, kellel on rohkem lisaklassifikatsiooni punkte.
              </p>
            </div>
          </div>
        </div>
      )}

      {showAddParticipant && (
        <AddParticipantForm
          show={true}
          participant={newParticipant}
          rallyClasses={rallyClasses}
          isAdding={addManualParticipantMutation.isPending}
          onParticipantChange={setNewParticipant}
          onSubmit={handleAddParticipantSubmit}
          onCancel={() => {
            setShowAddParticipant(false)
            resetNewParticipantForm()
          }}
        />
      )}

      <ClassSeparatedParticipantsTable
        participants={participants}
        results={results}
        editMode={canEdit}
        onUpdateResult={updateResult}
        onClearResults={handleClearResults}
        onRemoveParticipant={handleRemoveParticipant}
        isRemoving={removeParticipantMutation.isPending}
      />
    </div>
  )
}