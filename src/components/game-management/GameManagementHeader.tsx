// src/components/game-management/GameManagementHeader.tsx
import { Game } from '@/hooks/useGameManagement'

interface GameManagementHeaderProps {
  totalGames: number
  selectedGame: Game | undefined
  onRefresh: () => void
  isLoading: boolean
}

export function GameManagementHeader({ 
  totalGames, 
  selectedGame, 
  onRefresh, 
  isLoading 
}: GameManagementHeaderProps) {
  const handleBackToAdmin = () => {
    window.location.href = '/admin-dashboard'
  }

  return (
    <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8">
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center space-x-4 mb-2">
            <button
              onClick={handleBackToAdmin}
              className="flex items-center space-x-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white rounded-lg transition-all duration-200"
            >
              <span>←</span>
              <span>Back to Admin</span>
            </button>
            <h1 className="text-3xl font-bold text-white">Game Management</h1>
          </div>
          <p className="text-slate-400 mb-4">Create and manage games, events, types, and classes</p>
          
          {selectedGame ? (
            <div className="bg-blue-500/20 border border-blue-500/30 rounded-xl p-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-500/30 rounded-xl flex items-center justify-center">
                  <span className="text-blue-300 text-xl">🎮</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-blue-200">
                    Selected Game: {selectedGame.name}
                  </h3>
                  <p className="text-blue-300 text-sm">
                    {selectedGame.developer} • {selectedGame.platform}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-xl p-4">
              <div className="flex items-center space-x-3">
                <span className="text-yellow-300 text-xl">⚠️</span>
                <p className="text-yellow-200">
                  Select a game to manage its types, events, and classes
                </p>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-slate-300 font-medium">{totalGames} Games</p>
            <p className="text-slate-400 text-sm">Total in system</p>
          </div>
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded-xl transition-all duration-200 font-medium shadow-lg hover:shadow-blue-500/25 disabled:opacity-50"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Refreshing...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <span>🔄</span>
                <span>Refresh</span>
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}