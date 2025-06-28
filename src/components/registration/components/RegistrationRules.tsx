// src/components/registration/components/RegistrationRules.tsx - FUTURISTIC RULES COMPONENT
'use client'

interface RegistrationRulesProps {
  rulesAccepted: boolean
  onRulesChange: (accepted: boolean) => void
}

export function RegistrationRules({ rulesAccepted, onRulesChange }: RegistrationRulesProps) {
  const rules = [
    'olen broneerinud omale koha üritusel osalemiseks ja seeläbi on rangelt soovituslik ka osalemine. Enneaegselt registreerimise tühistamata jätmise või ürituse korraldajate mitte teavitamine ürituselt puudumise korral võidakse minu konto sulgeda või ajutiselt peatada.',
    'olen tutvunud ja nõustun ralli reeglitega ning kohustun neid järgima.',
    'mõistan, et korraldajatel on õigus mind võistluselt eemaldada reeglite rikkumise korral.',
    'vastutan ise oma tervisliku seisundi eest ning kinnitan, et olen võimeline osalema.',
    'annan loa kasutada ürituselt tehtud fotosid ja videomaterjale turunduslikel eesmärkidel.'
  ]

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
      
      {/* Rules Content */}
      <div className="tech-border rounded-xl bg-black/90 backdrop-blur-xl p-6 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 grid-pattern opacity-[0.01] pointer-events-none"></div>
        
        <div className="relative z-10 space-y-4">
          <p className="font-bold text-white font-['Orbitron'] uppercase tracking-wider text-sm">
            Registreerudes käesolevale üritusele kinnitan, et:
          </p>
          
          <ol className="space-y-3">
            {rules.map((rule, index) => (
              <li key={index} className="flex items-start space-x-3">
                <span className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-gray-800 to-gray-700 rounded-lg flex items-center justify-center text-xs font-bold text-gray-400 font-['Orbitron'] mt-0.5">
                  {index + 1}
                </span>
                <span className="text-sm text-gray-300 leading-relaxed">{rule}</span>
              </li>
            ))}
          </ol>
          
          {/* Agreement Checkbox */}
          <div className="mt-6 pt-6 border-t border-gray-800">
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
                text-sm font-medium transition-colors select-none
                ${rulesAccepted ? 'text-red-400' : 'text-gray-300 group-hover:text-white'}
              `}>
                Olen lugenud ja nõustun kõigi registreerimise tingimustega
              </span>
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}