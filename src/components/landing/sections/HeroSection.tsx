// src/components/landing/sections/HeroSection.tsx
'use client'

interface User {
  id: string
  name: string
  email: string
  role: string
  // Make updated_at optional since it might not always be present
  updated_at?: string
}

interface HeroSectionProps {
  user: User | null
  onOpenAuth: () => void
  onDashboard: () => void
}

export function HeroSection({ user, onOpenAuth, onDashboard }: HeroSectionProps) {
  return (
    <div className="text-center mb-20">
      <h2 className="text-5xl md:text-7xl font-bold text-white mb-8 drop-shadow-2xl leading-tight">
        Tere tulemast LegendRix
        <span className="block text-blue-400 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
          E-Spordi keskkonda!
        </span>
      </h2>
      <p className="text-xl md:text-2xl text-slate-300 mb-12 drop-shadow-lg max-w-4xl mx-auto leading-relaxed">
        Kogege virtuaalse ralli põnevust. Võistlege sõitjatega üle maailma ja tõestage oma oskusi tipptasemel e-spordi keskkonnas.
      </p>
      
      {/* Call to Action - Changes based on login status */}
      {user ? (
        <button
          onClick={onDashboard}
          className="px-12 py-5 bg-gradient-to-r from-blue-600 to-blue-700 backdrop-blur-sm hover:from-blue-500 hover:to-blue-600 text-white rounded-2xl font-bold text-xl transition-all duration-300 shadow-2xl hover:shadow-blue-500/30 hover:scale-105 border border-blue-500/20"
        >
          Ava Töölaud
        </button>
      ) : (
        <button
          onClick={onOpenAuth}
          className="px-12 py-5 bg-gradient-to-r from-blue-600 to-blue-700 backdrop-blur-sm hover:from-blue-500 hover:to-blue-600 text-white rounded-2xl font-bold text-xl transition-all duration-300 shadow-2xl hover:shadow-blue-500/30 hover:scale-105 border border-blue-500/20"
        >
          Liitu Meie Tiimiga
        </button>
      )}
    </div>
  )
}