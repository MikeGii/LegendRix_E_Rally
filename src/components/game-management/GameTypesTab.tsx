// src/components/game-management/GameTypesTab.tsx - FUTURISTIC REDESIGN
'use client'

import { useState } from 'react'
import { Game, GameType } from '@/types'
import { useCreateGameType, useUpdateGameType, useDeleteGameType } from '@/hooks/useGameManagement'
import { Modal } from '@/components/ui/Modal'
import '@/styles/futuristic-theme.css'

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
    if (!confirm(`Kas oled kindel, et soovid kustutada tüübi "${gameType.name}"?`)) {
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

  // No game selected state
  if (!selectedGameId) {
    return (
      <div className="tech-border rounded-2xl bg-gray-900/30 backdrop-blur-xl p-12">
        <div className="text-center">
          <div className="w-24 h-24 bg-orange-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-orange-500/20">
            <span className="text-5xl text-orange-400">🏆</span>
          </div>
          <h3 className="text-xl font-semibold font-['Orbitron'] text-white mb-3 uppercase">
            Mäng valimata
          </h3>
          <p className="text-gray-400 mb-8 max-w-md mx-auto">
            Vali mäng "Mängud" vahekaardilt, et hallata selle tüüpe
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
                  className="tech-border rounded-xl p-4 bg-gray-800/30 hover:bg-gray-800/50 border-gray-700/50 hover:border-orange-500/50 transition-all duration-300 group hover:shadow-[0_0_20px_rgba(255,165,0,0.2)]"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🎮</span>
                    <span className="font-['Orbitron'] text-white group-hover:text-orange-400 transition-colors">
                      {game.name}
                    </span>
                    <span className="ml-auto text-orange-400 opacity-0 group-hover:opacity-100 transition-opacity">
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

  // Empty state when game is selected but no types exist
  if (gameTypes.length === 0) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold font-['Orbitron'] text-white uppercase tracking-wider">
              Mängu tüübid <span className="text-orange-500">(0)</span>
            </h2>
            <p className="text-gray-400 mt-1">
              Valitud mäng: <span className="text-orange-400 font-medium">{selectedGame?.name}</span>
            </p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white font-['Orbitron'] font-medium rounded-xl transition-all duration-300 shadow-lg hover:shadow-[0_0_30px_rgba(255,165,0,0.5)] uppercase tracking-wider group"
          >
            <span className="flex items-center gap-2">
              <span className="text-xl">+</span>
              <span>Loo tüüp</span>
            </span>
          </button>
        </div>

        {/* Empty State Content */}
        <div className="tech-border rounded-2xl bg-gray-900/30 backdrop-blur-xl p-12">
          <div className="text-center">
            <div className="w-24 h-24 bg-orange-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-orange-500/20">
              <span className="text-5xl text-orange-400">🏆</span>
            </div>
            <h3 className="text-xl font-semibold font-['Orbitron'] text-white mb-2 uppercase">
              Tüüpe ei leitud
            </h3>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              Lisa esimene mängu tüüp rallide kategoriseerimiseks
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-8 py-3 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white font-['Orbitron'] font-medium rounded-xl transition-all duration-300 shadow-lg hover:shadow-[0_0_30px_rgba(255,165,0,0.5)] uppercase tracking-wider"
            >
              Loo esimene tüüp
            </button>
          </div>
        </div>

      </div>
    )
  }

  // Main content with game types
  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold font-['Orbitron'] text-white uppercase tracking-wider">
            Mängu tüübid <span className="text-orange-500">({gameTypes.length})</span>
          </h2>
          <p className="text-gray-400 mt-1">
            Valitud mäng: <span className="text-orange-400 font-medium">{selectedGame?.name}</span>
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white font-['Orbitron'] font-medium rounded-xl transition-all duration-300 shadow-lg hover:shadow-[0_0_30px_rgba(255,165,0,0.5)] uppercase tracking-wider group"
        >
          <span className="flex items-center gap-2">
            <span className="text-xl">+</span>
            <span>Loo tüüp</span>
          </span>
        </button>
      </div>

      {/* Game Types Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {gameTypes.map((gameType) => (
          <div 
            key={gameType.id} 
            className="relative tech-border rounded-2xl p-6 transition-all duration-300 bg-gray-900/30 border-gray-700/50 hover:bg-gray-900/50 hover:border-orange-500/50 hover:shadow-[0_0_20px_rgba(255,165,0,0.2)] group"
          >
            {/* Type Icon & Header */}
            <div className="flex items-start gap-4 mb-4">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-br from-orange-500/30 to-yellow-500/20 border border-orange-500/50 group-hover:shadow-[0_0_20px_rgba(255,165,0,0.3)] transition-all duration-300">
                <span className="text-2xl">🏆</span>
              </div>
              <div className="flex-1">
                <h3 className="font-bold font-['Orbitron'] text-white text-lg uppercase tracking-wide">
                  {gameType.name}
                </h3>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(gameType)}
                className="flex-1 px-3 py-2 bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 hover:text-white border border-gray-700/50 hover:border-gray-600/50 rounded-lg text-sm font-['Orbitron'] font-medium transition-all duration-200 uppercase tracking-wider"
              >
                Muuda
              </button>
              <button
                onClick={() => handleDelete(gameType)}
                disabled={deleteGameTypeMutation.isPending}
                className="flex-1 px-3 py-2 bg-red-900/20 hover:bg-red-900/30 text-red-400 hover:text-red-300 border border-red-500/30 hover:border-red-500/50 rounded-lg text-sm font-['Orbitron'] font-medium transition-all duration-200 disabled:opacity-50 uppercase tracking-wider"
              >
                Kustuta
              </button>
            </div>

            {/* Hover Glow Effect */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-orange-500/0 to-yellow-500/0 group-hover:from-orange-500/5 group-hover:to-yellow-500/5 pointer-events-none transition-all duration-300"></div>
          </div>
        ))}
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={handleCloseModal}
        title={editingType ? 'Muuda tüüpi' : 'Loo uus tüüp'}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium font-['Orbitron'] text-gray-300 mb-3 uppercase tracking-wider">
              Tüübi nimi *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
              placeholder="Sisesta tüübi nimi"
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
              disabled={createGameTypeMutation.isPending || updateGameTypeMutation.isPending}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white font-['Orbitron'] rounded-xl font-medium transition-all duration-200 disabled:opacity-50 shadow-lg hover:shadow-[0_0_20px_rgba(255,165,0,0.3)] uppercase tracking-wider"
            >
              {createGameTypeMutation.isPending || updateGameTypeMutation.isPending 
                ? 'Salvestamine...' 
                : editingType ? 'Uuenda' : 'Loo tüüp'
              }
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}