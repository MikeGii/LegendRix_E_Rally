// src/components/registration/components/RegistrationClosedMessage.tsx - FUTURISTIC CLOSED MESSAGE
'use client'

import { TransformedRally } from '@/hooks/useOptimizedRallies'
import { getRallyStatus } from '@/hooks/useOptimizedRallies'

interface RegistrationClosedMessageProps {
  rally: TransformedRally
  onBack: () => void
}

export function RegistrationClosedMessage({ rally, onBack }: RegistrationClosedMessageProps) {
  const currentStatus = getRallyStatus(rally)
  
  const getStatusMessage = () => {
    switch (currentStatus) {
      case 'registration_closed':
        return 'Registreerimise tähtaeg on möödunud.'
      case 'active':
        return 'Ralli on juba alanud.'
      case 'completed':
        return 'Ralli on lõppenud.'
      case 'cancelled':
        return 'Ralli on tühistatud.'
      default:
        return 'Registreerimine pole hetkel võimalik.'
    }
  }
  
  return (
    <div className="tech-border rounded-2xl bg-black/90 backdrop-blur-xl p-12 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 grid-pattern opacity-[0.01] pointer-events-none"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-orange-900/5 to-gray-900/5"></div>
      
      <div className="relative z-10 text-center">
        {/* Icon */}
        <div className="w-24 h-24 bg-gradient-to-br from-orange-900/30 to-orange-800/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-orange-500/30 shadow-[0_0_30px_rgba(251,146,60,0.3)]">
          <span className="text-5xl">⏰</span>
        </div>
        
        {/* Title */}
        <h3 className="text-3xl font-black text-white mb-3 font-['Orbitron'] uppercase tracking-wider">
          Registreerimine suletud
        </h3>
        
        {/* Rally name */}
        <p className="text-xl text-gray-300 mb-6">
          Ralli <span className="text-orange-400 font-bold">"{rally.name}"</span> registreerimine on suletud.
        </p>
        
        {/* Status message box */}
        <div className="bg-gradient-to-r from-gray-900/50 to-gray-800/30 rounded-xl p-6 mb-8 border border-gray-800 max-w-lg mx-auto">
          <p className="text-gray-300 font-medium">
            {getStatusMessage()}
          </p>
        </div>
        
        {/* Rally details */}
        <div className="flex items-center justify-center gap-6 text-sm text-gray-400 mb-8">
          <div className="flex items-center gap-2">
            <span>📅</span>
            <span>Võistlus: {new Date(rally.competition_date).toLocaleDateString('et-EE')}</span>
          </div>
          <div className="text-gray-600">•</div>
          <div className="flex items-center gap-2">
            <span>⏰</span>
            <span>Tähtaeg oli: {new Date(rally.registration_deadline).toLocaleDateString('et-EE')}</span>
          </div>
        </div>
        
        {/* Back button */}
        <button
          onClick={onBack}
          className="relative px-8 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg font-['Orbitron'] uppercase tracking-wider text-sm font-bold hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-[0_0_20px_rgba(255,0,64,0.4)] hover:shadow-[0_0_30px_rgba(255,0,64,0.6)] hover:scale-105 group overflow-hidden"
        >
          {/* Button hover effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-red-700 to-red-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          <span className="relative z-10 flex items-center space-x-2">
            <span>←</span>
            <span>Tagasi rallide juurde</span>
          </span>
        </button>
      </div>
      
      {/* Decorative corner accents */}
      <div className="absolute top-4 left-4 w-16 h-16">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-orange-500/50 to-transparent"></div>
        <div className="absolute top-0 left-0 h-full w-px bg-gradient-to-b from-orange-500/50 to-transparent"></div>
      </div>
      <div className="absolute bottom-4 right-4 w-16 h-16">
        <div className="absolute bottom-0 right-0 w-full h-px bg-gradient-to-l from-orange-500/50 to-transparent"></div>
        <div className="absolute bottom-0 right-0 h-full w-px bg-gradient-to-t from-orange-500/50 to-transparent"></div>
      </div>
    </div>
  )
}