// src/components/generate-rally/GameSelectionComponent.tsx
'use client'

import { Game } from '@/types'
import '@/styles/futuristic-theme.css'

interface GameSelectionComponentProps {
  games: Game[]
  selectedGameId: string
  onGameSelect: (gameId: string) => void
  isLoading?: boolean
}

export function GameSelectionComponent({ 
  games, 
  selectedGameId, 
  onGameSelect,
  isLoading = false 
}: GameSelectionComponentProps) {
  return (
    <div className="tech-border rounded-2xl shadow-[0_0_30px_rgba(255,0,64,0.2)] bg-black/90 backdrop-blur-xl overflow-hidden">
      {/* Header with scan line effect */}
      <div className="relative bg-gradient-to-r from-red-900/20 to-black p-4 border-b border-red-500/20">
        <div className="scan-line"></div>
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-red-800 rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(255,0,64,0.4)]">
            <span className="text-white text-lg">🎮</span>
          </div>
          <div>
            <h2 className="text-lg font-bold text-white font-['Orbitron'] uppercase tracking-wider">
              Vali mäng
            </h2>
            <p className="text-red-400/80 text-xs font-medium">Palun vali mäng esmalt!</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-10 h-10 border-3 border-gray-800 border-t-red-500 rounded-full animate-spin"></div>
          </div>
        ) : games.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-900/50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-800">
              <span className="text-gray-500 text-2xl">🎮</span>
            </div>
            <p className="text-gray-400 mb-4">Ühtegi mängu pole veel lisatud</p>
            <button
              onClick={() => window.location.href = '/game-management'}
              className="futuristic-btn futuristic-btn-primary px-4 py-2 rounded-lg text-sm"
            >
              Lisa mäng
            </button>
          </div>
        ) : (
          <div className="grid gap-2 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {games.map((game) => {
              const isSelected = selectedGameId === game.id
              
              return (
                <button
                  key={game.id}
                  onClick={() => onGameSelect(game.id)}
                  className={`
                    relative group p-3 rounded-xl border transition-all duration-300
                    ${isSelected
                      ? 'bg-gradient-to-br from-red-900/30 to-red-800/20 border-red-500 shadow-[0_0_20px_rgba(255,0,64,0.4)]'
                      : 'bg-gray-900/30 border-gray-800 hover:bg-gray-900/50 hover:border-gray-700'
                    }
                  `}
                >
                  {/* Selected indicator */}
                  {isSelected && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(255,0,64,0.8)]">
                      <span className="text-black text-xs font-bold">✓</span>
                    </div>
                  )}
                  
                  {/* Hover glow effect */}
                  <div className={`
                    absolute inset-0 rounded-xl transition-opacity duration-300 pointer-events-none
                    ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
                  `}>
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-red-600/20 to-transparent blur-sm"></div>
                  </div>
                  
                  {/* Content */}
                  <div className="relative z-10">
                    <div className="w-8 h-8 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg flex items-center justify-center mb-2 mx-auto border border-gray-700 group-hover:border-red-500/50 transition-colors">
                      <span className="text-sm">🎮</span>
                    </div>
                    
                    <h3 className={`
                      font-medium text-sm font-['Orbitron'] transition-colors
                      ${isSelected ? 'text-white' : 'text-gray-300 group-hover:text-white'}
                    `}>
                      {game.name}
                    </h3>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}