// src/components/edetabel/RallyResultsModal.tsx - COMPLETE WITH EXTRA POINTS SUPPORT
'use client'

import { useState } from 'react'
import { useApprovedRallyResults } from '@/hooks/useApprovedRallies'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { ApprovedRally } from '@/hooks/useApprovedRallies'
import { ClickablePlayerName } from '../player/ClickablePlayerName'

interface RallyResultsModalProps {
  rally: ApprovedRally
  isOpen: boolean
  onClose: () => void
}

// Hook to fetch rally events for the modal
function useRallyEvents(rallyId: string) {
  return useQuery({
    queryKey: ['rally-events', rallyId],
    queryFn: async () => {
      if (!rallyId) return []

      const { data, error } = await supabase
        .from('rally_events')
        .select(`
          event_id,
          event_order,
          event:game_events(name),
          rally_event_tracks(
            track:event_tracks(name)
          )
        `)
        .eq('rally_id', rallyId)
        .eq('is_active', true)
        .order('event_order', { ascending: true })

      if (error) {
        console.error('Error fetching rally events:', error)
        return []
      }

      return data?.map(re => ({
        event_id: re.event_id,
        event_name: (re.event as any)?.name || 'Unknown Event',
        event_order: re.event_order,
        tracks: re.rally_event_tracks || []
      })) || []
    },
    enabled: !!rallyId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

export function RallyResultsModal({ rally, isOpen, onClose }: RallyResultsModalProps) {
  const { data: results = [], isLoading } = useApprovedRallyResults(rally.id)
  const { data: rallyEvents = [], isLoading: eventsLoading } = useRallyEvents(rally.id)
  const [selectedClass, setSelectedClass] = useState<string>('all')
  const [showEvents, setShowEvents] = useState(false)
  const [isPlayerModalOpen, setIsPlayerModalOpen] = useState(false)

  if (!isOpen) return null

  // Define class priority order - Pro should always be above Semi-Pro
  const getClassPriority = (className: string): number => {
    const lowerName = className.toLowerCase()
    if (lowerName.includes('pro') && !lowerName.includes('semi')) {
      return 1 // Pro class has highest priority
    }
    if (lowerName.includes('semi') && lowerName.includes('pro')) {
      return 2 // Semi-Pro class has second priority
    }
    return 3 // All other classes
  }

  // Group results by class and sort each class by class_position
  const resultsByClass = results.reduce((acc, result) => {
    const className = result.class_name || 'Unknown Class'
    if (!acc[className]) {
      acc[className] = []
    }
    acc[className].push(result)
    return acc
  }, {} as Record<string, typeof results>)

  // Sort each class by class_position, then by overall_points, then by extra_points
  Object.keys(resultsByClass).forEach(className => {
    resultsByClass[className].sort((a, b) => {
      // First sort by class position
      const aPos = a.class_position || 999
      const bPos = b.class_position || 999
      
      if (aPos !== bPos) {
        return aPos - bPos
      }
      
      // If same class position, sort by overall points
      const aOverall = a.overall_points || 0
      const bOverall = b.overall_points || 0
      
      if (aOverall !== bOverall) {
        return bOverall - aOverall
      }
      
      // Tiebreaker: extra points (higher is better)
      return (b.extra_points || 0) - (a.extra_points || 0)
    })
  })

  // Sort classes with Pro class always above Semi-Pro class
  const sortedClasses = Object.keys(resultsByClass).sort((a, b) => {
    const priorityA = getClassPriority(a)
    const priorityB = getClassPriority(b)
    
    // If different priorities, sort by priority
    if (priorityA !== priorityB) {
      return priorityA - priorityB
    }
    
    // If same priority, sort by best overall position in class
    const bestA = Math.min(...resultsByClass[a].map(r => r.overall_position || 999))
    const bestB = Math.min(...resultsByClass[b].map(r => r.overall_position || 999))
    return bestA - bestB
  })

  // Get filtered results based on selected class
  const filteredResults = selectedClass === 'all' 
    ? results.sort((a, b) => {
        // First sort by class priority
        const classAPriority = getClassPriority(a.class_name || '')
        const classBPriority = getClassPriority(b.class_name || '')
        
        if (classAPriority !== classBPriority) {
          return classAPriority - classBPriority
        }
        
        // Then by overall position
        const aPos = a.overall_position || 999
        const bPos = b.overall_position || 999
        return aPos - bPos
      })
    : resultsByClass[selectedClass] || []

  // Check if any results have extra points
  const hasExtraPoints = results.some(result => result.extra_points > 0)

  // Helper functions for display
  const formatTime = (totalSeconds: number | null): string => {
    if (!totalSeconds) return '-'
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = (totalSeconds % 60).toFixed(3)
    return `${minutes}:${seconds.padStart(6, '0')}`
  }

  const getPositionColor = (position: number | null): string => {
    if (!position) return 'text-slate-400'
    if (position === 1) return 'text-yellow-400'
    if (position === 2) return 'text-slate-300'
    if (position === 3) return 'text-orange-400'
    return 'text-slate-400'
  }

  const getPodiumIcon = (position: number | null): string => {
    if (position === 1) return '🥇'
    if (position === 2) return '🥈'
    if (position === 3) return '🥉'
    return ''
  }

  const handleBackdropClick = () => {
    onClose()
  }

  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  const renderParticipantName = (result: any) => {
    // SECURITY FIX: Differentiate between registered users and manual participants
    const isRegisteredUser = result.user_id && result.user_id !== 'manual-participant'
    const isManualParticipant = !result.user_id || result.user_id === 'manual-participant'

    if (isRegisteredUser) {
      // Registered user - secure clickable profile
      return (
        <ClickablePlayerName
          userId={result.user_id}
          playerName={result.participant_name}
          participantType="registered"
          className="font-medium text-white hover:text-blue-400"
          onModalOpen={() => setIsPlayerModalOpen(true)}
          onModalClose={() => setIsPlayerModalOpen(false)}
        />
      )
    } else {
      // Manual participant - not clickable, gray text to indicate difference
      return (
        <ClickablePlayerName
          playerName={result.participant_name}
          participantType="manual"
          className="font-medium text-gray-400"
        />
      )
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={handleBackdropClick}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div 
          className="relative w-full max-w-6xl bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-slate-700 shadow-2xl max-h-[95vh] flex flex-col"
          onClick={handleModalClick}
        >
          
          {/* FIXED Header */}
          <div className="flex-shrink-0 bg-slate-900/95 backdrop-blur-xl border-b border-slate-700 p-6">
            <div className="flex items-start justify-between gap-4">
              {/* Rally Info */}
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-bold text-white mb-2 truncate">
                  🏁 {rally.name}
                </h2>
                
                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400 mb-3">
                  <span className="flex items-center gap-1">
                    📅 {new Date(rally.competition_date).toLocaleDateString('et-EE')}
                  </span>
                  <span className="flex items-center gap-1">
                    🎮 {rally.game_name}
                  </span>
                  <span className="flex items-center gap-1">
                    👥 {rally.total_participants} osalejat
                  </span>
                  {rallyEvents.length > 0 && (
                    <>
                      <button
                        onClick={() => setShowEvents(!showEvents)}
                        className="flex items-center gap-1 hover:text-blue-400 transition-colors cursor-pointer"
                      >
                        <span>🏎️ {rallyEvents.length} {rallyEvents.length === 1 ? 'riik' : 'riiki'}</span>
                        <span className={`text-xs transition-transform ${showEvents ? 'rotate-180' : ''}`}>▼</span>
                      </button>
                    </>
                  )}
                </div>
                
                {/* Expandable Events List */}
                {showEvents && rallyEvents.length > 0 && (
                  <div className="mt-3 p-3 bg-slate-900/50 rounded-lg border border-slate-700/30">
                    <div className="flex flex-wrap gap-2">
                      {rallyEvents.map((event, index) => (
                        <div key={event.event_id || index} className="flex items-center gap-1 text-xs">
                          <span className="w-4 h-4 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center text-xs font-bold">
                            {event.event_order || index + 1}
                          </span>
                          <span className="text-slate-300">{event.event_name}</span>
                          {event.tracks && event.tracks.length > 0 && (
                            <span className="text-slate-500">({event.tracks.length} rada)</span>
                          )}
                          {index < rallyEvents.length - 1 && <span className="text-slate-600">•</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}


              </div>
              
              {/* Class Filter and Close Button */}
              <div className="flex items-center gap-3 flex-shrink-0">
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="px-3 py-1 bg-slate-800 border border-slate-600 rounded text-sm text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Kõik klassid</option>
                  {sortedClasses.map(className => (
                    <option key={className} value={className}>
                      {className} ({resultsByClass[className].length})
                    </option>
                  ))}
                </select>
                
                <button
                  onClick={onClose}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors flex-shrink-0"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>

          {/* SCROLLABLE Content Area */}
          <div className="flex-1 overflow-y-auto min-h-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-6 h-6 border-2 border-slate-600 border-t-blue-500 rounded-full animate-spin"></div>
                <span className="ml-3 text-slate-400 text-sm">Laen tulemusi...</span>
              </div>
            ) : results.length === 0 ? (
              <div className="text-center py-12">
                <span className="text-slate-400 text-sm">Tulemusi ei leitud</span>
              </div>
            ) : (
              <div className="bg-slate-900/50">
                {selectedClass === 'all' ? (
                  // ALL CLASSES VIEW - Separated by class sections with proper ordering
                  <div>
                    {/* Table Header */}
                    <div className="sticky top-0 bg-slate-800/90 backdrop-blur border-b border-slate-700/50 text-xs font-medium text-slate-400 uppercase tracking-wide">
                      <div className="grid grid-cols-12 gap-2 py-2 px-3">
                        <div className="col-span-1 text-center">Koht</div>
                        <div className="col-span-4">Osaleja</div>
                        <div className="col-span-2">Klass</div>
                        <div className="col-span-2 text-center">Klassik.</div>
                        <div className="col-span-2 text-right">
                          Punktid
                          {hasExtraPoints && (
                            <div className="text-xs text-slate-400 font-normal">(kokku)</div>
                          )}
                        </div>
                        <div className="col-span-1 text-center">🏆</div>
                      </div>
                    </div>

                    {/* Class Sections - Pro class will always be first */}
                    {sortedClasses.map((className, classIndex) => {
                      const classResults = resultsByClass[className]
                      const classPriority = getClassPriority(className)
                      
                      return (
                        <div key={className}>
                          {/* Class Separator Header */}
                          <div className="sticky top-[32px] bg-slate-800/90 backdrop-blur border-y border-slate-600/30 px-3 py-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className={`font-bold text-sm ${
                                  classPriority === 1 ? 'text-yellow-400' : 
                                  classPriority === 2 ? 'text-blue-400' : 'text-white'
                                }`}>
                                  📊 {className.toUpperCase()}
                                  {classPriority === 1 && ' (PRO)'}
                                  {classPriority === 2 && ' (SEMI-PRO)'}
                                </span>
                                <span className="text-slate-400 text-xs">({classResults.length} osalejat)</span>
                              </div>
                              <div className="text-slate-400 text-xs">
                                Parim: {hasExtraPoints ? 
                                  (classResults[0]?.overall_points?.toFixed(1) || '0.0') : 
                                  (classResults[0]?.total_points?.toFixed(1) || '0.0')
                                } punkti
                              </div>
                            </div>
                          </div>

                          {/* Class Results */}
                          <div className="divide-y divide-slate-700/20">
                            {classResults.map((result, index) => {
                              const classPosition = result.class_position || (index + 1)
                              const isTopPerformer = classPosition <= 3
                              
                              return (
                                <div 
                                  key={result.id}
                                  className={`grid grid-cols-12 gap-2 py-2 px-3 text-sm hover:bg-slate-800/30 transition-colors ${
                                    isTopPerformer ? 'bg-slate-800/20' : 'bg-slate-700/10'
                                  }`}
                                >
                                  {/* Class Position (Main Position Column) */}
                                  <div className="col-span-1 text-center">
                                    <span className={`font-bold ${getPositionColor(classPosition)}`}>
                                      {classPosition || '-'}
                                    </span>
                                  </div>

                                  {/* Participant Name */}
                                  <div className="col-span-4">
                                    {renderParticipantName(result)}
                                  </div>

                                  {/* Class */}
                                  <div className="col-span-2 text-slate-300 text-sm">
                                    {result.class_name}
                                  </div>

                                  {/* Class Position */}
                                  <div className="col-span-2 text-center">
                                    <span className={`font-bold ${
                                      classPosition === 1 ? 'text-yellow-400' : 
                                      classPosition === 2 ? 'text-slate-300' : 
                                      classPosition === 3 ? 'text-orange-400' : 'text-slate-400'
                                    }`}>
                                      {classPosition}
                                    </span>
                                  </div>

                                  {/* Points - UPDATED TO SHOW EXTRA POINTS */}
                                  <div className="col-span-2 text-right">
                                    <div className="flex flex-col items-end">
                                      {/* Overall Points (main display) */}
                                      <span className={`font-bold ${getPositionColor(classPosition)}`}>
                                        {hasExtraPoints ? 
                                          (result.overall_points?.toFixed(1) || '0.0') : 
                                          (result.total_points?.toFixed(1) || '0.0')
                                        }
                                      </span>
                                      
                                      {/* Breakdown if extra points exist */}
                                      {hasExtraPoints && result.extra_points > 0 && (
                                        <span className="text-xs text-slate-400">
                                          {result.total_points?.toFixed(1) || '0.0'} + {result.extra_points?.toFixed(1)}
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  {/* Podium Icon */}
                                  <div className="col-span-1 text-center">
                                    <span className="text-xs">
                                      {getPodiumIcon(classPosition)}
                                    </span>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  // SINGLE CLASS VIEW - Original table with extra points support
                  <div>
                    {/* Table Header */}
                    <div className="sticky top-0 bg-slate-800/90 backdrop-blur border-b border-slate-700/50 text-xs font-medium text-slate-400 uppercase tracking-wide">
                      <div className="grid grid-cols-12 gap-2 py-2 px-3">
                        <div className="col-span-1 text-center">Koht</div>
                        <div className="col-span-4">Osaleja</div>
                        <div className="col-span-2">Klass</div>
                        <div className="col-span-2 text-center">Klassik.</div>
                        <div className="col-span-2 text-right">
                          Punktid
                          {hasExtraPoints && (
                            <div className="text-xs text-slate-400 font-normal">(kokku)</div>
                          )}
                        </div>
                        <div className="col-span-1 text-center">🏆</div>
                      </div>
                    </div>

                    {/* Results Rows */}
                    <div className="divide-y divide-slate-700/30">
                      {filteredResults.map((result, index) => {
                        const position = result.class_position
                        const isTopPerformer = position && position <= 3
                        
                        return (
                          <div 
                            key={result.id}
                            className={`grid grid-cols-12 gap-2 py-2 px-3 text-sm hover:bg-slate-800/30 transition-colors ${
                              isTopPerformer ? 'bg-slate-800/20' : ''
                            }`}
                          >
                            {/* Class Position (Main Position Column) */}
                            <div className="col-span-1 text-center">
                              <span className={`font-bold ${getPositionColor(position)}`}>
                                {position || '-'}
                              </span>
                            </div>

                            {/* Participant Name */}
                            <div className="col-span-4">
                              {renderParticipantName(result)}
                            </div>

                            {/* Class */}
                            <div className="col-span-2 text-slate-300 text-sm">
                              {result.class_name}
                            </div>

                            {/* Class Position */}
                            <div className="col-span-2 text-center">
                              <span className={`font-bold ${getPositionColor(position)}`}>
                                {position || '-'}
                              </span>
                            </div>

                            {/* Points - UPDATED TO SHOW EXTRA POINTS */}
                            <div className="col-span-2 text-right">
                              <div className="flex flex-col items-end">
                                {/* Overall Points (main display) */}
                                <span className={`font-bold ${getPositionColor(position)}`}>
                                  {hasExtraPoints ? 
                                    (result.overall_points?.toFixed(1) || '0.0') : 
                                    (result.total_points?.toFixed(1) || '0.0')
                                  }
                                </span>
                                
                                {/* Breakdown if extra points exist */}
                                {hasExtraPoints && result.extra_points > 0 && (
                                  <span className="text-xs text-slate-400">
                                    {result.total_points?.toFixed(1) || '0.0'} + {result.extra_points?.toFixed(1)}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Podium Icon */}
                            <div className="col-span-1 text-center">
                              <span className="text-xs">
                                {getPodiumIcon(position)}
                              </span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}