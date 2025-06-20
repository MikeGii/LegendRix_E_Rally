// src/components/results/hooks/useResultsState.ts - FIXED: Better data loading and state management
import { useState, useEffect } from 'react'

export interface ParticipantResult {
  participantId: string
  playerName: string
  className: string
  overallPosition: number | null
  classPosition: number | null
  totalPoints: number | null
  participated: boolean  // Load from rally_registrations.participated
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

  // Initialize results with participant data - IMPROVED
  useEffect(() => {
    if (participants.length === 0) return

    const initialResults: Record<string, ParticipantResult> = {}
    
    participants.forEach(participant => {
      // Determine if this is a manual participant
      const isManual = participant.user_id === 'manual-participant'
      
      initialResults[participant.id] = {
        participantId: participant.id,
        playerName: participant.player_name || participant.user_name || participant.participant_name || 'Unknown',
        className: participant.class_name || 'Unknown Class',
        
        // Load existing results if they exist
        overallPosition: participant.overall_position || null,
        classPosition: participant.class_position || null,
        totalPoints: participant.total_points || null,
        
        // FIXED: Load participation correctly based on participant type
        participated: isManual 
          ? true // Manual participants are assumed to have participated (they were added manually)
          : (participant.participated === true), // For registered participants, use the exact boolean value
        
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
    results,
    editMode,
    setEditMode,
    showAddParticipant,
    setShowAddParticipant,
    newParticipant,
    setNewParticipant,
    updateResult,
    removeParticipantFromState,
    resetNewParticipantForm,
    resetModificationFlags
  }
}