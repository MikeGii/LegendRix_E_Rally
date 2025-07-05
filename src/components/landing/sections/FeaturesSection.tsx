// src/components/landing/sections/FeaturesSection.tsx - Mobile-Friendly Update
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 mb-16 sm:mb-24 md:mb-32 py-8 sm:py-12 md:py-16 relative max-w-4xl mx-auto px-4 sm:px-0">
        {/* Background accent lines - hidden on mobile for cleaner look */}
        <div className="hidden sm:block absolute inset-0 -top-20 -bottom-20 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/4 w-px h-32 bg-gradient-to-b from-transparent via-red-500/20 to-transparent"></div>
          <div className="absolute top-1/2 right-1/4 w-px h-32 bg-gradient-to-b from-transparent via-purple-500/20 to-transparent"></div>
        </div>

        {/* Võistlused - CLICKABLE */}
        <button
          onClick={onOpenCompetitions}
          className="group relative futuristic-card rounded-xl sm:rounded-2xl p-6 sm:p-8 text-center transition-all duration-300 hover:scale-105 overflow-hidden w-full"
        >
          {/* Hover glow effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/0 to-red-500/0 group-hover:from-red-500/10 group-hover:to-transparent transition-all duration-300"></div>
          
          <div className="relative z-10">
            <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 relative">
              <div className="absolute inset-0 bg-red-500 blur-xl sm:blur-2xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
              <div className="relative w-full h-full bg-gradient-to-br from-red-500/20 to-red-600/30 rounded-xl sm:rounded-2xl flex items-center justify-center ring-2 ring-red-500/30 group-hover:ring-red-400/50 transition-all duration-300">
                <span className="text-3xl sm:text-4xl">🏁</span>
              </div>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4 font-['Orbitron'] uppercase tracking-wide group-hover:text-glow-red transition-all">
              Võistlused
            </h3>
            <p className="text-sm sm:text-base text-gray-500 leading-relaxed group-hover:text-gray-400 transition-colors duration-300 px-2 sm:px-0">
              Tulevased võistlused ja nende info.
              {shouldShowData && ` Hetkel avatud: ${approvedRallies.length} rallid`}
            </p>
            
            {/* Mobile-friendly CTA hint */}
            <div className="mt-4 flex items-center justify-center space-x-2 text-red-400 group-hover:text-red-300 transition-colors">
              <span className="text-xs sm:text-sm font-medium">VAATA VÕISTLUSI</span>
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </button>

        {/* Edetabel - CLICKABLE */}
        <button
          onClick={handleEdetabelClick}
          className="group relative futuristic-card rounded-xl sm:rounded-2xl p-6 sm:p-8 text-center transition-all duration-300 hover:scale-105 overflow-hidden w-full"
        >
          {/* Hover glow effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-purple-500/0 group-hover:from-purple-500/10 group-hover:to-transparent transition-all duration-300"></div>
          
          <div className="relative z-10">
            <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 relative">
              <div className="absolute inset-0 bg-purple-500 blur-xl sm:blur-2xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
              <div className="relative w-full h-full bg-gradient-to-br from-purple-500/20 to-purple-600/30 rounded-xl sm:rounded-2xl flex items-center justify-center ring-2 ring-purple-500/30 group-hover:ring-purple-400/50 transition-all duration-300">
                <span className="text-3xl sm:text-4xl">🏆</span>
              </div>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4 font-['Orbitron'] uppercase tracking-wide group-hover:text-glow-purple transition-all">
              Edetabel
            </h3>
            <p className="text-sm sm:text-base text-gray-500 leading-relaxed group-hover:text-gray-400 transition-colors duration-300 px-2 sm:px-0">
              Tulemused toimunud üksikvõistluste ja sarjade osas.
            </p>
            
            {/* Mobile-friendly CTA hint */}
            <div className="mt-4 flex items-center justify-center space-x-2 text-purple-400 group-hover:text-purple-300 transition-colors">
              <span className="text-xs sm:text-sm font-medium">VAATA EDETABELIT</span>
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </button>
      </div>

      {/* Modal */}
      {showEdetabelModal && (
        <EdetabelModal
          isOpen={isEdetabelModalOpen}
          onClose={() => setIsEdetabelModalOpen(false)}
        />
      )}
    </>
  )
}