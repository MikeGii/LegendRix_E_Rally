// src/components/game-management/GamesTab.tsx - FIXED VERSION (mutation properties)
'use client'

import { useState } from 'react'
import { Game } from '@/types'
import { useGames, useCreateGame, useUpdateGame, useDeleteGame } from '@/hooks/useGameManagement'
import { Modal } from '@/components/ui/Modal'

interface GamesTabProps {
  selectedGameId?: string
  onGameSelect: (gameId: string) => void
}

export function GamesTab({ selectedGameId, onGameSelect }: GamesTabProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingGame, setEditingGame] = useState<Game | null>(null)
  const [formData, setFormData] = useState({
    name: ''
  })

  const { data: games = [], isLoading } = useGames()
  const createGameMutation = useCreateGame()
  const updateGameMutation = useUpdateGame()
  const deleteGameMutation = useDeleteGame()

  const handleCreateGame = () => {
    setFormData({ name: '' })
    setEditingGame(null)
    setIsCreateModalOpen(true)
  }

  const handleEditGame = (game: Game) => {
    setFormData({
      name: game.name
    })
    setEditingGame(game)
    setIsCreateModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (editingGame) {
        await updateGameMutation.mutateAsync({
          id: editingGame.id,
          name: formData.name
        })
      } else {
        await createGameMutation.mutateAsync({
          name: formData.name
        })
      }
      
      setIsCreateModalOpen(false)
      setFormData({ name: '' })
      setEditingGame(null)
    } catch (error) {
      console.error('Error saving game:', error)
    }
  }

  const handleDeleteGame = async (gameId: string) => {
    if (!confirm('Are you sure you want to delete this game? This will also delete all related content.')) {
      return
    }

    try {
      await deleteGameMutation.mutateAsync(gameId)
    } catch (error) {
      console.error('Error deleting game:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-slate-600 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading games...</p>
        </div>
      </div>
    )
  }

  if (games.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">Games (0)</h2>
            <p className="text-slate-400">Create and manage games for your rally platform</p>
          </div>
          <button
            onClick={handleCreateGame}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200"
          >
            + Create Game
          </button>
        </div>

        <div className="text-center py-12">
          <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl text-slate-500">🎮</span>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">No Games Created</h3>
          <p className="text-slate-400 mb-4">Create your first game to start managing rally competitions</p>
          <button
            onClick={handleCreateGame}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200"
          >
            Create First Game
          </button>
        </div>

        {/* Create/Edit Modal */}
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => {
            setIsCreateModalOpen(false)
            setEditingGame(null)
            setFormData({ name: '' })
          }}
          title={editingGame ? 'Edit Game' : 'Create New Game'}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Game Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter game name"
                required
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setIsCreateModalOpen(false)
                  setEditingGame(null)
                  setFormData({ name: '' })
                }}
                className="flex-1 px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg font-medium transition-all duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createGameMutation.isPending || updateGameMutation.isPending}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-50"
              >
                {createGameMutation.isPending || updateGameMutation.isPending 
                  ? 'Saving...' 
                  : editingGame ? 'Update Game' : 'Create Game'
                }
              </button>
            </div>
          </form>
        </Modal>
      </div>
    )
  }

  console.log('📋 Rendering games list with', games.length, 'games')
  
  return (
    <div className="space-y-6">
      
      {/* Header with Create Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Games ({games.length})</h2>
          <p className="text-slate-400">Manageeri mänge, vali mäng, et jätkata komponentide lisamist/muutmist!</p>
        </div>
        <button
          onClick={handleCreateGame}
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
                ? 'border-blue-500 bg-blue-500/10' 
                : 'border-slate-700/50 hover:border-slate-600'
              }
            `}
            onClick={() => onGameSelect(game.id)}
          >
            {/* Game Header */}
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <span className="text-blue-400 text-xl">🎮</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-white">{game.name}</h3>
                <p className="text-sm text-slate-400">
                  Created {new Date(game.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Game Status */}
            <div className="mb-4">
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                game.is_active 
                  ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                  : 'bg-red-500/20 text-red-400 border-red-500/30'
              }`}>
                {game.is_active ? 'ACTIVE' : 'INACTIVE'}
              </span>
            </div>

            {/* Game Actions */}
            <div className="flex space-x-2">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleEditGame(game)
                }}
                className="flex-1 px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-600/30 rounded-lg text-sm font-medium transition-all duration-200"
              >
                Edit
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleDeleteGame(game.id)
                }}
                disabled={deleteGameMutation.isPending}
                className="flex-1 px-3 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-600/30 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-50"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create/Edit Modal - FIXED mutation properties */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false)
          setEditingGame(null)
          setFormData({ name: '' })
        }}
        title={editingGame ? 'Edit Game' : 'Create New Game'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Game Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter game name (e.g., Dirt Rally 2.0)"
              required
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setIsCreateModalOpen(false)
                setEditingGame(null)
                setFormData({ name: '' })
              }}
              className="flex-1 px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg font-medium transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createGameMutation.isPending || updateGameMutation.isPending}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-50"
            >
              {createGameMutation.isPending || updateGameMutation.isPending 
                ? 'Saving...' 
                : editingGame ? 'Update Game' : 'Create Game'
              }
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}