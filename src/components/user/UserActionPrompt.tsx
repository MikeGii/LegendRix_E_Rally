// src/components/user/UserActionPrompt.tsx - REDESIGNED WITH FUTURISTIC BLACK-RED-GRAY THEME
interface UserActionPromptProps {
  canAccessRallies: boolean
  emailVerified: boolean
}

export function UserActionPrompt({ canAccessRallies, emailVerified }: UserActionPromptProps) {
  // Only show if user cannot access rallies
  if (canAccessRallies) return null

  return (
    <div className="tech-border rounded-2xl shadow-[0_0_30px_rgba(255,0,64,0.2)] bg-black/80 backdrop-blur-xl p-8 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 grid-pattern opacity-[0.02] pointer-events-none"></div>
      <div className="absolute top-0 right-0 w-48 h-48 bg-red-600/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-gray-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      
      <div className="text-center relative z-10">
        {/* Futuristic icon container */}
        <div className="relative inline-block mb-6">
          <div className="w-24 h-24 bg-gradient-to-br from-red-900/50 to-gray-900/50 rounded-full flex items-center justify-center mx-auto border border-red-500/30 shadow-[0_0_30px_rgba(255,0,64,0.3)] animate-pulse">
            <span className="text-4xl text-red-400">🚀</span>
          </div>
          {/* Rotating ring effect */}
          <div className="absolute inset-0 w-24 h-24 border-2 border-red-500/20 border-t-red-500/50 rounded-full animate-spin" style={{ animationDuration: '3s' }}></div>
        </div>
        
        <h2 className="text-2xl font-black text-white mb-4 font-['Orbitron'] tracking-wider uppercase">
          <span className="bg-gradient-to-r from-red-400 to-gray-300 bg-clip-text text-transparent">
            Valmis rallima?
          </span>
        </h2>
        
        {!emailVerified ? (
          <div className="space-y-4">
            <p className="text-gray-300 text-lg leading-relaxed max-w-xl mx-auto">
              Palun kinnitage oma e-maili aadress, et pääseda ligi kõikidele ralli funktsioonidele.
            </p>
            <div className="bg-gradient-to-r from-yellow-900/20 to-yellow-800/10 border border-yellow-500/30 rounded-xl p-4 shadow-[0_0_15px_rgba(234,179,8,0.2)] max-w-md mx-auto">
              <div className="flex items-center justify-center gap-3">
                <span className="text-2xl animate-pulse">📧</span>
                <p className="text-yellow-300 text-sm font-['Orbitron'] uppercase tracking-wide">
                  Kontrollige oma e-posti sisendkasti
                </p>
              </div>
            </div>
            
            {/* Visual hint with animation */}
            <div className="flex justify-center mt-6">
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                <span>Kinnituskiri on teel</span>
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-gray-300 text-lg leading-relaxed max-w-xl mx-auto">
              Teie konto ootab administraatori kinnitust. Teavitame teid, kui kõik on valmis!
            </p>
            <div className="bg-gradient-to-r from-blue-900/20 to-blue-800/10 border border-blue-500/30 rounded-xl p-4 shadow-[0_0_15px_rgba(59,130,246,0.2)] max-w-md mx-auto">
              <div className="flex items-center justify-center gap-3">
                <div className="relative">
                  <span className="text-2xl">⏳</span>
                  <div className="absolute inset-0 w-8 h-8 border-2 border-blue-500/30 rounded-full animate-ping"></div>
                </div>
                <p className="text-blue-300 text-sm font-['Orbitron'] uppercase tracking-wide">
                  Kinnitamine 24-48 tundi
                </p>
              </div>
            </div>
            
            {/* Progress indicator */}
            <div className="max-w-xs mx-auto mt-6">
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full animate-pulse" style={{ width: '60%' }}></div>
              </div>
              <p className="text-xs text-gray-500 mt-2">Teie taotlus on töötlemisel...</p>
            </div>
          </div>
        )}
        
        {/* Discord CTA with futuristic styling */}
        <div className="mt-8 pt-6 border-t border-gray-800">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl border border-gray-700 hover:border-red-500/50 transition-all group">
            <span className="text-2xl group-hover:scale-110 transition-transform">💬</span>
            <div className="text-left">
              <p className="text-gray-400 text-sm">Küsimused?</p>
              <p className="text-red-400 font-['Orbitron'] uppercase tracking-wide text-sm group-hover:text-red-300 transition-colors">
                Discord Server
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}