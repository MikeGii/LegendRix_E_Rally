// src/components/results/hooks/useResultsState.ts
import { useState, useEffect } from 'react'

export interface ParticipantResult {
  participantId: string
  playerName: string
  className: string
  overallPosition: number | null
  totalPoints: number | null
  eventResults: Record<string, number>
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
    className: ''
  })

  // Initialize results with participant data
  useEffect(() => {
    const initialResults: Record<string, ParticipantResult> = {}
    
    participants.forEach(participant => {
      initialResults[participant.id] = {
        participantId: participant.id,
        playerName: participant.player_name || participant.user_name,
        className: participant.class_name,
        overallPosition: participant.overall_position,
        totalPoints: participant.total_points,
        eventResults: {}
      }
    })
    
    setResults(initialResults)
  }, [participants])

  // Set default class when rally classes load
  useEffect(() => {
    if (rallyClasses.length > 0 && !newParticipant.className) {
      setNewParticipant(prev => ({
        ...prev,
        className: rallyClasses[0]?.class_name || ''
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
      className: rallyClasses[0]?.class_name || '' 
    })
    setShowAddParticipant(false)
  }

  return {
    // State
    results,
    editMode,
    showAddParticipant,
    newParticipant,
    
    // Actions
    setEditMode,
    setShowAddParticipant,
    setNewParticipant,
    updateResult,
    removeParticipantFromState,
    resetNewParticipantForm
  }
}