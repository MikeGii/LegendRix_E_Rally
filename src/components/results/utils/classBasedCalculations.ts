import type { ParticipantResult } from '../hooks/useResultsState'

export interface ClassPositionResult {
  participantId: string
  overallPosition: number
  classPosition: number
  totalPoints: number
  className: string
}

export function calculateClassBasedPositions(
  results: Record<string, ParticipantResult>
): ClassPositionResult[] {
  console.log('🔄 Calculating class-based positions...')
  
  // Get all results with points
  const resultsWithPoints = Object.values(results).filter(r => 
    r.totalPoints !== null && r.totalPoints > 0
  )

  // Group by class
  const resultsByClass: Record<string, ParticipantResult[]> = {}
  resultsWithPoints.forEach(result => {
    const className = result.className || 'Unknown Class'
    if (!resultsByClass[className]) {
      resultsByClass[className] = []
    }
    resultsByClass[className].push(result)
  })

  const finalResults: ClassPositionResult[] = []
  let globalPosition = 1

  // Sort classes by their best score to determine overall ranking order
  const classOrderByBestScore = Object.entries(resultsByClass)
    .map(([className, classResults]) => {
      const bestScore = Math.max(...classResults.map(r => r.totalPoints || 0))
      return { className, bestScore, results: classResults }
    })
    .sort((a, b) => b.bestScore - a.bestScore)

  // Calculate positions within each class and assign overall positions
  classOrderByBestScore.forEach(({ className, results: classResults }) => {
    // Sort participants within class by points (descending)
    const sortedClassResults = classResults.sort((a, b) => 
      (b.totalPoints || 0) - (a.totalPoints || 0)
    )

    // Assign class positions and overall positions
    sortedClassResults.forEach((result, classIndex) => {
      finalResults.push({
        participantId: result.participantId,
        overallPosition: globalPosition++,
        classPosition: classIndex + 1, // 1st, 2nd, 3rd within class
        totalPoints: result.totalPoints || 0,
        className: result.className
      })
    })
  })

  console.log(`✅ Calculated positions for ${finalResults.length} participants across ${Object.keys(resultsByClass).length} classes`)
  return finalResults
}