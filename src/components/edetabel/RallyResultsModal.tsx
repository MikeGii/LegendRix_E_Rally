// src/components/edetabel/RallyResultsModal.tsx - MINIMALISTIC DATA-DENSE REDESIGN
'use client'

import { useState } from 'react'
import { useApprovedRallyResults } from '@/hooks/useApprovedRallies'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { ApprovedRally } from '@/hooks/useApprovedRallies'

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

  // Sort each class by class_position
  Object.keys(resultsByClass).forEach(className => {
    resultsByClass[className].sort((a, b) => {
      const aPos = a.class_position || 999
      const bPos = b.class_position || 999
      return aPos - bPos
    })
  })

  const sortedClasses = Object.keys(resultsByClass).sort((a, b) => {
    const bestA = Math.min(...resultsByClass[a].map(r => r.overall_position || 999))
    const bestB = Math.min(...resultsByClass[b].map(r => r.overall_position || 999))
    return bestA - bestB
  })

  // Get filtered results based on selected class
  const filteredResults = selectedClass === 'all' 
    ? null // We'll handle "all classes" differently with sections
    : resultsByClass[selectedClass] || []

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('et-EE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const getPodiumIcon = (position: number) => {
    switch (position) {
      case 1: return '🥇'
      case 2: return '🥈'
      case 3: return '🥉'
      default: return position <= 10 ? '⭐' : ''
    }
  }

  const getPositionColor = (position: number) => {
    if (position <= 3) return 'text-yellow-400 font-bold'
    if (position <= 10) return 'text-blue-400 font-semibold'
    return 'text-slate-300'
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-2">
      <div className="bg-slate-900/95 backdrop-blur-xl rounded-xl border border-slate-700 w-full max-w-7xl max-h-[95vh] overflow-hidden shadow-2xl">
        
        {/* Compact Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700/50 bg-slate-800/30">
          <div className="flex-1">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-bold text-white truncate">{rally.name}</h2>
              <span className="text-xs text-slate-400">|</span>
              <span className="text-sm text-slate-400">{formatDate(rally.competition_date)}</span>
              <span className="text-xs text-slate-400">|</span>
              <span className="text-sm text-blue-400">{rally.game_name}</span>
              
              {/* Events Info - Compact */}
              {rallyEvents.length > 0 && (
                <>
                  <span className="text-xs text-slate-400">|</span>
                  <button
                    onClick={() => setShowEvents(!showEvents)}
                    className="flex items-center gap-1 text-sm text-green-400 hover:text-green-300 transition-colors"
                  >
                    <span>🌍</span>
                    <span>{rallyEvents.length} {rallyEvents.length === 1 ? 'riik' : 'riiki'}</span>
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
          
          {/* Class Filter */}
          <div className="flex items-center gap-3">
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
              className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Compact Data Table */}
        <div className="overflow-y-auto max-h-[calc(95vh-80px)]">
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
                // ALL CLASSES VIEW - Separated by class sections
                <div>
                  {/* Table Header */}
                  <div className="sticky top-0 bg-slate-800/90 backdrop-blur border-b border-slate-700/50 text-xs font-medium text-slate-400 uppercase tracking-wide">
                    <div className="grid grid-cols-12 gap-2 py-2 px-3">
                      <div className="col-span-1 text-center">Koht</div>
                      <div className="col-span-4">Osaleja</div>
                      <div className="col-span-2">Klass</div>
                      <div className="col-span-2 text-center">Klassik.</div>
                      <div className="col-span-2 text-right">Punktid</div>
                      <div className="col-span-1 text-center">🏆</div>
                    </div>
                  </div>

                  {/* Class Sections */}
                  {sortedClasses.map((className, classIndex) => {
                    const classResults = resultsByClass[className]
                    return (
                      <div key={className}>
                        {/* Class Separator Header */}
                        <div className="sticky top-[32px] bg-slate-800/90 backdrop-blur border-y border-slate-600/30 px-3 py-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-white font-bold text-sm">📊 {className.toUpperCase()}</span>
                              <span className="text-slate-400 text-xs">({classResults.length} osalejat)</span>
                            </div>
                            <div className="text-slate-400 text-xs">
                              Parim: {classResults[0]?.total_points?.toFixed(1) || '0.0'} punkti
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
                                  isTopPerformer ? 'bg-gradient-to-r from-yellow-500/5 to-transparent' : ''
                                }`}
                              >
                                {/* Position (Class Position in All Classes view) */}
                                <div className="col-span-1 text-center">
                                  <span className={getPositionColor(classPosition)}>
                                    {classPosition}
                                  </span>
                                </div>

                                {/* Participant Name */}
                                <div className="col-span-4 flex items-center gap-2">
                                  <div className="w-5 h-5 bg-slate-700 rounded-full flex items-center justify-center text-xs text-white">
                                    {result.participant_name.charAt(0).toUpperCase()}
                                  </div>
                                  <span className="text-white font-medium truncate">
                                    {result.participant_name}
                                  </span>
                                </div>

                                {/* Class */}
                                <div className="col-span-2">
                                  <span className="text-slate-300 text-xs truncate">
                                    {result.class_name}
                                  </span>
                                </div>

                                {/* Class Position */}
                                <div className="col-span-2 text-center">
                                  <span className={`text-xs ${classPosition <= 3 ? 'text-yellow-400 font-bold' : 'text-slate-400'}`}>
                                    {classPosition}
                                  </span>
                                </div>

                                {/* Points */}
                                <div className="col-span-2 text-right">
                                  <span className={`font-bold ${getPositionColor(classPosition)}`}>
                                    {result.total_points?.toFixed(1) || '0.0'}
                                  </span>
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
                // SINGLE CLASS VIEW - Original table
                <div>
                  {/* Table Header */}
                  <div className="sticky top-0 bg-slate-800/90 backdrop-blur border-b border-slate-700/50 text-xs font-medium text-slate-400 uppercase tracking-wide">
                    <div className="grid grid-cols-12 gap-2 py-2 px-3">
                      <div className="col-span-1 text-center">Koht</div>
                      <div className="col-span-4">Osaleja</div>
                      <div className="col-span-2">Klass</div>
                      <div className="col-span-2 text-center">Klassik.</div>
                      <div className="col-span-2 text-right">Punktid</div>
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
                            isTopPerformer ? 'bg-gradient-to-r from-yellow-500/5 to-transparent' : ''
                          }`}
                        >
                          {/* Position */}
                          <div className="col-span-1 text-center">
                            <span className={getPositionColor(position || 999)}>
                              {position || '-'}
                            </span>
                          </div>

                          {/* Participant Name */}
                          <div className="col-span-4 flex items-center gap-2">
                            <div className="w-5 h-5 bg-slate-700 rounded-full flex items-center justify-center text-xs text-white">
                              {result.participant_name.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-white font-medium truncate">
                              {result.participant_name}
                            </span>
                          </div>

                          {/* Class */}
                          <div className="col-span-2">
                            <span className="text-slate-300 text-xs truncate">
                              {result.class_name}
                            </span>
                          </div>

                          {/* Class Position */}
                          <div className="col-span-2 text-center">
                            <span className={`text-xs ${result.class_position && result.class_position <= 3 ? 'text-yellow-400 font-bold' : 'text-slate-400'}`}>
                              {result.class_position || '-'}
                            </span>
                          </div>

                          {/* Points */}
                          <div className="col-span-2 text-right">
                            <span className={`font-bold ${getPositionColor(position || 999)}`}>
                              {result.total_points?.toFixed(1) || '0.0'}
                            </span>
                          </div>

                          {/* Podium Icon */}
                          <div className="col-span-1 text-center">
                            <span className="text-xs">
                              {getPodiumIcon(result.class_position || 999)}
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
  )
}