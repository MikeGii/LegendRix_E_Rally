// src/components/results/hooks/useResultsState.ts - SIMPLIFIED: Removed participated logic
import { useState, useEffect } from 'react'

export interface ParticipantResult {
  participantId: string
  playerName: string
  className: string
  overallPosition: number | null
  classPosition: number | null
  totalPoints: number | null
  extraPoints: number | null  // NEW: Extra points (powerstage, etc.)
  overallPoints: number       // NEW: Calculated total (totalPoints + extraPoints)
}

export interface ManualParticipant {
  playerName: string
  className: string
}

interface UseResultsStateProps {
  participants: any[]
  rallyClasses: any[]
}

export function useResultsState({ participants, rallyClasses }: UseResultsStateProps) {
  const [results, setResults] = useState<Record<string, ParticipantResult>>({})
  const [editMode, setEditMode] = useState(false)
  const [showAddParticipant, setShowAddParticipant] = useState(false)
  const [newParticipant, setNewParticipant] = useState<ManualParticipant>({
    playerName: '',
    className: rallyClasses[0]?.name || ''
  })

  // Initialize results from participants data
  useEffect(() => {
    if (participants.length > 0) {
      const initialResults: Record<string, ParticipantResult> = {}
      
      participants.forEach(participant => {
        const totalPoints = participant.total_points || null
        const extraPoints = participant.extra_points || null  // 👈 This should now work
        const overallPoints = (totalPoints || 0) + (extraPoints || 0)
        
        initialResults[participant.id] = {
          participantId: participant.id,
          playerName: participant.player_name || participant.participant_name,
          className: participant.class_name,
          overallPosition: participant.overall_position || null,
          classPosition: participant.class_position ? parseInt(participant.class_position) : null,
          totalPoints: totalPoints,
          extraPoints: extraPoints,
          overallPoints: overallPoints
        }
      })
      
      setResults(initialResults)
    }
  }, [participants])

  // Update rally classes in new participant form
  useEffect(() => {
    if (rallyClasses.length > 0 && !newParticipant.className) {
      setNewParticipant(prev => ({
        ...prev,
        className: rallyClasses[0].name
      }))
    }
  }, [rallyClasses, newParticipant.className])

  const updateResult = (participantId: string, field: keyof ParticipantResult, value: any) => {
    setResults(prev => {
      const updated = {
        ...prev,
        [participantId]: {
          ...prev[participantId],
          [field]: value
        }
      }
      
      // Automatically recalculate overall points when totalPoints or extraPoints change
      if (field === 'totalPoints' || field === 'extraPoints') {
        const result = updated[participantId]
        const totalPoints = result.totalPoints || 0
        const extraPoints = result.extraPoints || 0
        updated[participantId].overallPoints = totalPoints + extraPoints
      }
      
      return updated
    })
  }

  const removeParticipantFromState = (participantId: string) => {
    setResults(prev => {
      const newResults = { ...prev }
      delete newResults[participantId]
      return newResults
    })
  }

  const resetNewParticipantForm = () => {
    setNewParticipant({
      playerName: '',
      className: rallyClasses[0]?.name || ''
    })
  }

  return {
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
  }
}