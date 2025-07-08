'use client'

import { useState } from 'react'
import { useAuth } from '@/components/AuthProvider'
import '@/styles/futuristic-theme.css'

interface ForumHeaderProps {
  onSearch: (query: string) => void
  onCreatePost: () => void
}

export function ForumHeader({ onSearch, onCreatePost }: ForumHeaderProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const { user } = useAuth()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(searchQuery)
  }

  return (
    <div className="w-full">
      {/* Header Container */}
      <div className="tech-border rounded-xl bg-black/90 backdrop-blur-xl p-4 sm:p-6 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 grid-pattern opacity-[0.02] pointer-events-none"></div>
        
        <div className="relative z-10">
          {/* Mobile Layout - Stacked */}
          <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex-1 sm:max-w-xl">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Otsi postitusi..."
                  className="w-full px-4 py-3 pl-12 bg-gray-900/80 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 font-['Orbitron'] text-sm focus:outline-none focus:border-red-500/50 focus:shadow-[0_0_20px_rgba(255,0,64,0.3)] transition-all duration-300"
                />
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </form>

            {/* Create Post Button or Login Message */}
            {user ? (
              <button
                onClick={onCreatePost}
                className="group relative px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg font-['Orbitron'] uppercase tracking-wider text-sm font-bold transition-all duration-300 hover:from-red-700 hover:to-red-800 overflow-hidden"
              >
                {/* Hover effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-red-700 to-red-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* Button content */}
                <div className="relative z-10 flex items-center justify-center space-x-2">
                  <span className="text-lg">✏️</span>
                  <span className="font-bold">Loo postitus</span>
                </div>

                {/* Glow effect on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute inset-0 blur-xl bg-red-500/30"></div>
                </div>
              </button>
            ) : (
              <div className="px-6 py-3 bg-gray-900/50 border border-gray-700/50 rounded-lg">
                <p className="text-gray-500 font-['Orbitron'] text-sm text-center">
                  Postituse loomiseks pead olema sisse loginud
                </p>
              </div>
            )}
          </div>

          {/* Mobile Search Button (optional alternative design) */}
          <div className="sm:hidden mt-2">
            <button
              onClick={handleSearch}
              className="w-full py-2 text-center text-gray-400 text-xs font-['Orbitron'] uppercase tracking-wider hover:text-red-400 transition-colors"
            >
              Vajuta otsingule →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}