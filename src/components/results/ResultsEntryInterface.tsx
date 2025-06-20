// src/components/results/ResultsEntryInterface.tsx - SIMPLIFIED: Removed participated logic
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
  // Data hooks
  const { data: rallyClasses = [] } = useRallyClasses(rallyId)
  const { data: resultsStatus } = useRallyResultsStatus(rallyId)

  // State management
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

  // Participant actions
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

  // Save results
  const { saveResultsMutation, approveResultsMutation } = useSaveResults({
    rallyId,
    onSaveSuccess: () => {
      // Keep edit mode active after save
    }
  })

  // Actions
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
        playerName: participant.player_name,
        className: participant.class_name,
        overallPosition: result?.overallPosition || null,
        classPosition: result?.classPosition || null,
        totalPoints: result?.totalPoints || null
      }
    })

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
      {/* Status Messages */}
      <StatusMessages 
        isSaving={saveResultsMutation.isPending}
        isApproving={approveResultsMutation.isPending}
        isApproved={isResultsApproved}
      />

      {/* Header with actions */}
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

      {/* Add Participant Form */}
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

      {/* Participants Table */}
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