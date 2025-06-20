// src/components/results/ResultsEntryInterface.tsx - FIXED: Don't exit edit mode after save
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
    onParticipantAdded: resetNewParticipantForm,
    onParticipantRemoved: removeParticipantFromState
  })

  // Save results - FIXED: Don't exit edit mode after save
  const {
    saveResultsMutation,
    handleSaveResults
  } = useSaveResults({
    rallyId,
    participants,
    onSaveSuccess: () => {
      // FIXED: Don't exit edit mode - just show success
      // setEditMode(false) // REMOVED: This was clearing the form
    }
  })

  // Event handlers
  const handleCalculatePositions = () => {
    calculatePositionsFromPoints(results, updateResult)
  }

  const handleClearResults = (participantId: string) => {
    clearParticipantResults(participantId, updateResult)
  }

  const handleSave = () => {
    handleSaveResults(results)
  }

  const handleAddParticipantSubmit = () => {
    handleAddParticipant(newParticipant)
  }

  // Disable editing if results are approved
  const isEditingDisabled = resultsStatus?.results_approved || false

  if (isLoading) {
    return (
      <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-700 rounded w-1/3"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-slate-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
        <ResultsHeader
          editMode={editMode && !isEditingDisabled}
          showAddParticipant={showAddParticipant}
          onToggleEditMode={() => !isEditingDisabled && setEditMode(!editMode)}
          onToggleAddParticipant={() => !isEditingDisabled && setShowAddParticipant(!showAddParticipant)}
          onCalculatePositions={handleCalculatePositions}
          onSaveResults={handleSave}
          isSaving={saveResultsMutation.isPending}
        />

        {/* Add Participant Form */}
        {showAddParticipant && !isEditingDisabled && (
          <div className="mt-6 pt-6 border-t border-slate-700/50">
            <AddParticipantForm
              show={true}
              participant={newParticipant}
              rallyClasses={rallyClasses}
              isAdding={addManualParticipantMutation.isPending}
              onParticipantChange={setNewParticipant}
              onSubmit={handleAddParticipantSubmit}
              onCancel={() => setShowAddParticipant(false)}
            />
          </div>
        )}
      </div>

      {/* Status Messages */}
      <StatusMessages 
        removeError={removeParticipantMutation.error?.message}
        saveError={saveResultsMutation.error?.message}
        saveSuccess={saveResultsMutation.isSuccess}
        isSaving={saveResultsMutation.isPending}
      />

      {/* Class Separated Participants Tables */}
      <ClassSeparatedParticipantsTable
        participants={participants}
        results={results}
        editMode={editMode && !isEditingDisabled}
        onUpdateResult={updateResult}
        onRemoveParticipant={!isEditingDisabled ? handleRemoveParticipant : undefined}
        onShowAddParticipant={() => !isEditingDisabled && setShowAddParticipant(true)}
      />
    </div>
  )
}