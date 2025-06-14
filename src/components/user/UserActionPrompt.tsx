// src/components/user/UserActionPrompt.tsx - Estonian Translation
interface UserActionPromptProps {
  canAccessRallies: boolean
  emailVerified: boolean
}

export function UserActionPrompt({ canAccessRallies, emailVerified }: UserActionPromptProps) {
  // Only show if user cannot access rallies
  if (canAccessRallies) return null

  return (
    <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8">
      <div className="text-center">
        <div className="w-24 h-24 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-blue-500/30">
          <span className="text-4xl text-blue-400">🚀</span>
        </div>
        
        <h2 className="text-2xl font-bold text-white mb-4">Valmis rallima?</h2>
        
        {!emailVerified ? (
          <div className="space-y-4">
            <p className="text-slate-300 text-lg leading-relaxed">
              Palun kinnitage oma e-maili aadress, et pääseda ligi kõikidele ralli funktsioonidele.
            </p>
            <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-xl p-4">
              <p className="text-yellow-300 text-sm">
                📧 Kontrollige oma e-posti sisendkasti kinnituskirja saamiseks
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-slate-300 text-lg leading-relaxed">
              Teie konto ootab administraatori kinnitust. Teavitame teid, kui kõik on valmis!
            </p>
            <div className="bg-blue-500/20 border border-blue-500/30 rounded-xl p-4">
              <p className="text-blue-300 text-sm">
                ⏳ See võtab tavaliselt 24-48 tundi
              </p>
            </div>
          </div>
        )}
        
        <div className="mt-8 pt-6 border-t border-slate-700/50">
          <p className="text-slate-400 text-sm">
            Küsimused? Võtke meiega ühendust meie Discord serveris!
          </p>
        </div>
      </div>
    </div>
  )
}