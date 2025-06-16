// src/components/results/utils/classBasedCalculations.ts - IMPROVED VERSION
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
  console.log('🔄 Starting class-based position calculation...')
  
  // Get all results with points (only participants who have results)
  const resultsWithPoints = Object.values(results).filter(r => 
    r.totalPoints !== null && r.totalPoints !== undefined && r.totalPoints >= 0
  )

  if (resultsWithPoints.length === 0) {
    console.log('No results with points found')
    return []
  }

  // Group by class
  const resultsByClass: Record<string, ParticipantResult[]> = {}
  resultsWithPoints.forEach(result => {
    const className = result.className || 'Teadmata klass'
    if (!resultsByClass[className]) {
      resultsByClass[className] = []
    }
    resultsByClass[className].push(result)
  })

  console.log(`Found ${Object.keys(resultsByClass).length} classes:`, Object.keys(resultsByClass))

  const finalResults: ClassPositionResult[] = []

  // ============================================================================
  // STEP 1: Calculate class positions (1st, 2nd, 3rd within each class)
  // ============================================================================
  
  Object.entries(resultsByClass).forEach(([className, classResults]) => {
    console.log(`\n📊 Processing class: ${className} with ${classResults.length} participants`)
    
    // Sort participants within class by points (descending = highest points first)
    const sortedClassResults = classResults.sort((a, b) => {
      const pointsA = a.totalPoints || 0
      const pointsB = b.totalPoints || 0
      return pointsB - pointsA // Descending order
    })

    // Assign class positions
    sortedClassResults.forEach((result, classIndex) => {
      const classPosition = classIndex + 1 // 1st, 2nd, 3rd in class
      
      console.log(`  ${classPosition}. ${result.playerName}: ${result.totalPoints} punkti`)
      
      finalResults.push({
        participantId: result.participantId,
        overallPosition: 0, // Will be calculated in step 2
        classPosition: classPosition,
        totalPoints: result.totalPoints || 0,
        className: className
      })
    })
  })

  // ============================================================================
  // STEP 2: Calculate overall positions across all classes
  // ============================================================================
  
  // Sort all results by total points (highest first) for overall ranking
  finalResults.sort((a, b) => b.totalPoints - a.totalPoints)
  
  // Assign overall positions
  finalResults.forEach((result, overallIndex) => {
    result.overallPosition = overallIndex + 1
  })

  console.log('\n✅ Final positions calculated:')
  finalResults.forEach(result => {
    console.log(`  Overall #${result.overallPosition} (${result.className} #${result.classPosition}): ${result.participantId} - ${result.totalPoints} pts`)
  })

  console.log(`\n🏁 Total participants processed: ${finalResults.length}`)
  console.log(`📊 Classes processed: ${Object.keys(resultsByClass).length}`)
  
  return finalResults
}

// ============================================================================
// HELPER FUNCTION: Get class statistics
// ============================================================================

export function getClassStatistics(results: Record<string, ParticipantResult>) {
  const resultsByClass: Record<string, {
    count: number
    withResults: number
    averagePoints: number
    highestPoints: number
    lowestPoints: number
  }> = {}

  Object.values(results).forEach(result => {
    const className = result.className || 'Teadmata klass'
    
    if (!resultsByClass[className]) {
      resultsByClass[className] = {
        count: 0,
        withResults: 0,
        averagePoints: 0,
        highestPoints: 0,
        lowestPoints: Infinity
      }
    }

    resultsByClass[className].count++

    if (result.totalPoints !== null && result.totalPoints !== undefined && result.totalPoints >= 0) {
      resultsByClass[className].withResults++
      
      const points = result.totalPoints
      resultsByClass[className].highestPoints = Math.max(resultsByClass[className].highestPoints, points)
      resultsByClass[className].lowestPoints = Math.min(resultsByClass[className].lowestPoints, points)
    }
  })

  // Calculate averages
  Object.keys(resultsByClass).forEach(className => {
    const classData = resultsByClass[className]
    const totalPoints = Object.values(results)
      .filter(r => r.className === className && r.totalPoints !== null && r.totalPoints >= 0)
      .reduce((sum, r) => sum + (r.totalPoints || 0), 0)
    
    classData.averagePoints = classData.withResults > 0 ? totalPoints / classData.withResults : 0
    
    // Handle edge case where no one has points
    if (classData.lowestPoints === Infinity) {
      classData.lowestPoints = 0
    }
  })

  return resultsByClass
}

// ============================================================================
// VALIDATION FUNCTION: Check for duplicate class positions ONLY
// ============================================================================

export function validateClassPositions(results: ClassPositionResult[]): string[] {
  const errors: string[] = []
  
  // Check for duplicate class positions within each class
  const classesByPosition = new Map<string, Map<number, string[]>>()
  results.forEach(result => {
    if (!classesByPosition.has(result.className)) {
      classesByPosition.set(result.className, new Map())
    }
    
    const classPositions = classesByPosition.get(result.className)!
    const pos = result.classPosition
    
    if (!classPositions.has(pos)) {
      classPositions.set(pos, [])
    }
    classPositions.get(pos)!.push(result.participantId)
  })

  classesByPosition.forEach((positions, className) => {
    positions.forEach((participants, position) => {
      if (participants.length > 1) {
        errors.push(`Duplikaat klassipositsioon ${position} klassis ${className}: ${participants.join(', ')}`)
      }
    })
  })

  return errors
}