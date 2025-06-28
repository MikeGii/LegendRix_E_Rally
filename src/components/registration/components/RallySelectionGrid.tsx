// src/components/registration/components/RallySelectionGrid.tsx - FUTURISTIC RALLY GRID
'use client'

import { TransformedRally } from '@/hooks/useOptimizedRallies'
import { canRegisterToRally, getRallyStatus, getStatusDisplayText, getStatusColor } from '@/hooks/useOptimizedRallies'

interface RallySelectionGridProps {
  rallies: TransformedRally[]
  onRallySelect: (rally: TransformedRally) => void
  isLoading: boolean
}

export function RallySelectionGrid({ rallies, onRallySelect, isLoading }: RallySelectionGridProps) {
  // Filter only registerable rallies
  const registerableRallies = rallies.filter(rally => canRegisterToRally(rally))
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-500/30 border-t-red-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400 font-['Orbitron'] uppercase tracking-wider">Laadin rallisid...</p>
        </div>
      </div>
    )
  }

  if (registerableRallies.length === 0) {
    return (
      <div className="tech-border rounded-2xl bg-black/90 backdrop-blur-xl p-12 text-center">
        <div className="w-24 h-24 bg-gradient-to-br from-gray-900/50 to-gray-800/30 rounded-full flex items-center justify-center mx-auto mb-6 border border-gray-700">
          <span className="text-4xl opacity-50">🏁</span>
        </div>
        <h3 className="text-xl font-bold text-white mb-3 font-['Orbitron'] uppercase">
          Rallisid pole saadaval
        </h3>
        <p className="text-gray-400">Hetkel pole ühtegi rallit, millele saaks registreeruda.</p>
      </div>
    )
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {registerableRallies.map((rally, index) => {
        const status = getRallyStatus(rally)
        const statusText = getStatusDisplayText(status)
        const statusColor = getStatusColor(status)
        
        return (
          <button
            key={rally.id}
            onClick={() => onRallySelect(rally)}
            className="tech-border rounded-xl bg-black/90 backdrop-blur-xl p-6 text-left hover:border-red-500/50 transition-all duration-300 group relative overflow-hidden"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {/* Hover gradient effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-red-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            <div className="relative z-10">
              {/* Rally Name */}
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-red-400 transition-colors font-['Orbitron'] uppercase tracking-wider line-clamp-2">
                {rally.name}
              </h3>
              
              {/* Game Info */}
              <div className="flex items-center flex-wrap gap-2 text-sm text-gray-400 mb-4">
                <span className="flex items-center gap-1">
                  <span>🎮</span>
                  <span>{rally.game_name}</span>
                </span>
                {rally.game_type_name && (
                  <>
                    <span className="text-gray-600">•</span>
                    <span>{rally.game_type_name}</span>
                  </>
                )}
              </div>
              
              {/* Competition Date */}
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Võistlus:</span>
                  <span className="text-white font-medium font-['Orbitron']">
                    {new Date(rally.competition_date).toLocaleDateString('et-EE', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </span>
                </div>
                
                {/* Competition Time */}
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Võistluse kellaaeg:</span>
                  <span className="text-white font-medium font-['Orbitron']">
                    {new Date(rally.competition_date).toLocaleTimeString('et-EE', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                
                {/* Registration Deadline */}
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Reg. tähtaeg:</span>
                  <span className="text-white font-medium font-['Orbitron']">
                    {new Date(rally.registration_deadline).toLocaleDateString('et-EE', {
                      day: 'numeric',
                      month: 'short'
                    })}
                  </span>
                </div>
                
                {/* Registration Time */}
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Reg. kellaaeg:</span>
                  <span className="text-white font-medium font-['Orbitron']">
                    {new Date(rally.registration_deadline).toLocaleTimeString('et-EE', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
              
              {/* Participants Progress Bar */}
              {rally.max_participants && (
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-500">Osalejaid:</span>
                    <span className="text-white font-medium font-['Orbitron']">
                      {rally.registered_participants || 0}/{rally.max_participants}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-red-600 to-red-500 rounded-full transition-all duration-500"
                      style={{ width: `${((rally.registered_participants || 0) / rally.max_participants) * 100}%` }}
                    />
                  </div>
                </div>
              )}
              
              {/* Status Badge */}
              <div className="mt-4 flex items-center justify-between">
                <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold font-['Orbitron'] uppercase tracking-wider ${statusColor} backdrop-blur-sm`}>
                  {statusText}
                </span>
                
                {/* Arrow icon on hover */}
                <div className="w-8 h-8 bg-red-600/20 rounded-lg flex items-center justify-center border border-red-500/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
            
            {/* Animated border glow on hover */}
            <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-red-500 to-red-600 opacity-20 blur-sm"></div>
            </div>
          </button>
        )
      })}
    </div>
  )
}