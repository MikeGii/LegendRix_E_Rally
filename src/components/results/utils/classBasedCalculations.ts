// src/components/results/utils/classBasedCalculations.ts - SIMPLIFIED: Removed participated logic
import _ from 'lodash'
import type { ParticipantResult } from '../hooks/useResultsState'

export interface CalculatedPosition {
  participantId: string
  overallPosition: number
  classPosition: number
}

export function calculateClassBasedPositions(
  results: Record<string, ParticipantResult>
): CalculatedPosition[] {
  // Filter to only participants with points > 0
  const participantsWithPoints = Object.values(results).filter(result => 
    result.overallPoints && result.overallPoints > 0
  )

  if (participantsWithPoints.length === 0) {
    return []
  }

  // Sort by overall points (descending), then by extra points (descending) for tiebreaker
  const sortedByOverallPoints = [...participantsWithPoints].sort((a, b) => {
    const overallPointsDiff = (b.overallPoints || 0) - (a.overallPoints || 0)
    if (overallPointsDiff !== 0) {
      return overallPointsDiff
    }
    // Tiebreaker: extra points (higher is better)
    return (b.extraPoints || 0) - (a.extraPoints || 0)
  })

  // Group by class for class positions
  const participantsByClass = _.groupBy(participantsWithPoints, 'className')

  const calculatedPositions: CalculatedPosition[] = []

  // Calculate overall positions
  sortedByOverallPoints.forEach((participant, index) => {
    const overallPosition = index + 1
    
    // Find class position using same sorting logic
    const classParticipants = participantsByClass[participant.className] || []
    const sortedClassParticipants = classParticipants.sort((a, b) => {
      const overallPointsDiff = (b.overallPoints || 0) - (a.overallPoints || 0)
      if (overallPointsDiff !== 0) {
        return overallPointsDiff
      }
      // Tiebreaker: extra points (higher is better)
      return (b.extraPoints || 0) - (a.extraPoints || 0)
    })
    
    const classPosition = sortedClassParticipants.findIndex(p => 
      p.participantId === participant.participantId
    ) + 1

    calculatedPositions.push({
      participantId: participant.participantId,
      overallPosition,
      classPosition
    })
  })

  return calculatedPositions
}