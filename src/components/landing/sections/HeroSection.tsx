// src/components/landing/sections/HeroSection.tsx - Futuristic Theme
'use client'

import { useAuth } from '@/components/AuthProvider'

interface HeroSectionProps {
  onOpenAuth: () => void
  onOpenCompetitions: () => void
  onOpenEdetabel: () => void
}

export function HeroSection({ onOpenAuth, onOpenCompetitions, onOpenEdetabel }: HeroSectionProps) {
  const { user } = useAuth()

  return (
    <div className="relative mb-32 py-16">
      {/* Background Effects */}
      <div className="absolute inset-0 -top-20 -bottom-20 overflow-hidden pointer-events-none">
        {/* Animated gradient lines */}
        <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-red-500/30 to-transparent animate-pulse"></div>
        <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-orange-500/20 to-transparent animate-pulse animation-delay-4000"></div>
      </div>

      <div className="text-center relative z-10">
        {/* Main Title */}
        <h2 className="text-5xl md:text-7xl font-black mb-8 leading-tight font-['Orbitron'] tracking-wide">
          <span className="text-white">TERE TULEMAST</span>
          <span className="block mt-2">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-red-400 to-red-500 text-glow-red">
              LEGENDRIX
            </span>
          </span>
          <span className="block text-3xl md:text-4xl text-gray-400 mt-4 font-medium">
            E-SPORDI KESKKONDA
          </span>
        </h2>

        {/* Subtitle */}
        <p className="text-xl md:text-2xl text-gray-500 mb-16 max-w-4xl mx-auto leading-relaxed font-light">
          Kogege virtuaalse ralli põnevust. Võistelge sõitjatega üle Eesti ja tõestage oma oskusi tipptasemel e-spordi keskkonnas.
        </p>
        
        {/* Action Buttons */}
        <div className="flex flex-col md:flex-row justify-center items-center gap-6">
          {/* Main CTA */}
          {user ? (
            <button
              onClick={() => window.location.href = user.role === 'admin' ? '/admin-dashboard' : '/user-dashboard'}
              className="futuristic-btn futuristic-btn-primary px-10 py-4 rounded-xl text-lg"
            >
              <span className="flex items-center gap-3">
                <span className="text-xl">⚡</span>
                AVA TÖÖLAUD
              </span>
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className="futuristic-btn futuristic-btn-primary px-10 py-4 rounded-xl text-lg"
            >
              <span className="flex items-center gap-3">
                <span className="text-xl">🚀</span>
                LIITU MEIE TIIMIGA
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}