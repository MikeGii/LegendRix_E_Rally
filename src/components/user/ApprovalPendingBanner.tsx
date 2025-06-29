// src/components/user/ApprovalPendingBanner.tsx
'use client'

import { useAuth } from '@/components/AuthProvider'

export function ApprovalPendingBanner() {
  const { user } = useAuth()

  // Don't show banner if user is approved or is admin
  if (!user || user.status === 'approved' || user.role === 'admin') {
    return null
  }

  return (
    <div className="relative bg-gradient-to-br from-orange-900/20 to-red-900/20 backdrop-blur-xl rounded-2xl border border-orange-500/30 shadow-[0_0_30px_rgba(255,140,0,0.3)] p-6 mb-8 overflow-hidden">
      {/* Animated background pattern */}
      <div className="absolute inset-0 grid-pattern opacity-[0.02] pointer-events-none"></div>
      
      {/* Scanning line effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="scan-line scan-line-orange"></div>
      </div>

      <div className="relative z-10 flex items-start gap-4">
        {/* Icon */}
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
            <span className="text-2xl">⏳</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <h3 className="text-lg font-bold text-white mb-2 font-['Orbitron'] uppercase tracking-wider">
            Konto ootab kinnitust
          </h3>
          <p className="text-orange-300 mb-4">
            Teie konto on edukalt loodud ja e-mail kinnitatud. Hetkel ootab konto administraatori kinnitust.
          </p>
          
          <div className="bg-black/30 rounded-lg p-4 border border-orange-500/20">
            <p className="text-sm text-gray-300 mb-3">
              <strong className="text-orange-400">Piiratud funktsioonid:</strong>
            </p>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex items-center gap-2">
                <span className="text-red-400">✕</span>
                Ei saa registreeruda rallidele
              </li>
              <li className="flex items-center gap-2">
                <span className="text-red-400">✕</span>
                Ei saa liituda tiimidega
              </li>
              <li className="flex items-center gap-2">
                <span className="text-red-400">✕</span>
                Ei saa kasutada mängu funktsioone
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                Saate vaadata oma profiili ja seadeid
              </li>
            </ul>
          </div>

          <p className="text-xs text-gray-500 mt-4">
            Tavaliselt võtab kinnitamine kuni 24 tundi. Saate teavituse e-mailile kui konto on kinnitatud.
          </p>
        </div>

        {/* Refresh button */}
        <button
          onClick={() => window.location.reload()}
          className="flex-shrink-0 px-4 py-2 bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 hover:text-white rounded-lg text-sm font-medium transition-all duration-200 border border-gray-700/50 hover:border-gray-600/50 flex items-center gap-2"
        >
          <span>🔄</span>
          Värskenda
        </button>
      </div>
    </div>
  )
}