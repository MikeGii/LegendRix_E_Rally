// src/components/game-management/GamesTab.tsx
import { useState } from 'react'
import { Game, useCreateGame, useDeleteGame, useUpdateGame } from '@/hooks/useGameManagement'
import { CreateGameModal } from './CreateGameModal'

interface GamesTabProps {
  games: Game[]
  isLoading: boolean
  selectedGameId: string | null
  onSelectGame: (gameId: string) => void
  onRefresh: () => void
}

export function GamesTab({ 
  games, 
  isLoading, 
  selectedGameId, 
  onSelectGame, 
  onRefresh 
}: GamesTabProps) {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingGame, setEditingGame] = useState<Game | null>(null)

  const createGameMutation = useCreateGame()
  const deleteGameMutation = useDeleteGame()
  const updateGameMutation = useUpdateGame()

  const handleCreateGame = async (gameData: Partial<Game>) => {
    try {
      const newGame = await createGameMutation.mutateAsync(gameData)
      setShowCreateModal(false)
      onSelectGame(newGame.id)
    } catch (error) {
      console.error('Failed to create game:', error)
    }
  }

  const handleDeleteGame = async (gameId: string) => {
    if (!confirm('Are you sure you want to delete this game? This will also delete all related types, events, and classes.')) {
      return
    }

    try {
      await deleteGameMutation.mutateAsync(gameId)
      if (selectedGameId === gameId) {
        onSelectGame('')
      }
    } catch (error) {
      console.error('Failed to delete game:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-slate-600 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading games...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-white flex items-center space-x-2">
          <span>🎮</span>
          <span>Games ({games.length})</span>
        </h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-green-500/25"
        >
          <div className="flex items-center space-x-2">
            <span>➕</span>
            <span>Create Game</span>
          </div>
        </button>
      </div>

      {games.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl text-slate-500">🎮</span>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">No Games Created</h3>
          <p className="text-slate-400 mb-6">Get started by creating your first game</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-all duration-200"
          >
            Create First Game
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {games.map((game) => (
            <div
              key={game.id}
              className={`bg-slate-900/50 rounded-xl border p-6 transition-all duration-200 cursor-pointer hover:bg-slate-800/50 ${
                selectedGameId === game.id
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-slate-700/30 hover:border-slate-600'
              }`}
              onClick={() => onSelectGame(game.id)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    selectedGameId === game.id ? 'bg-blue-500/20' : 'bg-slate-700/50'
                  }`}>
                    <span className={`text-xl ${
                      selectedGameId === game.id ? 'text-blue-300' : 'text-slate-400'
                    }`}>🎮</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{game.name}</h3>
                    <p className="text-sm text-slate-400">{game.platform}</p>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setEditingGame(game)
                    }}
                    className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/20 rounded-lg transition-all duration-200"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteGame(game.id)
                    }}
                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/20 rounded-lg transition-all duration-200"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm">
                  <span className="text-slate-400">🏢</span>
                  <span className="text-slate-300">{game.developer || 'Unknown Developer'}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <span className="text-slate-400">📅</span>
                  <span className="text-slate-300">{game.release_year || 'Unknown Year'}</span>
                </div>
                {game.description && (
                  <div className="flex items-start space-x-2 text-sm">
                    <span className="text-slate-400">📝</span>
                    <span className="text-slate-300 line-clamp-2">{game.description}</span>
                  </div>
                )}
              </div>

              {selectedGameId === game.id && (
                <div className="mt-4 pt-4 border-t border-blue-500/30">
                  <p className="text-blue-300 text-sm font-medium">✅ Selected Game</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create Game Modal */}
      {showCreateModal && (
        <CreateGameModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateGame}
          isLoading={createGameMutation.isPending}
        />
      )}

      {/* Edit Game Modal */}
      {editingGame && (
        <CreateGameModal
          game={editingGame}
          onClose={() => setEditingGame(null)}
          onSubmit={async (gameData) => {
            try {
              await updateGameMutation.mutateAsync({ id: editingGame.id, ...gameData })
              setEditingGame(null)
            } catch (error) {
              console.error('Failed to update game:', error)
            }
          }}
          isLoading={updateGameMutation.isPending}
        />
      )}
    </div>
  )
}