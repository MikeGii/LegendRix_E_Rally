// src/components/game-management/GamesTab.tsx - Optimized version
import { useState } from 'react'
import { useGameMutations } from '@/hooks/useGameManagement'
import { CreateGameModal } from './CreateGameModal'
import { ConfirmModal } from '@/components/shared/Modal'
import { EmptyState, LoadingState } from '@/components/shared/States'
import { GameCard } from './GameCard'
import type { Game } from '@/types'

interface GamesTabProps {
  games: Game[]
  selectedGame: Game | null
  onSelectGame: (game: Game | null) => void
  onRefresh: () => void
}

export function GamesTab({ 
  games, 
  selectedGame, 
  onSelectGame, 
  onRefresh 
}: GamesTabProps) {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingGame, setEditingGame] = useState<Game | null>(null)
  const [deletingGame, setDeletingGame] = useState<Game | null>(null)

  const { createGame, updateGame, deleteGame } = useGameMutations()

  const handleCreateGame = async (gameData: Partial<Game>) => {
    try {
      const newGame = await createGame.mutateAsync(gameData)
      setShowCreateModal(false)
      onSelectGame(newGame)
      onRefresh()
    } catch (error) {
      console.error('Failed to create game:', error)
    }
  }

  const handleUpdateGame = async (gameData: Partial<Game>) => {
    if (!editingGame) return
    
    try {
      await updateGame.mutateAsync({ id: editingGame.id, ...gameData })
      setEditingGame(null)
      onRefresh()
    } catch (error) {
      console.error('Failed to update game:', error)
    }
  }

  const handleDeleteGame = async () => {
    if (!deletingGame) return
    
    try {
      await deleteGame.mutateAsync(deletingGame.id)
      
      // Clear selection if deleted game was selected
      if (selectedGame?.id === deletingGame.id) {
        onSelectGame(null)
      }
      
      setDeletingGame(null)
      onRefresh()
    } catch (error) {
      console.error('Failed to delete game:', error)
    }
  }

  const handleGameSelect = (game: Game) => {
    onSelectGame(selectedGame?.id === game.id ? null : game)
  }

  const handleEditClick = (game: Game, event: React.MouseEvent) => {
    event.stopPropagation()
    setEditingGame(game)
  }

  const handleDeleteClick = (game: Game, event: React.MouseEvent) => {
    event.stopPropagation()
    setDeletingGame(game)
  }

  const isLoading = createGame.isPending || updateGame.isPending || deleteGame.isPending

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-white flex items-center space-x-2">
          <span>🎮</span>
          <span>Games ({games.length})</span>
          {selectedGame && (
            <span className="ml-4 px-3 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full text-sm">
              {selectedGame.name} selected
            </span>
          )}
        </h2>
        <button
          onClick={() => setShowCreateModal(true)}
          disabled={isLoading}
          className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-green-500/25 disabled:opacity-50"
        >
          <div className="flex items-center space-x-2">
            <span>➕</span>
            <span>Create Game</span>
          </div>
        </button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <LoadingState message="Processing game operation..." />
      )}

      {/* Content */}
      {!isLoading && (
        <>
          {games.length === 0 ? (
            <EmptyState
              title="No Games Created"
              message="Get started by creating your first rally game"
              icon="🎮"
              action={{
                label: "Create First Game",
                onClick: () => setShowCreateModal(true)
              }}
            />
          ) : (
            <>
              {/* Selection Helper */}
              {!selectedGame && (
                <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <span className="text-blue-300 text-xl">💡</span>
                    <p className="text-blue-200">
                      <strong>Tip:</strong> Select a game to manage its types, events, and classes
                    </p>
                  </div>
                </div>
              )}

              {/* Games Grid */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {games.map((game) => (
                  <GameCard
                    key={game.id}
                    game={game}
                    isSelected={selectedGame?.id === game.id}
                    onSelect={() => handleGameSelect(game)}
                    onEdit={(e) => handleEditClick(game, e)}
                    onDelete={(e) => handleDeleteClick(game, e)}
                  />
                ))}
              </div>
            </>
          )}
        </>
      )}

      {/* Create Game Modal */}
      {showCreateModal && (
        <CreateGameModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateGame}
          isLoading={createGame.isPending}
        />
      )}

      {/* Edit Game Modal */}
      {editingGame && (
        <CreateGameModal
          game={editingGame}
          onClose={() => setEditingGame(null)}
          onSubmit={handleUpdateGame}
          isLoading={updateGame.isPending}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deletingGame && (
        <ConfirmModal
          isOpen={true}
          onClose={() => setDeletingGame(null)}
          onConfirm={handleDeleteGame}
          title="Delete Game"
          message={`Are you sure you want to delete "${deletingGame.name}"? This will also delete all related types, events, and classes. This action cannot be undone.`}
          confirmText="Delete Game"
          confirmColor="red"
          isLoading={deleteGame.isPending}
          icon="🗑️"
        />
      )}
    </div>
  )
}