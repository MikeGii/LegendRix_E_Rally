// src/components/results/utils/resultCalculations.ts - OPTIMIZED: Proper sorting with extra points tiebreaker

export interface ParticipantResult {
  participantId: string
  playerName: string
  className: string
  overallPosition: number | null
  classPosition: number | null
  totalPoints: number | null
  extraPoints: number | null
  overallPoints: number // Calculated field: totalPoints + extraPoints
}

export type UpdateResultFunction = (
  participantId: string, 
  field: keyof ParticipantResult, 
  value: any
) => void

export type ResultsState = Record<string, ParticipantResult>

/**
 * Calculate positions based on points with proper sorting logic
 * Higher overall points = better position (1st, 2nd, etc.)
 * Tiebreaker: extra points (higher = better)
 */
export function calculatePositionsFromPoints(
  results: ResultsState,
  updateResult: UpdateResultFunction
): void {
  const participants = Object.keys(results)

  // Group participants by class
  const participantsByClass = new Map<string, { id: string; result: ParticipantResult }[]>()

  participants.forEach(participantId => {
    const result = results[participantId]
    if (!result) return

    const className = result.className
    if (!participantsByClass.has(className)) {
      participantsByClass.set(className, [])
    }

    participantsByClass.get(className)!.push({
      id: participantId,
      result: {
        ...result,
        overallPoints: (result.totalPoints || 0) + (result.extraPoints || 0)
      }
    })
  })

  // Calculate overall positions (across all classes)
  const allParticipantsWithPoints = participants
    .map(id => ({
      id,
      result: results[id],
      overallPoints: (results[id]?.totalPoints || 0) + (results[id]?.extraPoints || 0)
    }))
    .sort((a, b) => {
      // Primary sort: overall points (descending - higher is better)
      if (b.overallPoints !== a.overallPoints) {
        return b.overallPoints - a.overallPoints
      }
      // Tiebreaker: extra points (descending - higher is better)
      const aExtraPoints = a.result?.extraPoints || 0
      const bExtraPoints = b.result?.extraPoints || 0
      return bExtraPoints - aExtraPoints
    })

  // Assign overall positions
  allParticipantsWithPoints.forEach((participant, index) => {
    updateResult(participant.id, 'overallPosition', index + 1)
  })

  // Calculate class positions within each class
  participantsByClass.forEach((classParticipants, className) => {
    const participantsWithPoints = classParticipants
      .sort((a, b) => {
        // Primary sort: overall points (descending)
        if (b.result.overallPoints !== a.result.overallPoints) {
          return b.result.overallPoints - a.result.overallPoints
        }
        // Tiebreaker: extra points (descending)
        const aExtraPoints = a.result.extraPoints || 0
        const bExtraPoints = b.result.extraPoints || 0
        return bExtraPoints - aExtraPoints
      })

    // Assign class positions
    participantsWithPoints.forEach((participant, index) => {
      updateResult(participant.id, 'classPosition', index + 1)
    })
  })
}

/**
 * Clear all results for a specific participant
 */
export function clearParticipantResults(
  participantId: string,
  updateResult: UpdateResultFunction
): void {
  updateResult(participantId, 'overallPosition', null)
  updateResult(participantId, 'classPosition', null)
  updateResult(participantId, 'totalPoints', null)
  updateResult(participantId, 'extraPoints', null)
}

/**
 * Validate that points are non-negative numbers
 */
export function validatePoints(value: any): number | null {
  if (value === null || value === undefined || value === '') {
    return null
  }
  
  const numValue = Number(value)
  if (isNaN(numValue)) {
    return null
  }
  
  return Math.max(0, Math.round(numValue)) // Ensure non-negative integers
}

/**
 * Validate that position is a positive integer
 */
export function validatePosition(value: any): number | null {
  if (value === null || value === undefined || value === '') {
    return null
  }
  
  const numValue = Number(value)
  if (isNaN(numValue) || numValue < 1) {
    return null
  }
  
  return Math.round(numValue) // Ensure positive integer
}

/**
 * Calculate overall points from total and extra points
 */
export function calculateOverallPoints(totalPoints: number | null, extraPoints: number | null): number {
  return (totalPoints || 0) + (extraPoints || 0)
}

/**
 * Sort participants for display (used in tables)
 * Participants with points first (sorted by overall points desc, then extra points desc)
 * Then participants without points (sorted alphabetically)
 */
export function sortParticipantsForDisplay<T extends { 
  id: string; 
  player_name?: string; 
  participant_name?: string; 
}>(
  participants: T[],
  results: ResultsState
): T[] {
  return [...participants].sort((a, b) => {
    const aResult = results[a.id]
    const bResult = results[b.id]
    
    const aOverallPoints = calculateOverallPoints(aResult?.totalPoints, aResult?.extraPoints)
    const bOverallPoints = calculateOverallPoints(bResult?.totalPoints, bResult?.extraPoints)
    
    const aHasPoints = aOverallPoints > 0
    const bHasPoints = bOverallPoints > 0
    
    // Participants with points come first
    if (aHasPoints && bHasPoints) {
      // Both have points - sort by overall points (descending), then extra points (descending)
      if (bOverallPoints !== aOverallPoints) {
        return bOverallPoints - aOverallPoints
      }
      return (bResult?.extraPoints || 0) - (aResult?.extraPoints || 0)
    }
    
    if (aHasPoints && !bHasPoints) return -1
    if (!aHasPoints && bHasPoints) return 1
    
    // Neither has points - sort alphabetically by name
    const aName = a.player_name || a.participant_name || ''
    const bName = b.player_name || b.participant_name || ''
    return aName.localeCompare(bName)
  })
}