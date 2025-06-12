// src/components/game-management/GameTypesTab.tsx
'use client'

import { useState } from 'react'
import { Game, GameType } from '@/types'
import { useCreateGameType, useUpdateGameType, useDeleteGameType } from '@/hooks/useGameManagement'
import { FormModal } from '@/components/ui/Modal'

interface GameTypesTabProps {
  gameTypes: GameType[]
  games: Game[]
  selectedGameId: string
  onGameChange: (gameId: string) => void
}

interface GameTypeFormData {
  name: string
}

export function GameTypesTab({ gameTypes, games, selectedGameId, onGameChange }: GameTypesTabProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingType, setEditingType] = useState<GameType | null>(null)
  const [formData, setFormData] = useState<GameTypeFormData>({ name: '' })

  const createGameTypeMutation = useCreateGameType()
  const updateGameTypeMutation = useUpdateGameType()
  const deleteGameTypeMutation = useDeleteGameType()

  const selectedGame = games.find(g => g.id === selectedGameId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim() || !selectedGameId) return

    try {
      if (editingType) {
        await updateGameTypeMutation.mutateAsync({
          id: editingType.id,
          game_id: selectedGameId,
          name: formData.name
        })
      } else {
        await createGameTypeMutation.mutateAsync({
          game_id: selectedGameId,
          name: formData.name
        })
      }
      
      handleCloseModal()
    } catch (error) {
      console.error('Error saving game type:', error)
    }
  }

  const handleEdit = (gameType: GameType) => {
    setEditingType(gameType)
    setFormData({ name: gameType.name })
    setIsCreateModalOpen(true)
  }

  const handleDelete = async (gameType: GameType) => {
    if (!confirm(`Are you sure you want to delete "${gameType.name}"?`)) {
      return
    }

    try {
      await deleteGameTypeMutation.mutateAsync({ 
        id: gameType.id, 
        game_id: selectedGameId 
      })
    } catch (error) {
      console.error('Error deleting game type:', error)
    }
  }

  const handleCloseModal = () => {
    setIsCreateModalOpen(false)
    setEditingType(null)
    setFormData({ name: '' })
  }

  // No game selected
  if (!selectedGameId) {
    return (
      <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">🏆</span>
          </div>
          <h3 className="text-xl font-semibold text-white mb-3">No Game Selected</h3>
          <p className="text-slate-400 mb-6">
            Select a game from the Games tab to manage its types.
          </p>
          <button
            onClick={() => onGameChange(games[0]?.id || '')}
            disabled={games.length === 0}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white rounded-xl font-medium transition-all duration-200"
          >
            {games.length > 0 ? 'Select First Game' : 'Create Game First'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      
      {/* Header with Game Selection */}
      <div className="bg-slate-800/30 backdrop-blur-xl rounded-xl border border-slate-700/50 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white mb-2">
              Game Types for: <span className="text-blue-400">{selectedGame?.name}</span>
            </h2>
            <p className="text-slate-400">
              Define competition types like Meistrivõistlused, Treening, or Kiire Mäng
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={selectedGameId}
              onChange={(e) => onGameChange(e.target.value)}
              className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              {games.map((game) => (
                <option key={game.id} value={game.id}>{game.name}</option>
              ))}
            </select>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200"
            >
              + Add Type
            </button>
          </div>
        </div>
      </div>

      {/* Game Types List */}
      {gameTypes.length === 0 ? (
        <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8">
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🏆</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">No Game Types</h3>
            <p className="text-slate-400 mb-4">
              Create game types to categorize different rally competitions.
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200"
            >
              Create First Type
            </button>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {gameTypes.map((gameType) => (
            <div 
              key={gameType.id} 
              className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6 hover:bg-slate-800/70 transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                    <span className="text-orange-300 text-lg">🏆</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{gameType.name}</h3>
                    <p className="text-sm text-slate-400">
                      Created {new Date(gameType.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(gameType)}
                    className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/20 rounded-lg transition-all duration-200"
                    title="Edit Type"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(gameType)}
                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/20 rounded-lg transition-all duration-200"
                    title="Delete Type"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <FormModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseModal}
        title={editingType ? 'Edit Game Type' : 'Create New Game Type'}
        maxWidth="md"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Type Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ name: e.target.value })}
              placeholder="Enter game type name..."
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
              required
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
              disabled={!formData.name.trim() || createGameTypeMutation.isPending || updateGameTypeMutation.isPending}
              className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white rounded-lg font-medium transition-all duration-200"
            >
              {createGameTypeMutation.isPending || updateGameTypeMutation.isPending 
                ? 'Saving...' 
                : editingType ? 'Update Type' : 'Create Type'
              }
            </button>
          </div>
        </form>
      </FormModal>

    </div>
  )
}