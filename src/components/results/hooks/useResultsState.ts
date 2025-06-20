// src/components/results/hooks/useResultsState.ts - SIMPLIFIED: Removed participated logic
import { useState, useEffect } from 'react'

export interface ParticipantResult {
  participantId: string
  playerName: string
  className: string
  overallPosition: number | null
  classPosition: number | null
  totalPoints: number | null
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
        initialResults[participant.id] = {
          participantId: participant.id,
          playerName: participant.player_name || participant.participant_name,
          className: participant.class_name,
          overallPosition: participant.overall_position || null,
          classPosition: participant.class_position ? parseInt(participant.class_position) : null,
          totalPoints: participant.total_points || null
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
    setResults(prev => ({
      ...prev,
      [participantId]: {
        ...prev[participantId],
        [field]: value
      }
    }))
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