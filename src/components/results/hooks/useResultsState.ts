// src/components/results/hooks/useResultsState.ts - FIXED: Safe initialization
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

// Helper function to safely get class name
const getDefaultClassName = (rallyClasses: any[]): string => {
  if (!rallyClasses || rallyClasses.length === 0) return ''
  const firstClass = rallyClasses[0]
  return firstClass?.class_name || firstClass?.name || ''
}

export function useResultsState({ participants, rallyClasses }: UseResultsStateProps) {
  const [results, setResults] = useState<Record<string, ParticipantResult>>({})
  const [editMode, setEditMode] = useState(false)
  const [showAddParticipant, setShowAddParticipant] = useState(false)
  
  // Initialize with safe defaults
  const [newParticipant, setNewParticipant] = useState<ManualParticipant>({
    playerName: '',
    className: ''
  })

  // Initialize results from participants data
  useEffect(() => {
    if (participants.length > 0) {
      const initialResults: Record<string, ParticipantResult> = {}
      
      participants.forEach(participant => {
        const totalPoints = participant.total_points || null
        const extraPoints = participant.extra_points || null
        const overallPoints = (totalPoints || 0) + (extraPoints || 0)
        
        initialResults[participant.id] = {
          participantId: participant.id,
          playerName: participant.player_name || participant.participant_name || '',
          className: participant.class_name || '',
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
    if (rallyClasses && rallyClasses.length > 0) {
      const defaultClassName = getDefaultClassName(rallyClasses)
      
      // Only update if current className is empty or different
      setNewParticipant(prev => ({
        ...prev,
        className: prev.className || defaultClassName
      }))
    }
  }, [rallyClasses])

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
      className: getDefaultClassName(rallyClasses)
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