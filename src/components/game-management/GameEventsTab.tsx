// src/components/game-management/GameEventsTab.tsx
'use client'

import { useState } from 'react'
import { Game, GameEvent } from '@/types'
import { useCreateGameEvent, useUpdateGameEvent, useDeleteGameEvent } from '@/hooks/useGameManagement'
import { Modal } from '@/components/ui/Modal'
import '@/styles/futuristic-theme.css'

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
    if (!confirm(`Kas oled kindel, et soovid kustutada sündmuse "${gameEvent.name}"?`)) {
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
  // No game selected state
  if (!selectedGameId) {
    return (
      <div className="tech-border rounded-2xl bg-gray-900/30 backdrop-blur-xl p-12">
        <div className="text-center">
          <div className="w-24 h-24 bg-purple-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-purple-500/20">
            <span className="text-5xl text-purple-400">🏁</span>
          </div>
          <h3 className="text-xl font-semibold font-['Orbitron'] text-white mb-3 uppercase">
            Mäng valimata
          </h3>
          <p className="text-gray-400 mb-8 max-w-md mx-auto">
            Vali mäng "Mängud" vahekaardilt, et hallata selle sündmusi
          </p>
          
          {/* Game Selection Grid */}
          <div className="max-w-2xl mx-auto">
            <p className="text-sm text-gray-500 mb-4 font-['Orbitron'] uppercase tracking-wider">
              Saadavalolevad mängud
            </p>
            <div className="grid gap-3 md:grid-cols-2">
              {games.map((game) => (
                <button
                  key={game.id}
                  onClick={() => onGameChange(game.id)}
                  className="tech-border rounded-xl p-4 bg-gray-800/30 hover:bg-gray-800/50 border-gray-700/50 hover:border-purple-500/50 transition-all duration-300 group hover:shadow-[0_0_20px_rgba(147,51,234,0.2)]"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🎮</span>
                    <span className="font-['Orbitron'] text-white group-hover:text-purple-400 transition-colors">
                      {game.name}
                    </span>
                    <span className="ml-auto text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      →
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Main content
  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold font-['Orbitron'] text-white uppercase tracking-wider">
            Sündmused <span className="text-purple-500">({gameEvents.length})</span>
          </h2>
          <p className="text-gray-400 mt-1">
            Valitud mäng: <span className="text-purple-400 font-medium">{selectedGame?.name}</span>
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-['Orbitron'] font-medium rounded-xl transition-all duration-300 shadow-lg hover:shadow-[0_0_30px_rgba(147,51,234,0.5)] uppercase tracking-wider group"
        >
          <span className="flex items-center gap-2">
            <span className="text-xl">+</span>
            <span>Loo sündmus</span>
          </span>
        </button>
      </div>

      {/* Game Events Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {gameEvents.map((gameEvent) => (
          <div 
            key={gameEvent.id} 
            className="relative tech-border rounded-2xl p-6 transition-all duration-300 cursor-pointer group bg-gray-900/30 border-gray-700/50 hover:bg-gray-900/50 hover:border-purple-500/50 hover:shadow-[0_0_20px_rgba(147,51,234,0.2)]"
            onClick={() => onEventSelect(gameEvent.id)}
          >
            {/* Event Icon & Header */}
            <div className="flex items-start gap-4 mb-6">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300 bg-gray-800/50 border border-gray-700/50 group-hover:border-purple-500/50">
                <span className="text-2xl">🏁</span>
              </div>
              <div className="flex-1">
                <h3 className="font-bold font-['Orbitron'] text-white text-lg uppercase tracking-wide">
                  {gameEvent.name}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Loodud {new Date(gameEvent.created_at).toLocaleDateString('et-EE')}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleEdit(gameEvent)
                }}
                className="flex-1 px-3 py-2 bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 hover:text-white border border-gray-700/50 hover:border-gray-600/50 rounded-lg text-sm font-['Orbitron'] font-medium transition-all duration-200 uppercase tracking-wider"
              >
                Muuda
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleDelete(gameEvent)
                }}
                disabled={deleteGameEventMutation.isPending}
                className="flex-1 px-3 py-2 bg-red-900/20 hover:bg-red-900/30 text-red-400 hover:text-red-300 border border-red-500/30 hover:border-red-500/50 rounded-lg text-sm font-['Orbitron'] font-medium transition-all duration-200 disabled:opacity-50 uppercase tracking-wider"
              >
                Kustuta
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={handleCloseModal}
        title={editingEvent ? 'Muuda sündmust' : 'Loo uus sündmus'}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium font-['Orbitron'] text-gray-300 mb-3 uppercase tracking-wider">
              Sündmuse nimi *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              placeholder="Sisesta sündmuse nimi"
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleCloseModal}
              className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white font-['Orbitron'] rounded-xl font-medium transition-all duration-200 uppercase tracking-wider"
            >
              Tühista
            </button>
            <button
              type="submit"
              disabled={createGameEventMutation.isPending || updateGameEventMutation.isPending}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-['Orbitron'] rounded-xl font-medium transition-all duration-200 disabled:opacity-50 shadow-lg hover:shadow-[0_0_20px_rgba(147,51,234,0.3)] uppercase tracking-wider"
            >
              {createGameEventMutation.isPending || updateGameEventMutation.isPending 
                ? 'Salvestamine...' 
                : editingEvent ? 'Uuenda' : 'Loo sündmus'
              }
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}