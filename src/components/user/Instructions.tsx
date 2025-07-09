// src/components/user/Instructions.tsx
'use client'

import { useState } from 'react'
import { RegistrationInstructionsModal } from './instructions/RegistrationInstructionsModal'
import { TeamApplicationInstructionsModal } from './instructions/TeamApplicationInstructionsModal'
import { TeamManagementInstructionsModal } from './instructions/TeamManagementInstructionsModal'

export function Instructions() {
  const [openModal, setOpenModal] = useState<'registration' | 'teamApplication' | 'teamManagement' | null>(null)

  const buttons = [
    {
      id: 'registration' as const,
      title: 'Võistlustele registreerimine',
      icon: '🏁',
      gradient: 'from-red-600/30 to-orange-600/20'
    },
    {
      id: 'teamApplication' as const,
      title: 'Tiimidesse kandideerimine',
      icon: '👥',
      gradient: 'from-orange-600/30 to-yellow-600/20'
    },
    {
      id: 'teamManagement' as const,
      title: 'Tiimi manageerimine',
      icon: '⚙️',
      gradient: 'from-magenta-600/30 to-purple-600/20'
    }
  ]

  return (
    <>
      {/* Instructions Section */}
      <div className="relative">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-900/5 to-gray-900/5 rounded-2xl"></div>
        
        {/* Main Container */}
        <div className="relative tech-border rounded-2xl bg-black/40 backdrop-blur-xl p-4 sm:p-6">
          {/* Section Header */}
          <div className="mb-6">
            <h2 className="text-xl sm:text-2xl font-black font-['Orbitron'] text-white uppercase tracking-wider">
              JUHENDID
            </h2>
            <div className="mt-2 h-1 w-24 bg-gradient-to-r from-red-500 to-transparent rounded-full"></div>
          </div>

          {/* Buttons Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {buttons.map((button, index) => (
              <button
                key={button.id}
                onClick={() => setOpenModal(button.id)}
                className="group relative overflow-hidden rounded-lg transition-all duration-300 transform hover:scale-[1.02]"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${button.gradient} opacity-50 group-hover:opacity-70 transition-opacity`}></div>
                
                {/* Border Glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/20 to-red-500/0 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                {/* Content */}
                <div className="relative px-4 py-3 border border-gray-800 group-hover:border-red-500/50 rounded-lg bg-black/30 backdrop-blur-sm flex items-center gap-3">
                  {/* Icon */}
                  <div className="text-2xl flex-shrink-0">{button.icon}</div>
                  
                  {/* Title */}
                  <h3 className="text-xs sm:text-sm font-bold font-['Orbitron'] text-white uppercase tracking-wide text-left flex-1">
                    {button.title}
                  </h3>
                  
                  {/* Hover Arrow */}
                  <div className="text-red-400 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all flex-shrink-0">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>

                {/* Scan Line Effect on Hover */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-red-500/10 to-transparent transform -translate-y-full group-hover:translate-y-full transition-transform duration-1000"></div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Modals */}
      <RegistrationInstructionsModal 
        isOpen={openModal === 'registration'} 
        onClose={() => setOpenModal(null)} 
      />
      <TeamApplicationInstructionsModal 
        isOpen={openModal === 'teamApplication'} 
        onClose={() => setOpenModal(null)} 
      />
      <TeamManagementInstructionsModal 
        isOpen={openModal === 'teamManagement'} 
        onClose={() => setOpenModal(null)} 
      />
    </>
  )
}