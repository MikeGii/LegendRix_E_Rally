// src/components/landing/sections/FeaturesSection.tsx - Futuristic Theme
'use client'

import { useState } from 'react'
import { useApprovedRallies } from '@/hooks/useApprovedRallies'
import { EdetabelModal } from '../EdetabelModal'

interface FeaturesSectionProps {
  onOpenCompetitions: () => void
  onOpenEdetabel?: () => void
  showDynamicData?: boolean
  showEdetabelModal?: boolean
}

export function FeaturesSection({ 
  onOpenCompetitions, 
  onOpenEdetabel,
  showDynamicData = false,
  showEdetabelModal = false
}: FeaturesSectionProps) {
  const [isEdetabelModalOpen, setIsEdetabelModalOpen] = useState(false)
  
  // Only load data if showDynamicData is true
  const { data: approvedRallies = [] } = useApprovedRallies()
  const shouldShowData = showDynamicData && approvedRallies.length > 0

  // Handle edetabel click
  const handleEdetabelClick = () => {
    if (onOpenEdetabel) {
      onOpenEdetabel()
    } else if (showEdetabelModal) {
      setIsEdetabelModalOpen(true)
    }
  }

  return (
    <>
      <div className="grid md:grid-cols-2 gap-8 mb-32 py-16 relative max-w-4xl mx-auto">
        {/* Background accent lines */}
        <div className="absolute inset-0 -top-20 -bottom-20 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/4 w-px h-32 bg-gradient-to-b from-transparent via-red-500/20 to-transparent"></div>
          <div className="absolute top-1/2 right-1/4 w-px h-32 bg-gradient-to-b from-transparent via-purple-500/20 to-transparent"></div>
        </div>

        {/* Võistlused - CLICKABLE */}
        <button
          onClick={onOpenCompetitions}
          className="group relative futuristic-card rounded-2xl p-8 text-center transition-all duration-300 hover:scale-105 overflow-hidden"
        >
          {/* Hover glow effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/0 to-red-500/0 group-hover:from-red-500/10 group-hover:to-transparent transition-all duration-300"></div>
          
          <div className="relative z-10">
            <div className="w-16 h-16 mx-auto mb-4 relative">
              <div className="absolute inset-0 bg-red-500 blur-2xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
              <div className="relative w-full h-full bg-gradient-to-br from-red-500/20 to-red-600/30 rounded-2xl flex items-center justify-center ring-2 ring-red-500/30 group-hover:ring-red-400/50 transition-all duration-300">
                <span className="text-4xl">🏁</span>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-4 font-['Orbitron'] uppercase tracking-wide group-hover:text-glow-red transition-all">
              Võistlused
            </h3>
            <p className="text-gray-500 leading-relaxed group-hover:text-gray-400 transition-colors duration-300">
              Osalege regulaarsetes turniirides ja meistrivõistlustes erinevates ralli mängudes.
            </p>
            <div className="mt-6 text-red-400 font-['Orbitron'] text-sm uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
              Vaata rohkem →
            </div>
          </div>
        </button>

        {/* Edetabelid - CLICKABLE */}
        <button
          onClick={handleEdetabelClick}
          className="group relative futuristic-card rounded-2xl p-8 text-center transition-all duration-300 hover:scale-105 overflow-hidden"
        >
          {/* Hover glow effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-purple-500/0 group-hover:from-purple-500/10 group-hover:to-transparent transition-all duration-300"></div>
          
          <div className="relative z-10">
            <div className="w-16 h-16 mx-auto mb-4 relative">
              <div className="absolute inset-0 bg-purple-500 blur-2xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
              <div className="relative w-full h-full bg-gradient-to-br from-purple-500/20 to-purple-600/30 rounded-2xl flex items-center justify-center ring-2 ring-purple-500/30 group-hover:ring-purple-400/50 transition-all duration-300">
                <span className="text-4xl">🏆</span>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-4 font-['Orbitron'] uppercase tracking-wide group-hover:text-glow-purple transition-all">
              Edetabelid
            </h3>
            <p className="text-gray-500 leading-relaxed group-hover:text-gray-400 transition-colors duration-300">
              Jälgige parimaid sõitjaid ja võrrelge oma tulemusi teiste mängijatega reaalajas.
            </p>
            {shouldShowData && (
              <div className="mt-4 text-purple-400 text-sm">
                <span className="font-bold">{approvedRallies.length}</span> avalikku rallit
              </div>
            )}
            <div className="mt-6 text-purple-400 font-['Orbitron'] text-sm uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
              Vaata rohkem →
            </div>
          </div>
        </button>
      </div>

      {/* Edetabel Modal */}
      {showEdetabelModal && (
        <EdetabelModal
          isOpen={isEdetabelModalOpen}
          onClose={() => setIsEdetabelModalOpen(false)}
        />
      )}
    </>
  )
}