// src/components/registration/components/RegistrationStatus.tsx - FUTURISTIC STATUS BANNER
'use client'

interface RegistrationStatusProps {
  className: string
}

export function RegistrationStatus({ className }: RegistrationStatusProps) {
  return (
    <div className="tech-border rounded-xl bg-black/90 backdrop-blur-xl p-4 relative overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-green-900/20 to-green-800/10 animate-pulse"></div>
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 grid-pattern opacity-[0.02] pointer-events-none"></div>
      
      <div className="relative z-10 flex items-center space-x-3">
        <div className="w-10 h-10 bg-gradient-to-br from-green-900/30 to-green-800/20 rounded-xl flex items-center justify-center border border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.5)]">
          <span className="text-green-400 text-lg">✓</span>
        </div>
        <div>
          <p className="text-green-400 font-bold font-['Orbitron'] uppercase tracking-wider">
            Te olete registreeritud!
          </p>
          <p className="text-green-300 text-sm">
            Praegune klass: <span className="font-bold text-white">{className}</span>
          </p>
        </div>
        
        {/* Decorative corner accent */}
        <div className="absolute top-1 right-1 w-4 h-4">
          <div className="absolute top-0 right-0 w-full h-px bg-gradient-to-l from-green-500/50 to-transparent"></div>
          <div className="absolute top-0 right-0 h-full w-px bg-gradient-to-b from-green-500/50 to-transparent"></div>
        </div>
      </div>
    </div>
  )
}