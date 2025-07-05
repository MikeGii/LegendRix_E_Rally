// src/components/registration/components/RegistrationRules.tsx - SIMPLIFIED WITH RULES BUTTON
'use client'

import { useRouter } from 'next/navigation'

interface RegistrationRulesProps {
  rulesAccepted: boolean
  onRulesChange: (accepted: boolean) => void
}

export function RegistrationRules({ rulesAccepted, onRulesChange }: RegistrationRulesProps) {
  const router = useRouter()
  
  const handleOpenRules = () => {
    window.open('/rules', '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-gradient-to-br from-orange-900/30 to-orange-800/20 rounded-xl flex items-center justify-center border border-orange-500/30 shadow-[0_0_15px_rgba(251,146,60,0.3)]">
          <span className="text-orange-400 text-lg">📋</span>
        </div>
        <div>
          <h3 className="text-lg font-bold text-white font-['Orbitron'] uppercase tracking-wider">
            Registreerimise tingimused
          </h3>
          <p className="text-gray-500 text-sm">Palun loe läbi ja nõustu tingimustega</p>
        </div>
      </div>
      
      {/* Rules Content Box */}
      <div className="tech-border rounded-xl bg-black/90 backdrop-blur-xl p-4 sm:p-6 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 grid-pattern opacity-[0.01] pointer-events-none"></div>
        
        <div className="relative z-10 space-y-4">
          {/* View Rules Button */}
          <button
            type="button"
            onClick={handleOpenRules}
            className="w-full relative px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-lg font-['Orbitron'] uppercase tracking-wider text-sm font-bold transition-all duration-300 hover:from-orange-700 hover:to-orange-800 overflow-hidden group"
          >
            {/* Hover effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-orange-700 to-orange-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            {/* Button content */}
            <div className="relative z-10 flex items-center justify-center space-x-2">
              <span>📖</span>
              <span>Vaata reegleid</span>
              <span className="transform group-hover:translate-x-1 transition-transform duration-300">→</span>
            </div>
            
            {/* Glow effect */}
            <div className="absolute inset-0 shadow-[0_0_0px_rgba(251,146,60,0)] group-hover:shadow-[0_0_20px_rgba(251,146,60,0.3)] transition-shadow duration-300 pointer-events-none"></div>
          </button>
          
          {/* Agreement Checkbox */}
          <div className="pt-4 border-t border-gray-800">
            <label className="flex items-start space-x-3 cursor-pointer group">
              <div className="relative mt-0.5">
                <input
                  type="checkbox"
                  checked={rulesAccepted}
                  onChange={(e) => onRulesChange(e.target.checked)}
                  className="sr-only"
                />
                <div className={`
                  w-6 h-6 rounded-lg border-2 transition-all duration-300
                  ${rulesAccepted 
                    ? 'bg-gradient-to-br from-red-600 to-red-700 border-red-500 shadow-[0_0_10px_rgba(255,0,64,0.4)]' 
                    : 'bg-gray-900 border-gray-700 group-hover:border-gray-600'
                  }
                `}>
                  {rulesAccepted && (
                    <svg className="w-full h-full p-1 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </div>
              <span className={`
                text-xs sm:text-sm font-medium transition-colors select-none
                ${rulesAccepted ? 'text-red-400' : 'text-gray-300 group-hover:text-white'}
              `}>
                Olen tutvunud LegendRix reeglitega ja nõustun kõigi tingimustega
              </span>
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}