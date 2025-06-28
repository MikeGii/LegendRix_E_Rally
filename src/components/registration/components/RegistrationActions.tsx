// src/components/registration/components/RegistrationActions.tsx - FUTURISTIC ACTION BUTTONS
'use client'

interface RegistrationActionsProps {
  isAlreadyRegistered: boolean
  isSubmitting: boolean
  selectedClassId: string
  rulesAccepted: boolean
  existingRegistrationClassId?: string
  onRegister: () => void
  onChangeClass: () => void
  onUnregister: () => void
  onCancel: () => void
}

export function RegistrationActions({
  isAlreadyRegistered,
  isSubmitting,
  selectedClassId,
  rulesAccepted,
  existingRegistrationClassId,
  onRegister,
  onChangeClass,
  onUnregister,
  onCancel
}: RegistrationActionsProps) {
  return (
    <div className="space-y-3">
      {isAlreadyRegistered ? (
        // User is already registered - show management options
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <button
            onClick={onChangeClass}
            disabled={isSubmitting || !selectedClassId || selectedClassId === existingRegistrationClassId}
            className="relative px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-['Orbitron'] uppercase tracking-wider text-sm font-bold transition-all duration-300 disabled:from-gray-700 disabled:to-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed overflow-hidden group"
          >
            {/* Hover effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-blue-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            {/* Button content */}
            <div className="relative z-10 flex items-center justify-center space-x-2">
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Muudan klassi...</span>
                </>
              ) : (
                <>
                  <span>🔄</span>
                  <span>Muuda klassi</span>
                </>
              )}
            </div>
            
            {/* Glow effect */}
            {!isSubmitting && selectedClassId && selectedClassId !== existingRegistrationClassId && (
              <div className="absolute inset-0 shadow-[0_0_20px_rgba(59,130,246,0.4)] group-hover:shadow-[0_0_30px_rgba(59,130,246,0.6)] pointer-events-none"></div>
            )}
          </button>
          
          <button
            onClick={onUnregister}
            disabled={isSubmitting}
            className="relative px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-lg font-['Orbitron'] uppercase tracking-wider text-sm font-bold transition-all duration-300 disabled:from-gray-700 disabled:to-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed overflow-hidden group"
          >
            {/* Hover effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-orange-700 to-orange-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            {/* Button content */}
            <div className="relative z-10 flex items-center justify-center space-x-2">
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Tühistan...</span>
                </>
              ) : (
                <>
                  <span>❌</span>
                  <span>Tühista registreering</span>
                </>
              )}
            </div>
            
            {/* Glow effect */}
            {!isSubmitting && (
              <div className="absolute inset-0 shadow-[0_0_20px_rgba(251,146,60,0.4)] group-hover:shadow-[0_0_30px_rgba(251,146,60,0.6)] pointer-events-none"></div>
            )}
          </button>
        </div>
      ) : (
        // User is not registered - show register button
        <button
          onClick={onRegister}
          disabled={isSubmitting || !selectedClassId || !rulesAccepted}
          className="relative w-full px-6 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg font-['Orbitron'] uppercase tracking-wider text-sm font-bold transition-all duration-300 disabled:from-gray-700 disabled:to-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed overflow-hidden group"
        >
          {/* Animated background */}
          <div className="absolute inset-0 bg-gradient-to-r from-red-700 to-red-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          {/* Button content */}
          <div className="relative z-10 flex items-center justify-center space-x-2">
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Registreerun...</span>
              </>
            ) : (
              <>
                <span>📝</span>
                <span>Registreeru nüüd</span>
              </>
            )}
          </div>
          
          {/* Glow effect */}
          {!isSubmitting && selectedClassId && rulesAccepted && (
            <div className="absolute inset-0 shadow-[0_0_20px_rgba(255,0,64,0.4)] group-hover:shadow-[0_0_30px_rgba(255,0,64,0.6)] pointer-events-none"></div>
          )}
          
          {/* Pulse animation when ready */}
          {!isSubmitting && selectedClassId && rulesAccepted && (
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-red-600 to-red-700 opacity-30 animate-pulse"></div>
          )}
        </button>
      )}
      
      {/* Cancel Button */}
      <button
        onClick={onCancel}
        disabled={isSubmitting}
        className="relative w-full px-6 py-3 tech-border bg-black/90 text-gray-300 hover:text-white rounded-lg font-['Orbitron'] uppercase tracking-wider text-sm font-bold transition-all duration-300 disabled:text-gray-600 disabled:cursor-not-allowed group"
      >
        <div className="relative z-10 flex items-center justify-center space-x-2">
          <span>←</span>
          <span>Tagasi</span>
        </div>
        
        {/* Hover border glow */}
        <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-gray-700 to-gray-600 opacity-20"></div>
        </div>
      </button>
    </div>
  )
}