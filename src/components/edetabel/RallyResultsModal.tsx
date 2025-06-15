// src/components/edetabel/RallyResultsModal.tsx - SEPARATE TABLES BY CLASS
'use client'

import { useState } from 'react'
import { useApprovedRallyResults } from '@/hooks/useApprovedRallies'
import type { ApprovedRally } from '@/hooks/useApprovedRallies'

interface RallyResultsModalProps {
  rally: ApprovedRally
  isOpen: boolean
  onClose: () => void
}

export function RallyResultsModal({ rally, isOpen, onClose }: RallyResultsModalProps) {
  const { data: results = [], isLoading } = useApprovedRallyResults(rally.id)

  if (!isOpen) return null

  // Group results by class and sort each class by class_position
  const resultsByClass = results.reduce((acc, result) => {
    const className = result.class_name || 'Unknown Class'
    if (!acc[className]) {
      acc[className] = []
    }
    acc[className].push(result)
    return acc
  }, {} as Record<string, typeof results>)

  // Sort each class by class_position (1st, 2nd, 3rd within each class)
  Object.keys(resultsByClass).forEach(className => {
    resultsByClass[className].sort((a, b) => {
      const aPos = a.class_position || 999
      const bPos = b.class_position || 999
      return aPos - bPos
    })
  })

  // Sort classes by the best overall position in each class
  const sortedClasses = Object.keys(resultsByClass).sort((a, b) => {
    const bestA = Math.min(...resultsByClass[a].map(r => r.overall_position || 999))
    const bestB = Math.min(...resultsByClass[b].map(r => r.overall_position || 999))
    return bestA - bestB
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('et-EE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

    const getPodiumEmoji = (position: number) => {
    switch (position) {
        case 1: return '🥇'
        case 2: return '🥈'
        case 3: return '🥉'
        default: return ''  // ✅ Empty string for positions 4+
    }
    }

  const getPositionColors = (position: number) => {
    switch (position) {
      case 1: return 'text-yellow-400'
      case 2: return 'text-slate-300'
      case 3: return 'text-orange-400'
      default: return 'text-white'
    }
  }

  const getPositionBackground = (position: number) => {
    switch (position) {
      case 1: return 'bg-gradient-to-r from-yellow-500 to-yellow-600'
      case 2: return 'bg-gradient-to-r from-slate-400 to-slate-500'
      case 3: return 'bg-gradient-to-r from-orange-500 to-orange-600'
      default: return 'bg-slate-700'
    }
  }

  const getClassHeaderColor = (index: number) => {
    const colors = [
      'from-blue-500 to-blue-600',
      'from-green-500 to-green-600',
      'from-purple-500 to-purple-600',
      'from-red-500 to-red-600',
      'from-orange-500 to-orange-600',
      'from-pink-500 to-pink-600'
    ]
    return colors[index % colors.length]
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-2xl border border-slate-700 w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">{rally.name}</h2>
              <div className="flex items-center gap-4 text-sm text-slate-400">
                <span>{formatDate(rally.competition_date)}</span>
                <span>•</span>
                <span>{rally.game_name}</span>
                <span>•</span>
                <span>{rally.total_participants} osalejat</span>
                <span>•</span>
                <span>{sortedClasses.length} klassi</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <span className="text-xl">✕</span>
            </button>
          </div>
        </div>

        {/* Results by Class */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-4 border-slate-600 border-t-blue-500 rounded-full animate-spin"></div>
              <p className="text-slate-400 mt-4">Laen tulemusi...</p>
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-12">
              <span className="text-4xl mb-4 block">🏁</span>
              <p className="text-slate-400">Tulemusi ei leitud</p>
            </div>
          ) : (
            <div className="space-y-8 p-6">
              {sortedClasses.map((className, classIndex) => {
                const classResults = resultsByClass[className]
                const classWinner = classResults[0]
                
                return (
                  <div key={className} className="space-y-4">
                    {/* Class Header */}
                    <div className={`bg-gradient-to-r ${getClassHeaderColor(classIndex)} rounded-xl p-6 text-white`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-2xl font-bold mb-2">{className}</h3>
                          <div className="flex items-center gap-4 text-sm opacity-90">
                            <span>{classResults.length} osalejat</span>
                            {classWinner && (
                              <>
                                <span>•</span>
                                <span>Võitja: {classWinner.participant_name}</span>
                                <span>•</span>
                                <span>{classWinner.total_points?.toFixed(1)} punkti</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl mb-2">🏆</div>
                          <div className="text-sm opacity-75">
                            {classIndex + 1}. klass üldises arvestuses
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Class Results Table */}
                    <div className="bg-slate-800/30 rounded-xl border border-slate-700/50 overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-slate-800/50">
                          <tr>
                            <th className="text-left py-4 px-6 text-slate-400 font-medium">
                              Koht
                            </th>
                            <th className="text-left py-4 px-6 text-slate-400 font-medium">
                              Osaleja
                            </th>
                            <th className="text-right py-4 px-6 text-slate-400 font-medium">
                              Punktid
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {classResults.map((result, index) => {
                            // FIXED: Use the actual class_position from the database
                            const classPosition = result.class_position || (index + 1)
                            const isTopThree = classPosition <= 3
                            
                            return (
                              <tr 
                                key={result.id} 
                                className={`border-b border-slate-700/30 hover:bg-slate-800/20 transition-colors ${
                                  isTopThree ? 'bg-gradient-to-r from-yellow-500/5 to-transparent' : ''
                                }`}
                              >
                                {/* Class Position - FIXED: Use database class_position */}
                                <td className="py-4 px-6">
                                  <div className="flex items-center gap-3">
                                    <span className="text-2xl">
                                      {getPodiumEmoji(classPosition)}
                                    </span>
                                    <span className={`font-bold text-xl ${getPositionColors(classPosition)}`}>
                                      {classPosition}
                                    </span>
                                  </div>
                                </td>

                                {/* Participant */}
                                <td className="py-4 px-6">
                                  <div className="flex items-center gap-3">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
                                      getPositionBackground(classPosition)
                                    }`}>
                                      {result.participant_name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                      <div className="text-white font-medium text-lg">
                                        {result.participant_name}
                                      </div>
                                      {result.registration_date && (
                                        <div className="text-xs text-slate-400">
                                          Registreeritud: {formatDate(result.registration_date)}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </td>

                                {/* Points */}
                                <td className="py-4 px-6 text-right">
                                  <span className={`text-xl font-bold ${getPositionColors(classPosition)}`}>
                                    {result.total_points?.toFixed(1) || '0.0'}
                                  </span>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer with Overall Statistics */}
        <div className="p-6 border-t border-slate-700 bg-slate-800/30">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-white">{rally.total_participants}</div>
              <div className="text-xs text-slate-400">Kokku osalejaid</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-400">{rally.participants_with_results}</div>
              <div className="text-xs text-slate-400">Tulemustega</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-400">{sortedClasses.length}</div>
              <div className="text-xs text-slate-400">Klasse</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-400">
                {Math.max(...results.map(r => r.total_points || 0)).toFixed(1)}
              </div>
              <div className="text-xs text-slate-400">Parim tulemus</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}