// src/components/results/ResultsEntryInterface.tsx - REFACTORED VERSION
'use client'

import { useRallyClasses } from '@/hooks/useRallyManagement'
import { useResultsState } from './hooks/useResultsState'
import { useParticipantActions } from './hooks/useParticipantActions'
import { useSaveResults } from './hooks/useSaveResults'
import { useRallyResultsStatus } from './hooks/useRallyResultsStatus'
import { calculatePositionsFromPoints, clearParticipantResults, sortParticipantsByResults } from './utils/resultCalculations'
import { ResultsHeader } from './components/ResultsHeader'
import { AddParticipantForm } from './components/AddParticipantForm'
import { ParticipantsTable } from './components/ParticipantsTable'
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

  // Save results
  const {
    saveResultsMutation,
    handleSaveResults
  } = useSaveResults({
    rallyId,
    participants,
    onSaveSuccess: () => setEditMode(false)
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

  // Sort participants for display
  const sortedParticipants = sortParticipantsByResults(participants, results)

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

        <AddParticipantForm
          show={showAddParticipant && !isEditingDisabled}
          participant={newParticipant}
          rallyClasses={rallyClasses}
          isAdding={addManualParticipantMutation.isPending}
          onParticipantChange={setNewParticipant}
          onSubmit={handleAddParticipantSubmit}
          onCancel={() => setShowAddParticipant(false)}
        />

        <ParticipantsTable
          participants={sortedParticipants}
          results={results}
          editMode={editMode && !isEditingDisabled}
          isRemoving={removeParticipantMutation.isPending}
          onUpdateResult={updateResult}
          onClearResults={handleClearResults}
          onRemoveParticipant={handleRemoveParticipant}
          onShowAddParticipant={() => !isEditingDisabled && setShowAddParticipant(true)}
        />
      </div>

      {/* Status Messages */}
      <StatusMessages
        removeError={removeParticipantMutation.error?.message}
        saveError={saveResultsMutation.error?.message}
        saveSuccess={saveResultsMutation.isSuccess}
        isSaving={saveResultsMutation.isPending}
      />

      {/* Approval Notice */}
      {isEditingDisabled && (
        <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
          <div className="flex items-start">
            <span className="text-blue-400 text-lg mr-3">ℹ️</span>
            <div>
              <p className="text-blue-400 font-medium">Tulemused on kinnitatud</p>
              <p className="text-blue-300 text-sm mt-1">
                Selle ralli tulemused on kinnitatud ja avalikustatud. Muudatused pole enam võimalikud.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}