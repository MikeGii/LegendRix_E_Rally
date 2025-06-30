// src/components/landing/Footer.tsx - Updated with 4 columns
'use client'

import { useRouter } from 'next/navigation'

export function Footer() {
  const router = useRouter()

  return (
    <footer className="relative mt-16 border-t border-red-500/30">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black to-transparent"></div>
      
      <div className="relative max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-6">
          {/* Column 1: Kontakt */}
          <div className="text-center md:text-left">
            <h5 className="text-sm font-bold text-red-500 mb-2 font-['Orbitron'] uppercase tracking-wider">
              Kontakt
            </h5>
            <a 
              href="mailto:info@legendrix.ee" 
              className="text-gray-400 hover:text-red-400 transition-colors duration-300 text-sm"
            >
              info@legendrix.ee
            </a>
          </div>

          {/* Column 2: Empty for now */}
          <div className="hidden md:block"></div>

          {/* Column 3: Reeglid */}
          <div className="text-center md:text-left">
            <h5 className="text-sm font-bold text-red-500 mb-2 font-['Orbitron'] uppercase tracking-wider">
              Informatsioon
            </h5>
            <button
              onClick={() => router.push('/rules')}
              className="text-gray-400 hover:text-red-400 transition-colors duration-300 text-sm"
            >
              Reeglid
            </button>
          </div>

          {/* Column 4: Copyright */}
          <div className="text-center md:text-right">
            <p className="text-gray-400 text-xs mt-6">
              © 2025 LegendRix
            </p>
            <p className="text-gray-500 text-xs">
              Kõik õigused kaitstud
            </p>
          </div>
        </div>

        {/* Bottom accent line */}
        <div className="h-px bg-gradient-to-r from-transparent via-red-500/20 to-transparent"></div>
      </div>
    </footer>
  )
}