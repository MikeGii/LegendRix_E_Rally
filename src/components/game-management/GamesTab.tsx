// src/components/game-management/GamesTab.tsx - FINAL FIXED VERSION
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

  // FIXED: Accept Partial<Game> but convert to required fields for mutation
  const handleCreateGame = async (gameData: Partial<Game>) => {
    try {
      // Convert Partial<Game> to the format expected by createGame.mutateAsync
      const gameFormData = {
        name: gameData.name || '',
        developer: gameData.developer || '',
        platform: gameData.platform || '',
        release_year: gameData.release_year || new Date().getFullYear(),
        description: gameData.description,
        is_active: true
      }
      
      const newGame = await createGame.mutateAsync(gameFormData)
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

  const isLoading = createGame.isPending || updateGame.isPending || deleteGame.isPending

  if (isLoading) {
    return <LoadingState message="Managing games..." />
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
          className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-all duration-200 font-medium shadow-lg hover:shadow-green-500/25 flex items-center space-x-2"
        >
          <span>➕</span>
          <span>Add Game</span>
        </button>
      </div>

      {games.length === 0 ? (
        <EmptyState
          title="No Games Found"
          message="Create your first game to start managing rally competitions."
          icon="🎮"
          action={{
            label: "Create First Game",
            onClick: () => setShowCreateModal(true)
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              isSelected={selectedGame?.id === game.id}
              onSelect={() => handleGameSelect(game)}
              onEdit={() => setEditingGame(game)}
              onDelete={() => setDeletingGame(game)}
            />
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {(showCreateModal || editingGame) && (
        <CreateGameModal
          game={editingGame}
          onClose={() => {
            setShowCreateModal(false)
            setEditingGame(null)
          }}
          onSubmit={editingGame ? handleUpdateGame : handleCreateGame}
          isLoading={isLoading}
        />
      )}

      {/* Delete Confirmation */}
      {deletingGame && (
        <ConfirmModal
          isOpen={true}
          onClose={() => setDeletingGame(null)}
          onConfirm={handleDeleteGame}
          title="Delete Game"
          message={`Are you sure you want to delete "${deletingGame.name}"? This action cannot be undone.`}
          confirmText="Delete Game"
          confirmColor="red"
          isLoading={deleteGame.isPending}
        />
      )}
    </div>
  )
}