// src/components/landing/Footer.tsx - Fixed margin issue
'use client'

import { useRouter } from 'next/navigation'

export function Footer() {
  const router = useRouter()

  return (
    <footer className="relative mt-16 mb-0 border-t border-red-500/30">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black to-transparent"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-8 pb-0">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-6">
          {/* Column 1: Kontakt - Mobile Centered */}
          <div className="flex justify-center md:justify-center text-center md:text-left">
            <div>
              <h5 className="text-sm font-bold text-red-500 mb-3 font-['Orbitron'] uppercase tracking-wider">
                Kontakt
              </h5>
              <a 
                href="mailto:info@legendrix.ee" 
                className="text-gray-400 hover:text-red-400 transition-colors duration-300 text-sm inline-block"
              >
                info@legendrix.ee
              </a>
            </div>
          </div>

          {/* Column 2: Informatsioon - Mobile Centered */}
          <div className="flex justify-center md:justify-center text-center md:text-left">
            <div>
              <h5 className="text-sm font-bold text-red-500 mb-3 font-['Orbitron'] uppercase tracking-wider">
                Informatsioon
              </h5>
              <button
                onClick={() => window.open('/rules', '_blank', 'noopener,noreferrer')}
                className="text-gray-400 hover:text-red-400 transition-colors duration-300 text-sm block mx-auto md:mx-0"
              >
                Reeglid
              </button>
            </div>
          </div>

          {/* Column 3: Copyright - Mobile Centered */}
          <div className="flex justify-center md:justify-center text-center md:text-left">
            <div>
              {/* Hidden spacer on mobile, visible on desktop */}
              <h5 className="hidden md:block text-sm font-bold text-red-500 mb-3 font-['Orbitron'] uppercase tracking-wider">
                &nbsp;
              </h5>
              <p className="text-gray-400 text-xs">
                © 2025 LegendRix
              </p>
              <p className="text-gray-500 text-xs mt-1">
                Kõik õigused kaitstud
              </p>
            </div>
          </div>
        </div>

        {/* Bottom accent line */}
        <div className="h-px bg-gradient-to-r from-transparent via-red-500/20 to-transparent mb-0"></div>
      </div>
    </footer>
  )
}