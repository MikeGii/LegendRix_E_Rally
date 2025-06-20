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
    result.totalPoints && result.totalPoints > 0
  )

  if (participantsWithPoints.length === 0) {
    return []
  }

  // Sort by points (descending) for overall positions
  const sortedByPoints = [...participantsWithPoints].sort((a, b) => 
    (b.totalPoints || 0) - (a.totalPoints || 0)
  )

  // Group by class for class positions
  const participantsByClass = _.groupBy(participantsWithPoints, 'className')

  const calculatedPositions: CalculatedPosition[] = []

  // Calculate overall positions
  sortedByPoints.forEach((participant, index) => {
    const overallPosition = index + 1
    
    // Find class position
    const classParticipants = participantsByClass[participant.className] || []
    const sortedClassParticipants = classParticipants.sort((a, b) => 
      (b.totalPoints || 0) - (a.totalPoints || 0)
    )
    
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