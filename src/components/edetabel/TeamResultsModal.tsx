// src/components/edetabel/TeamResultsModal.tsx
'use client'

import { useState, useEffect } from 'react'
import { usePublicTeamRallyResults } from '@/hooks/usePublicTeamRallyResults'
import { TeamResultsHeader } from './team-results/TeamResultsHeader'
import { TeamResultsTable } from './team-results/TeamResultsTable'
import { LoadingSpinner } from './rally-results/LoadingSpinner'
import { EmptyState } from './rally-results/EmptyState'

interface TeamResultsModalProps {
  isOpen: boolean
  onClose: () => void
  rallyId: string
  rallyName: string
}

export function TeamResultsModal({ 
  isOpen, 
  onClose, 
  rallyId, 
  rallyName 
}: TeamResultsModalProps) {
  const [selectedClass, setSelectedClass] = useState<string>('all')
  const { data: results = [], isLoading, error } = usePublicTeamRallyResults(rallyId)

  // Reset class filter when rally changes
  useEffect(() => {
    setSelectedClass('all')
  }, [rallyId])

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

  // Get unique classes and sort them
  const availableClasses = Array.from(
    new Set(results.map(t => t.class_name))
  ).sort((a, b) => {
    const priorityA = getClassPriority(a)
    const priorityB = getClassPriority(b)
    
    if (priorityA !== priorityB) {
      return priorityA - priorityB
    }
    
    return a.localeCompare(b)
  })

  // Filter results by selected class
  const filteredResults = selectedClass === 'all' 
    ? results 
    : results.filter(t => t.class_name === selectedClass)

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/95 backdrop-blur-md"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="relative w-full max-w-6xl max-h-[85vh] flex">
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
            <TeamResultsHeader
              rallyName={rallyName}
              selectedClass={selectedClass}
              setSelectedClass={setSelectedClass}
              availableClasses={availableClasses}
              totalTeams={results.length}
            />

            {/* Content */}
            <div className="p-6">
              {isLoading ? (
                <LoadingSpinner />
              ) : error ? (
                <div className="text-center py-20">
                  <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">❌</span>
                  </div>
                  <p className="text-gray-400 text-lg">Viga tulemuste laadimisel</p>
                </div>
              ) : filteredResults.length === 0 ? (
                <div className="text-center py-20">
                  <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">👥</span>
                  </div>
                  <p className="text-gray-400 text-lg">
                    {selectedClass === 'all' 
                      ? "Võistkondade tulemusi ei leitud" 
                      : `Võistkondade tulemusi klassis ${selectedClass} ei leitud`
                    }
                  </p>
                </div>
              ) : (
                <TeamResultsTable 
                  teams={filteredResults}
                  selectedClass={selectedClass}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper function to get class priority for sorting
function getClassPriority(className: string): number {
  const lowerName = className.toLowerCase()
  if (lowerName.includes('pro') && !lowerName.includes('semi')) return 1
  if (lowerName.includes('semi')) return 2
  if (lowerName.includes('juunior') || lowerName.includes('junior')) return 3
  return 4
}