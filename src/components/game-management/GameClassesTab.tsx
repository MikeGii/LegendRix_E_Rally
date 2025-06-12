// src/components/game-management/GameClassesTab.tsx
'use client'

import { useState } from 'react'
import { Game, GameClass } from '@/types'
import { useCreateGameClass, useUpdateGameClass, useDeleteGameClass } from '@/hooks/useGameManagement'
import { FormModal } from '@/components/shared/Modal'

interface GameClassesTabProps {
  gameClasses: GameClass[]
  games: Game[]
  selectedGameId: string
  onGameChange: (gameId: string) => void
}

interface GameClassFormData {
  name: string
}

// Common rally class names
const SUGGESTED_CLASS_NAMES = [
  'WRC',
  'Rally2',
  'Rally3',
  'Rally4',
  'Rally5',
  'Historic',
  'Junior WRC',
  'R5',
  'N5',
  'A8',
  'A7',
  'A6',
  'Group B',
  'Group A',
  'Open Class',
  'Rookie',
  'Veterans',
  'Masters',
  'Ladies',
  'Co-drivers'
]

export function GameClassesTab({ gameClasses, games, selectedGameId, onGameChange }: GameClassesTabProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingClass, setEditingClass] = useState<GameClass | null>(null)
  const [formData, setFormData] = useState<GameClassFormData>({ name: '' })

  const createGameClassMutation = useCreateGameClass()
  const updateGameClassMutation = useUpdateGameClass()
  const deleteGameClassMutation = useDeleteGameClass()

  const selectedGame = games.find(g => g.id === selectedGameId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim() || !selectedGameId) return

    try {
      if (editingClass) {
        await updateGameClassMutation.mutateAsync({
          id: editingClass.id,
          game_id: selectedGameId,
          name: formData.name
        })
      } else {
        await createGameClassMutation.mutateAsync({
          game_id: selectedGameId,
          name: formData.name
        })
      }
      
      handleCloseModal()
    } catch (error) {
      console.error('Error saving game class:', error)
    }
  }

  const handleEdit = (gameClass: GameClass) => {
    setEditingClass(gameClass)
    setFormData({ name: gameClass.name })
    setIsCreateModalOpen(true)
  }

  const handleDelete = async (gameClass: GameClass) => {
    if (!confirm(`Are you sure you want to delete class "${gameClass.name}"?`)) {
      return
    }

    try {
      await deleteGameClassMutation.mutateAsync({ 
        id: gameClass.id, 
        game_id: selectedGameId 
      })
    } catch (error) {
      console.error('Error deleting game class:', error)
    }
  }

  const handleCloseModal = () => {
    setIsCreateModalOpen(false)
    setEditingClass(null)
    setFormData({ name: '' })
  }

  const handleSuggestedClass = (suggestedName: string) => {
    setFormData({ name: suggestedName })
  }

  // No game selected
  if (!selectedGameId) {
    return (
      <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">🎯</span>
          </div>
          <h3 className="text-xl font-semibold text-white mb-3">No Game Selected</h3>
          <p className="text-slate-400 mb-6">
            Select a game from the Games tab to manage its classes.
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
              Classes for: <span className="text-blue-400">{selectedGame?.name}</span>
            </h2>
            <p className="text-slate-400">
              Create registration classes for participants to compete in
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
              + Add Class
            </button>
          </div>
        </div>
      </div>

      {/* Game Classes List */}
      {gameClasses.length === 0 ? (
        <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8">
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🎯</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">No Classes</h3>
            <p className="text-slate-400 mb-4">
              Create classes for participants to register in rallies.
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200"
            >
              Create First Class
            </button>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {gameClasses.map((gameClass) => (
            <div 
              key={gameClass.id} 
              className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6 hover:bg-slate-800/70 transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <span className="text-purple-300 text-lg">🎯</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{gameClass.name}</h3>
                    <p className="text-sm text-slate-400">
                      Created {new Date(gameClass.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(gameClass)}
                    className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/20 rounded-lg transition-all duration-200"
                    title="Edit Class"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(gameClass)}
                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/20 rounded-lg transition-all duration-200"
                    title="Delete Class"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              <div className="bg-slate-700/30 rounded-lg p-3">
                <p className="text-slate-300 text-sm">
                  Available for rally registration
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <FormModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseModal}
        title={editingClass ? 'Edit Rally Class' : 'Create New Rally Class'}
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Suggested Classes (only for new classes) */}
          {!editingClass && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">
                Common Rally Classes
              </label>
              <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                {SUGGESTED_CLASS_NAMES.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => handleSuggestedClass(suggestion)}
                    className={`
                      px-3 py-2 text-left rounded-lg border transition-all duration-200 text-sm
                      ${formData.name === suggestion
                        ? 'bg-blue-500/20 border-blue-500/50 text-blue-300'
                        : 'bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-slate-700 hover:border-slate-500'
                      }
                    `}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
              <div className="text-center my-4">
                <span className="text-slate-500 text-sm">or create custom class below</span>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Class Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ name: e.target.value })}
              placeholder="Enter class name..."
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
              required
            />
            <p className="text-sm text-slate-500 mt-2">
              Examples: WRC, Rally2, Historic, Junior WRC
            </p>
          </div>

          <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-purple-400">ℹ️</span>
              <span className="text-purple-300 font-medium">Class Guidelines</span>
            </div>
            <ul className="text-sm text-purple-200 space-y-1">
              <li>• Only class name is required - no difficulty levels or additional info</li>
              <li>• Classes are used for participant registration in rallies</li>
              <li>• Keep names simple and recognizable to rally participants</li>
              <li>• No skill levels, car requirements, or other metadata allowed</li>
            </ul>
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
              disabled={!formData.name.trim() || createGameClassMutation.isPending || updateGameClassMutation.isPending}
              className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white rounded-lg font-medium transition-all duration-200"
            >
              {createGameClassMutation.isPending || updateGameClassMutation.isPending 
                ? 'Saving...' 
                : editingClass ? 'Update Class' : 'Create Class'
              }
            </button>
          </div>
        </form>
      </FormModal>

    </div>
  )
}