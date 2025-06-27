// src/components/edetabel/RallyResultsModal.tsx - Main Component
'use client'

import { useState, useEffect } from 'react'
import { useApprovedRallyResults } from '@/hooks/useApprovedRallies'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { ApprovedRally } from '@/hooks/useApprovedRallies'
import { RallyResultsHeader } from './rally-results/RallyResultsHeader'
import { RallyResultsTable } from './rally-results/RallyResultsTable'
import { RallyResultsAllClasses } from './rally-results/RallyResultsAllClasses'
import { LoadingSpinner } from './rally-results/LoadingSpinner'
import { EmptyState } from './rally-results/EmptyState'

interface RallyResultsModalProps {
  rally: ApprovedRally
  isOpen: boolean
  onClose: () => void
}

// Hook to fetch rally events
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
  const { data: rallyEvents = [] } = useRallyEvents(rally.id)
  const [selectedClass, setSelectedClass] = useState<string>('all')
  const [isPlayerModalOpen, setIsPlayerModalOpen] = useState(false)

  // Handle ESC key and prevent body scroll
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      const scrollY = window.scrollY
      document.body.style.overflow = 'hidden'
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollY}px`
      document.body.style.width = '100%'
      
      return () => {
        document.removeEventListener('keydown', handleEscape)
        document.body.style.overflow = ''
        document.body.style.position = ''
        document.body.style.top = ''
        document.body.style.width = ''
        window.scrollTo(0, scrollY)
      }
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  // Group results by class
  const resultsByClass = results.reduce((acc, result) => {
    const className = result.class_name || 'Unknown Class'
    if (!acc[className]) {
      acc[className] = []
    }
    acc[className].push(result)
    return acc
  }, {} as Record<string, typeof results>)

  // Get sorted classes
  const sortedClasses = Object.keys(resultsByClass).sort((a, b) => {
    const priorityA = getClassPriority(a)
    const priorityB = getClassPriority(b)
    
    if (priorityA !== priorityB) {
      return priorityA - priorityB
    }
    
    return a.localeCompare(b)
  })

  // Get filtered results
  const filteredResults = selectedClass === 'all' 
    ? results
    : resultsByClass[selectedClass] || []

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/95 backdrop-blur-md"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="relative w-full max-w-7xl max-h-[80vh] flex">
        <div className="relative w-full tech-border rounded-2xl shadow-[0_0_50px_rgba(255,0,64,0.3)] bg-black/95 flex flex-col">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 z-20 w-12 h-12 flex items-center justify-center rounded-xl bg-red-600/20 border-2 border-red-500/50 text-red-400 hover:bg-red-600/30 hover:border-red-500 hover:text-red-300 transition-all duration-300 shadow-[0_0_20px_rgba(255,0,64,0.3)]"
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto custom-modal-scrollbar">
            {/* Header */}
            <RallyResultsHeader
              rally={rally}
              results={results}
              selectedClass={selectedClass}
              setSelectedClass={setSelectedClass}
              sortedClasses={sortedClasses}
              resultsByClass={resultsByClass}
              rallyEvents={rallyEvents}
            />

            {/* Content */}
            <div className="p-6">
              {isLoading ? (
                <LoadingSpinner />
              ) : filteredResults.length === 0 ? (
                <EmptyState />
              ) : (
                <>
                  {selectedClass === 'all' ? (
                    <RallyResultsAllClasses
                      sortedClasses={sortedClasses}
                      resultsByClass={resultsByClass}
                      onPlayerModalStateChange={setIsPlayerModalOpen}
                    />
                  ) : (
                    <div>
                      <h3 className="text-lg font-bold text-red-400 font-['Orbitron'] uppercase tracking-wider mb-4">
                        {selectedClass}
                      </h3>
                      <RallyResultsTable 
                        results={filteredResults}
                        onPlayerModalStateChange={setIsPlayerModalOpen}
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper function for class priority
export function getClassPriority(className: string): number {
  const lowerName = className.toLowerCase()
  if (lowerName.includes('pro') && !lowerName.includes('semi')) {
    return 1
  }
  if (lowerName.includes('semi') && lowerName.includes('pro')) {
    return 2
  }
  return 3
}