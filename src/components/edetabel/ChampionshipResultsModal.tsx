// src/components/edetabel/ChampionshipResultsModal.tsx - REDESIGNED WITH FUTURISTIC THEME
'use client'

import { useState, useEffect } from 'react'
import { useChampionshipResults } from '@/hooks/useChampionshipResults'
import { ChampionshipHeader } from './championship-results/ChampionshipHeader'
import { ChampionshipStats } from './championship-results/ChampionshipStats'
import { ChampionshipResultsTable } from './championship-results/ChampionshipResultsTable'
import { ChampionshipAllClassesView } from './championship-results/ChampionshipAllClassesView'
import { ChampionshipWarnings } from './championship-results/ChampionshipWarnings'
import { LoadingSpinner } from './rally-results/LoadingSpinner'
import { EmptyState } from './rally-results/EmptyState'

interface ChampionshipResultsModalProps {
  isOpen: boolean
  onClose: () => void
  championshipId: string
  championshipName: string
}

export function ChampionshipResultsModal({ 
  isOpen, 
  onClose, 
  championshipId, 
  championshipName 
}: ChampionshipResultsModalProps) {
  const [selectedClass, setSelectedClass] = useState<string>('all')
  const [isPlayerModalOpen, setIsPlayerModalOpen] = useState(false)
  const { data: results, isLoading, error } = useChampionshipResults(championshipId)

  // Reset class filter when championship changes
  useEffect(() => {
    setSelectedClass('all')
  }, [championshipId])

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

  // Get unique classes
  const availableClasses = Array.from(
    new Set(results?.participants?.map(p => p.class_name) || [])
  ).sort()

  // Get sorted rally data for headers
  const sortedRallies = results?.participants?.[0]?.rally_scores
    ?.map(rs => ({
      rally_id: rs.rally_id,
      rally_name: rs.rally_name,
      etapp_number: rs.etapp_number
    }))
    .sort((a, b) => (a.etapp_number || 0) - (b.etapp_number || 0)) || []

  // Group results by class
  const resultsByClass = results?.participants?.reduce((acc, participant) => {
    const className = participant.class_name || 'Määramata'
    if (!acc[className]) {
      acc[className] = []
    }
    acc[className].push(participant)
    return acc
  }, {} as Record<string, typeof results.participants>) || {}

  // Sort classes by priority
  const sortedClasses = Object.keys(resultsByClass).sort((a, b) => {
    const priorityA = getClassPriority(a)
    const priorityB = getClassPriority(b)
    
    if (priorityA !== priorityB) {
      return priorityA - priorityB
    }
    
    return a.localeCompare(b)
  })

  // Filter participants by selected class
  const filteredParticipants = selectedClass === 'all' 
    ? results?.participants || []
    : resultsByClass[selectedClass] || []

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/95 backdrop-blur-md"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="relative w-full max-w-7xl max-h-[85vh] flex">
        <div className={`relative w-full tech-border rounded-2xl shadow-[0_0_50px_rgba(255,0,64,0.3)] bg-black/95 flex flex-col ${
          isPlayerModalOpen ? 'z-[55]' : 'z-[60]'
        }`}>
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
            <ChampionshipHeader
              championshipName={championshipName}
              results={results}
              selectedClass={selectedClass}
              setSelectedClass={setSelectedClass}
              sortedClasses={sortedClasses}
              resultsByClass={resultsByClass}
            />

            {/* Content */}
            <div className="p-6">
              {isLoading ? (
                <LoadingSpinner />
              ) : error ? (
                <div className="p-8 text-center">
                  <div className="text-red-400 mb-2">❌ Viga tulemuste laadimisel</div>
                  <p className="text-gray-500 text-sm">{error.message}</p>
                </div>
              ) : !results || results.participants.length === 0 ? (
                <EmptyState />
              ) : (
                <>
                  {/* Statistics */}
                  <ChampionshipStats results={results} />

                  {/* Results */}
                  <div className="mt-6">
                    {selectedClass === 'all' ? (
                      <ChampionshipAllClassesView
                        sortedClasses={sortedClasses}
                        resultsByClass={resultsByClass}
                        sortedRallies={sortedRallies}
                        onPlayerModalStateChange={setIsPlayerModalOpen}
                      />
                    ) : (
                      <ChampionshipResultsTable
                        participants={filteredParticipants}
                        sortedRallies={sortedRallies}
                        showClass={false}
                        onPlayerModalStateChange={setIsPlayerModalOpen}
                      />
                    )}
                  </div>

                  {/* Warnings */}
                  {results.warnings && results.warnings.length > 0 && (
                    <ChampionshipWarnings warnings={results.warnings} />
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