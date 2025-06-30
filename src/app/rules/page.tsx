// src/app/rules/page.tsx
'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useAuth } from '@/components/AuthProvider'
import { RulesContent } from '@/components/rules/RulesContent'
import '@/styles/futuristic-theme.css'

export default function RulesPage() {
  const { user } = useAuth()
  const router = useRouter()

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header - Simplified without auth */}
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="absolute inset-0 bg-black/80 backdrop-blur-2xl border-b border-red-500/20"></div>
        
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center h-24 py-6">
            {/* Logo with futuristic styling and pulsing effect */}
            <div className="flex items-center space-x-4">
              <div className="relative group">
                <div className="absolute inset-0 bg-red-500 blur-2xl opacity-50 group-hover:opacity-70 transition-opacity"></div>
                <div className="relative w-14 h-14 rounded-2xl overflow-hidden shadow-2xl ring-2 ring-red-500/30 bg-gradient-to-br from-red-600/20 to-purple-600/20 backdrop-blur-sm p-1 group-hover:ring-red-500/50 transition-all neon-glow">
                  <div className="w-full h-full rounded-xl overflow-hidden relative">
                    <Image
                      src="/image/rally-cover.png"
                      alt="LegendRix Rally"
                      fill
                      className="object-cover"
                      priority
                      sizes="56px"
                    />
                  </div>
                </div>
              </div>
              <h1 
                className="text-3xl font-black text-white font-['Orbitron'] tracking-wider cursor-pointer"
                onClick={() => router.push('/')}
              >
                LEGEND<span className="text-red-500">RIX</span>
              </h1>
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/')}
                className="group px-6 py-3 bg-black/60 backdrop-blur-sm rounded-xl border-2 border-gray-700/50 hover:border-gray-600 transition-all duration-300 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-gray-600/0 via-gray-600/10 to-gray-600/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <span className="relative text-sm font-medium text-gray-400 group-hover:text-gray-300 font-['Orbitron'] tracking-wider uppercase">
                  Pealehele
                </span>
              </button>
              {user && (
                <button
                  onClick={() => router.push('/user-dashboard')}
                  className="group px-6 py-3 bg-black/60 backdrop-blur-sm rounded-xl border-2 border-red-500/30 hover:border-red-500/50 transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,0,64,0.3)] relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-red-600/0 via-red-600/10 to-red-600/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  <span className="relative text-sm font-bold text-red-400 group-hover:text-red-300 font-['Orbitron'] tracking-wider uppercase">
                    Töölaud
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20 min-h-screen">
        <div className="container mx-auto px-4 py-16">
          {/* Page Title */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-black text-white font-['Orbitron'] tracking-wider mb-4">
              <span className="text-red-500">REEGLID</span>
            </h1>
            <p className="text-gray-400 text-lg">
              LegendRix E-Rally platvormi kasutustingimused ja reeglid
            </p>
          </div>

          {/* Rules Content */}
          <RulesContent />
        </div>
      </main>
    </div>
  )
}