// src/components/results/hooks/useResultsState.ts
import { useState, useEffect } from 'react'

export interface ParticipantResult {
  participantId: string
  playerName: string
  className: string
  overallPosition: number | null
  classPosition: number | null
  totalPoints: number | null
  participated: boolean  // NEW: Participation checkbox state
  eventResults: Record<string, number>
  isModified: boolean
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
        playerName: participant.player_name || participant.user_name || 'Unknown',
        className: participant.class_name || 'Unknown Class',
        overallPosition: participant.overall_position,
        classPosition: participant.class_position,
        totalPoints: participant.total_points,
        participated: participant.participated || false, // NEW: Load existing participation status
        eventResults: {},
        isModified: false
      }
    })
    
    setResults(initialResults)
  }, [participants])

  // Set default class when rally classes load
  useEffect(() => {
    if (rallyClasses.length > 0 && !newParticipant.className) {
      setNewParticipant(prev => ({
        ...prev,
        className: rallyClasses[0]?.class_name || rallyClasses[0]?.name || ''
      }))
    }
  }, [rallyClasses, newParticipant.className])

  const updateResult = (participantId: string, field: keyof ParticipantResult, value: any) => {
    setResults(prev => ({
      ...prev,
      [participantId]: {
        ...prev[participantId],
        [field]: value,
        isModified: true
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
      className: rallyClasses[0]?.class_name || rallyClasses[0]?.name || '' 
    })
    setShowAddParticipant(false)
  }

  const resetModificationFlags = () => {
    setResults(prev => {
      const resetResults = { ...prev }
      Object.keys(resetResults).forEach(id => {
        resetResults[id] = { ...resetResults[id], isModified: false }
      })
      return resetResults
    })
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
    resetNewParticipantForm,
    resetModificationFlags // NEW: For save optimization
  }
}