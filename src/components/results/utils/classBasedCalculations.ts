// src/components/results/utils/classBasedCalculations.ts - FINAL FIX: No positions for non-participants

import type { ParticipantResult } from '../hooks/useResultsState'

export interface CalculatedPosition {
  participantId: string
  overallPosition: number | null  // NULL for non-participants
  classPosition: number | null    // NULL for non-participants
  totalPoints: number
  className: string
  participated: boolean
}

export function calculateClassBasedPositions(results: Record<string, ParticipantResult>): CalculatedPosition[] {
  const finalResults: CalculatedPosition[] = []

  // Group results by class
  const resultsByClass: Record<string, ParticipantResult[]> = {}
  
  Object.values(results).forEach(result => {
    const className = result.className || 'Teadmata klass'
    if (!resultsByClass[className]) {
      resultsByClass[className] = []
    }
    resultsByClass[className].push(result)
  })

  // Process each class separately with improved sorting
  Object.entries(resultsByClass).forEach(([className, classResults]) => {
    // SEPARATE: Participants vs Non-participants
    const participatedResults = classResults.filter(r => r.participated)
    const nonParticipatedResults = classResults.filter(r => !r.participated)

    // SORT PARTICIPATED PARTICIPANTS ONLY:
    // 1. Participants with points > 0 (by points DESC)
    // 2. Participants with 0 points (alphabetical)
    
    const participatedWithPoints = participatedResults.filter(r => 
      r.totalPoints !== null && r.totalPoints > 0
    ).sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0))
    
    const participatedWithZeroPoints = participatedResults.filter(r => 
      r.totalPoints === null || r.totalPoints === 0
    ).sort((a, b) => (a.playerName || '').localeCompare(b.playerName || ''))

    // Combine participated participants in correct order
    const sortedParticipated = [
      ...participatedWithPoints,
      ...participatedWithZeroPoints
    ]

    // ASSIGN POSITIONS ONLY TO PARTICIPANTS
    sortedParticipated.forEach((result, index) => {
      const classPosition = index + 1
      
      finalResults.push({
        participantId: result.participantId,
        overallPosition: 0, // Will be calculated later
        classPosition: classPosition,
        totalPoints: result.totalPoints || 0,
        className: className,
        participated: true
      })
    })

    // ADD NON-PARTICIPANTS WITHOUT POSITIONS
    nonParticipatedResults.forEach(result => {
      finalResults.push({
        participantId: result.participantId,
        overallPosition: null, // NO POSITION for non-participants
        classPosition: null,   // NO POSITION for non-participants
        totalPoints: 0,        // Force 0 points for non-participants
        className: className,
        participated: false
      })
    })
  })

  // CALCULATE OVERALL POSITIONS ONLY FOR PARTICIPANTS
  const participatedResults = finalResults.filter(r => r.participated)
    .sort((a, b) => b.totalPoints - a.totalPoints)
  
  const nonParticipatedResults = finalResults.filter(r => !r.participated)

  // Assign overall positions ONLY to participants
  participatedResults.forEach((result, index) => {
    result.overallPosition = index + 1
  })

  // Combine results: participants first, then non-participants
  const allSortedResults = [...participatedResults, ...nonParticipatedResults]
  
  return allSortedResults
}

// Function to determine participant status based on participation and points
export function getParticipantStatus(participated: boolean, totalPoints: number | null): 'Sisestatud' | 'Ei osale' | 'Ootel' {
  if (!participated) {
    return 'Ei osale'
  }
  
  if (totalPoints !== null) {
    return 'Sisestatud'
  }
  
  return 'Ootel'
}

// Get class statistics
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

    if (result.participated && result.totalPoints !== null && result.totalPoints !== undefined && result.totalPoints >= 0) {
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
      .filter(r => r.className === className && r.participated && r.totalPoints !== null && r.totalPoints >= 0)
      .reduce((sum, r) => sum + (r.totalPoints || 0), 0)
    
    classData.averagePoints = classData.withResults > 0 ? totalPoints / classData.withResults : 0
    
    if (classData.lowestPoints === Infinity) {
      classData.lowestPoints = 0
    }
  })

  return resultsByClass
}