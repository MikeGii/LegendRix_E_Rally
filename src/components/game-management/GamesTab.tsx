// src/components/game-management/GamesTab.tsx
'use client'

import { useState } from 'react'
import { Game } from '@/types'
import { useCreateGame, useUpdateGame, useDeleteGame } from '@/hooks/useGameManagement'
import { FormModal } from '@/components/shared/Modal'

interface GamesTabProps {
  games: Game[]
  onGameSelect: (gameId: string) => void
  selectedGameId: string
}

interface GameFormData {
  name: string
  description?: string
}

export function GamesTab({ games, onGameSelect, selectedGameId }: GamesTabProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingGame, setEditingGame] = useState<Game | null>(null)
  const [formData, setFormData] = useState<GameFormData>({ name: '', description: '' })

  const createGameMutation = useCreateGame()
  const updateGameMutation = useUpdateGame()
  const deleteGameMutation = useDeleteGame()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) return

    try {
      if (editingGame) {
        await updateGameMutation.mutateAsync({
          id: editingGame.id,
          name: formData.name,
          description: formData.description
        })
      } else {
        const newGame = await createGameMutation.mutateAsync(formData)
        onGameSelect(newGame.id) // Auto-select the new game
      }
      
      handleCloseModal()
    } catch (error) {
      console.error('Error saving game:', error)
    }
  }

  const handleEdit = (game: Game) => {
    setEditingGame(game)
    setFormData({
      name: game.name,
      description: game.description || ''
    })
    setIsCreateModalOpen(true)
  }

  const handleDelete = async (game: Game) => {
    if (!confirm(`Are you sure you want to delete "${game.name}"? This will delete ALL related game types, events, tracks, and classes. This action cannot be undone.`)) {
      return
    }

    try {
      await deleteGameMutation.mutateAsync(game.id)
      if (selectedGameId === game.id) {
        onGameSelect('') // Clear selection if deleted game was selected
      }
    } catch (error) {
      console.error('Error deleting game:', error)
    }
  }

  const handleCloseModal = () => {
    setIsCreateModalOpen(false)
    setEditingGame(null)
    setFormData({ name: '', description: '' })
  }

  if (games.length === 0) {
    return (
      <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">🎮</span>
          </div>
          <h3 className="text-xl font-semibold text-white mb-3">No Games Created</h3>
          <p className="text-slate-400 mb-6 max-w-md mx-auto">
            Create your first game to start building rally competitions. Games are the foundation for organizing events, tracks, and classes.
          </p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all duration-200"
          >
            Create First Game
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      
      {/* Header with Create Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Games ({games.length})</h2>
          <p className="text-slate-400">Manage rally games and select one to configure types, events, and classes</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200"
        >
          + Create Game
        </button>
      </div>

      {/* Games Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {games.map((game) => (
          <div 
            key={game.id} 
            className={`
              bg-slate-800/50 rounded-xl border p-6 transition-all duration-200 cursor-pointer
              ${selectedGameId === game.id 
                ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/25' 
                : 'border-slate-700/50 hover:border-slate-600 hover:bg-slate-800/70'
              }
            `}
            onClick={() => onGameSelect(game.id)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                  <span className="text-purple-300 text-xl">🎮</span>
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">{game.name}</h3>
                  <p className="text-sm text-slate-400">
                    Created {new Date(game.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleEdit(game)
                  }}
                  className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/20 rounded-lg transition-all duration-200"
                  title="Edit Game"
                >
                  ✏️
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDelete(game)
                  }}
                  className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/20 rounded-lg transition-all duration-200"
                  title="Delete Game"
                >
                  🗑️
                </button>
              </div>
            </div>

            {game.description && (
              <p className="text-slate-300 text-sm mb-4">{game.description}</p>
            )}

            {selectedGameId === game.id && (
              <div className="bg-blue-500/20 rounded-lg p-3 border border-blue-500/30">
                <p className="text-blue-300 text-sm font-medium">
                  ✨ Selected - Use other tabs to manage this game's content
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Create/Edit Modal */}
      <FormModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseModal}
        title={editingGame ? 'Edit Game' : 'Create New Game'}
        maxWidth="md"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Game Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter game name..."
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter description..."
              rows={3}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={handleCloseModal}
              className="flex-1 px-4 py-3 bg-slate-600 hover:bg-slate-500 text-white rounded-lg font-medium transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!formData.name.trim() || createGameMutation.isPending || updateGameMutation.isPending}
              className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white rounded-lg font-medium transition-all duration-200"
            >
              {createGameMutation.isPending || updateGameMutation.isPending 
                ? 'Saving...' 
                : editingGame ? 'Update Game' : 'Create Game'
              }
            </button>
          </div>
        </form>
      </FormModal>

    </div>
  )
}