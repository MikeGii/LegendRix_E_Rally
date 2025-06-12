// src/components/game-management/GameEventsTab.tsx
'use client'

import { useState } from 'react'
import { Game, GameEvent } from '@/types'
import { useCreateGameEvent, useUpdateGameEvent, useDeleteGameEvent } from '@/hooks/useGameManagement'
import { FormModal } from '@/components/ui/Modal'

interface GameEventsTabProps {
  gameEvents: GameEvent[]
  games: Game[]
  selectedGameId: string
  onGameChange: (gameId: string) => void
  onEventSelect: (eventId: string) => void
}

interface GameEventFormData {
  name: string
}

export function GameEventsTab({ 
  gameEvents, 
  games, 
  selectedGameId, 
  onGameChange, 
  onEventSelect 
}: GameEventsTabProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<GameEvent | null>(null)
  const [formData, setFormData] = useState<GameEventFormData>({ name: '' })

  const createGameEventMutation = useCreateGameEvent()
  const updateGameEventMutation = useUpdateGameEvent()
  const deleteGameEventMutation = useDeleteGameEvent()

  const selectedGame = games.find(g => g.id === selectedGameId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim() || !selectedGameId) return

    try {
      if (editingEvent) {
        await updateGameEventMutation.mutateAsync({
          id: editingEvent.id,
          game_id: selectedGameId,
          name: formData.name
        })
      } else {
        await createGameEventMutation.mutateAsync({
          game_id: selectedGameId,
          name: formData.name
        })
      }
      
      handleCloseModal()
    } catch (error) {
      console.error('Error saving game event:', error)
    }
  }

  const handleEdit = (gameEvent: GameEvent) => {
    setEditingEvent(gameEvent)
    setFormData({ name: gameEvent.name })
    setIsCreateModalOpen(true)
  }

  const handleDelete = async (gameEvent: GameEvent) => {
    if (!confirm(`Are you sure you want to delete "${gameEvent.name}"? This will also delete all tracks for this event.`)) {
      return
    }

    try {
      await deleteGameEventMutation.mutateAsync({ 
        id: gameEvent.id, 
        game_id: selectedGameId 
      })
    } catch (error) {
      console.error('Error deleting game event:', error)
    }
  }

  const handleCloseModal = () => {
    setIsCreateModalOpen(false)
    setEditingEvent(null)
    setFormData({ name: '' })
  }

  // No game selected
  if (!selectedGameId) {
    return (
      <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">🏁</span>
          </div>
          <h3 className="text-xl font-semibold text-white mb-3">No Game Selected</h3>
          <p className="text-slate-400 mb-6">
            Select a game from the Games tab to manage its events.
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
              Events for: <span className="text-blue-400">{selectedGame?.name}</span>
            </h2>
            <p className="text-slate-400">
              Add rally events like Rally Estonia, Rally Latvia, etc.
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
              + Add Event
            </button>
          </div>
        </div>
      </div>

      {/* Game Events List */}
      {gameEvents.length === 0 ? (
        <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8">
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🏁</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">No Events</h3>
            <p className="text-slate-400 mb-4">
              Add rally events to organize tracks and competitions.
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200"
            >
              Create First Event
            </button>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {gameEvents.map((gameEvent) => (
            <div 
              key={gameEvent.id} 
              className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6 hover:bg-slate-800/70 transition-all duration-200 cursor-pointer"
              onClick={() => onEventSelect(gameEvent.id)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <span className="text-green-300 text-lg">🏁</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{gameEvent.name}</h3>
                    <p className="text-sm text-slate-400">
                      Created {new Date(gameEvent.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleEdit(gameEvent)
                    }}
                    className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/20 rounded-lg transition-all duration-200"
                    title="Edit Event"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(gameEvent)
                    }}
                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/20 rounded-lg transition-all duration-200"
                    title="Delete Event"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              <div className="bg-slate-700/30 rounded-lg p-3">
                <p className="text-slate-300 text-sm">
                  Click to manage tracks for this event
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
        title={editingEvent ? 'Edit Rally Event' : 'Create New Rally Event'}
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Event Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ name: e.target.value })}
              placeholder="Enter rally event name..."
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
              disabled={!formData.name.trim() || createGameEventMutation.isPending || updateGameEventMutation.isPending}
              className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white rounded-lg font-medium transition-all duration-200"
            >
              {createGameEventMutation.isPending || updateGameEventMutation.isPending 
                ? 'Saving...' 
                : editingEvent ? 'Update Event' : 'Create Event'
              }
            </button>
          </div>
        </form>
      </FormModal>

    </div>
  )
}