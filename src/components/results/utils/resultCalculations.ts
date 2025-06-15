// src/components/results/utils/resultCalculations.ts
import type { ParticipantResult } from '../hooks/useResultsState'

export function calculatePositionsFromPoints(
  results: Record<string, ParticipantResult>,
  updateResult: (participantId: string, field: keyof ParticipantResult, value: any) => void
) {
  const resultsArray = Object.values(results)
    .filter(r => r.totalPoints !== null && r.totalPoints > 0)
    .sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0))

  resultsArray.forEach((result, index) => {
    updateResult(result.participantId, 'overallPosition', index + 1)
  })
}

export function clearParticipantResults(
  participantId: string,
  updateResult: (participantId: string, field: keyof ParticipantResult, value: any) => void
) {
  updateResult(participantId, 'overallPosition', null)
  updateResult(participantId, 'totalPoints', null)
}

export function sortParticipantsByResults(
  participants: any[],
  results: Record<string, ParticipantResult>
) {
  return participants.sort((a, b) => {
    const aResult = results[a.id]
    const bResult = results[b.id]
    
    if (aResult?.overallPosition && bResult?.overallPosition) {
      return aResult.overallPosition - bResult.overallPosition
    }
    if (aResult?.overallPosition && !bResult?.overallPosition) return -1
    if (!aResult?.overallPosition && bResult?.overallPosition) return 1
    return (aResult?.playerName || '').localeCompare(bResult?.playerName || '')
  })
}