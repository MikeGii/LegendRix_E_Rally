// src/components/registration/components/HelpSection.tsx - FUTURISTIC HELP SECTION
'use client'

interface HelpSectionProps {
  isAlreadyRegistered: boolean
}

export function HelpSection({ isAlreadyRegistered }: HelpSectionProps) {
  return (
    <div className="tech-border rounded-xl bg-black/90 backdrop-blur-xl p-4 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 grid-pattern opacity-[0.01] pointer-events-none"></div>
      
      <div className="relative z-10 flex items-start space-x-3">
        <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-900/30 to-blue-800/20 rounded-lg flex items-center justify-center border border-blue-500/30 shadow-[0_0_10px_rgba(59,130,246,0.3)] mt-0.5">
          <span className="text-blue-400 text-sm">💡</span>
        </div>
        <div className="text-sm text-gray-400 space-y-2">
          {isAlreadyRegistered ? (
            <>
              <p className="text-gray-300">
                Te olete juba sellele rallile registreeritud. Saate oma klassi muuta või registreeringu tühistada.
              </p>
              <p className="text-gray-500 text-xs">
                ⚠️ Klassi muutmine on võimalik kuni registreerimise tähtajani.
              </p>
            </>
          ) : (
            <>
              <p className="text-gray-300">
                Valige klass, nõustuge tingimustega ja klikkige "Registreeru nüüd", et rallile registreeruda.
              </p>
              <p className="text-gray-500 text-xs">
                ℹ️ Pärast registreerumist saate oma klassi muuta või registreeringu tühistada.
              </p>
            </>
          )}
        </div>
      </div>
      
      {/* Decorative corner accents */}
      <div className="absolute bottom-1 left-1 w-3 h-3">
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-blue-500/30 to-transparent"></div>
        <div className="absolute bottom-0 left-0 h-full w-px bg-gradient-to-t from-blue-500/30 to-transparent"></div>
      </div>
      <div className="absolute bottom-1 right-1 w-3 h-3">
        <div className="absolute bottom-0 right-0 w-full h-px bg-gradient-to-l from-blue-500/30 to-transparent"></div>
        <div className="absolute bottom-0 right-0 h-full w-px bg-gradient-to-t from-blue-500/30 to-transparent"></div>
      </div>
    </div>
  )
}