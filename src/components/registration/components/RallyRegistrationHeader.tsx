// src/components/registration/components/RallyRegistrationHeader.tsx - MOBILE RESPONSIVE WITH ORIGINAL STYLING
'use client'

import { useRouter } from 'next/navigation'
import { TransformedRally } from '@/hooks/useOptimizedRallies'

interface RallyRegistrationHeaderProps {
  selectedRally: TransformedRally | null
}

export function RallyRegistrationHeader({ selectedRally }: RallyRegistrationHeaderProps) {
  const router = useRouter()
  
  const handleBackToDashboard = () => {
    router.push('/user-dashboard')
  }
  
  return (
    <div className="mb-6 sm:mb-8">
      <div className="tech-border rounded-2xl bg-black/90 backdrop-blur-xl p-4 sm:p-8 relative overflow-hidden">
        {/* Animated scan line effect */}
        <div className="scan-line"></div>
        
        {/* Background pattern */}
        <div className="absolute inset-0 grid-pattern opacity-[0.02] pointer-events-none"></div>
        
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-900/5 to-gray-900/5"></div>
        
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-4xl font-black text-white font-['Orbitron'] uppercase tracking-wider mb-2 text-glow-red">
              Ralli<br className="sm:hidden" /> Registreerimine
            </h1>
            <p className="text-gray-400 text-sm sm:text-lg">
              {selectedRally 
                ? `Registreeru rallile: ${selectedRally.name}` 
                : 'Vali ralli, millele soovid registreeruda'
              }
            </p>
          </div>
          
          {/* Back to Dashboard Button - with all original effects */}
          <button
            onClick={handleBackToDashboard}
            className="relative px-4 sm:px-6 py-2 sm:py-3 tech-border bg-black/90 text-gray-300 hover:text-white rounded-lg font-['Orbitron'] uppercase tracking-wider text-xs sm:text-sm font-bold transition-all duration-300 hover:border-red-500/50 group overflow-hidden z-10 self-start sm:self-auto"
          >
            {/* Hover gradient background */}
            <div className="absolute inset-0 bg-gradient-to-r from-red-900/20 to-red-800/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            {/* Hover glow effect */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
              <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-red-600 to-red-700 opacity-20 blur-sm"></div>
            </div>
            
            <span className="relative z-10 flex items-center space-x-1 sm:space-x-2 group-hover:text-red-400 transition-colors duration-300">
              <span className="transform group-hover:-translate-x-1 transition-transform duration-300">←</span>
              <span className="hidden sm:inline">Tagasi töölauale</span>
              <span className="sm:hidden">Tagasi</span>
            </span>
            
            {/* Shadow glow on hover */}
            <div className="absolute inset-0 rounded-lg shadow-[0_0_0px_rgba(255,0,64,0)] group-hover:shadow-[0_0_20px_rgba(255,0,64,0.3)] transition-shadow duration-300 pointer-events-none"></div>
          </button>
          
          {/* Decorative elements - z-index lower than button */}
          <div className="absolute top-2 right-2 sm:top-4 sm:right-4 w-8 h-8 sm:w-12 sm:h-12 z-0">
            <div className="absolute top-0 right-0 w-full h-px bg-gradient-to-l from-red-500/50 to-transparent"></div>
            <div className="absolute top-0 right-0 h-full w-px bg-gradient-to-b from-red-500/50 to-transparent"></div>
          </div>
          <div className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4 w-8 h-8 sm:w-12 sm:h-12 z-0">
            <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-red-500/50 to-transparent"></div>
            <div className="absolute bottom-0 left-0 h-full w-px bg-gradient-to-t from-red-500/50 to-transparent"></div>
          </div>
        </div>
      </div>
    </div>
  )
}