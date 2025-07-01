// src/components/game-management/GamesTab.tsx - FUTURISTIC REDESIGN
'use client'

import { useState } from 'react'
import { Game } from '@/types'
import { useGames, useCreateGame, useUpdateGame, useDeleteGame } from '@/hooks/useGameManagement'
import { Modal } from '@/components/ui/Modal'
import '@/styles/futuristic-theme.css'

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
    if (!confirm('Kas oled kindel, et soovid selle mängu kustutada? See kustutab ka kõik seotud andmed.')) {
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
      <div className="flex items-center justify-center py-16">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-red-500/20 border-t-red-500 rounded-full animate-spin"></div>
          <div 
            className="absolute inset-0 w-16 h-16 border-4 border-orange-500/20 border-b-orange-500 rounded-full animate-spin" 
            style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}
          ></div>
        </div>
        <p className="ml-4 text-gray-400 font-['Orbitron']">Laadin mänge...</p>
      </div>
    )
  }

  if (games.length === 0) {
    return (
      <div className="space-y-6">
        {/* Empty State Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold font-['Orbitron'] text-white uppercase tracking-wider">
              Mängud <span className="text-red-500">(0)</span>
            </h2>
            <p className="text-gray-400 mt-1">Loo ja halda rallimängude struktuuri</p>
          </div>
        </div>

        {/* Empty State Content */}
        <div className="tech-border rounded-2xl bg-gray-900/30 backdrop-blur-xl p-12">
          <div className="text-center">
            <div className="w-24 h-24 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-red-500/20">
              <span className="text-5xl text-red-400">🎮</span>
            </div>
            <h3 className="text-xl font-semibold font-['Orbitron'] text-white mb-2 uppercase">
              Mänge ei leitud
            </h3>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              Alusta oma esimese mängu loomisega rallide korraldamiseks
            </p>
            <button
              onClick={handleCreateGame}
              className="px-8 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-['Orbitron'] font-medium rounded-xl transition-all duration-300 shadow-lg hover:shadow-[0_0_30px_rgba(255,0,64,0.5)] uppercase tracking-wider group"
            >
              <span className="flex items-center gap-2">
                <span>+</span>
                <span>Loo esimene mäng</span>
              </span>
            </button>
          </div>
        </div>

        {/* Create/Edit Modal */}
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => {
            setIsCreateModalOpen(false)
            setEditingGame(null)
            setFormData({ name: '' })
          }}
          title={editingGame ? 'Muuda mängu' : 'Loo uus mäng'}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium font-['Orbitron'] text-gray-300 mb-3 uppercase tracking-wider">
                Mängu nimi *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                placeholder="Sisesta mängu nimi"
                required
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setIsCreateModalOpen(false)
                  setEditingGame(null)
                  setFormData({ name: '' })
                }}
                className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white font-['Orbitron'] rounded-xl font-medium transition-all duration-200 uppercase tracking-wider"
              >
                Tühista
              </button>
              <button
                type="submit"
                disabled={createGameMutation.isPending || updateGameMutation.isPending}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-['Orbitron'] rounded-xl font-medium transition-all duration-200 disabled:opacity-50 shadow-lg hover:shadow-[0_0_20px_rgba(255,0,64,0.3)] uppercase tracking-wider"
              >
                {createGameMutation.isPending || updateGameMutation.isPending 
                  ? 'Salvestamine...' 
                  : editingGame ? 'Uuenda' : 'Loo mäng'
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
          <h2 className="text-2xl font-bold font-['Orbitron'] text-white uppercase tracking-wider">
            Mängud <span className="text-red-500">({games.length})</span>
          </h2>
          <p className="text-gray-400 mt-1">Vali mäng komponentide haldamiseks</p>
        </div>
        <button
          onClick={handleCreateGame}
          className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-['Orbitron'] font-medium rounded-xl transition-all duration-300 shadow-lg hover:shadow-[0_0_30px_rgba(255,0,64,0.5)] uppercase tracking-wider group"
        >
          <span className="flex items-center gap-2">
            <span className="text-xl">+</span>
            <span>Loo mäng</span>
          </span>
        </button>
      </div>

      {/* Games Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {games.map((game) => (
          <div 
            key={game.id} 
            className={`
              relative tech-border rounded-2xl p-6 transition-all duration-300 cursor-pointer group
              ${selectedGameId === game.id 
                ? 'bg-gradient-to-br from-red-900/20 to-orange-900/10 border-red-500/50 shadow-[0_0_30px_rgba(255,0,64,0.3)]' 
                : 'bg-gray-900/30 border-gray-700/50 hover:bg-gray-900/50 hover:border-gray-600/50 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]'
              }
            `}
            onClick={() => onGameSelect(game.id)}
          >
            {/* Active Indicator */}
            {selectedGameId === game.id && (
              <div className="absolute top-2 right-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              </div>
            )}

            {/* Game Icon & Header */}
            <div className="flex items-start gap-4 mb-4">
              <div className={`
                w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300
                ${selectedGameId === game.id 
                  ? 'bg-gradient-to-br from-red-500/30 to-orange-500/20 border border-red-500/50 shadow-[0_0_20px_rgba(255,0,64,0.3)]' 
                  : 'bg-gray-800/50 border border-gray-700/50 group-hover:border-gray-600/50'
                }
              `}>
                <span className="text-2xl">🎮</span>
              </div>
              <div className="flex-1">
                <h3 className="font-bold font-['Orbitron'] text-white text-lg uppercase tracking-wide">
                  {game.name}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Loodud {new Date(game.created_at).toLocaleDateString('et-EE')}
                </p>
              </div>
            </div>



            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleEditGame(game)
                }}
                className="flex-1 px-3 py-2 bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 hover:text-white border border-gray-700/50 hover:border-gray-600/50 rounded-lg text-sm font-['Orbitron'] font-medium transition-all duration-200 uppercase tracking-wider"
              >
                Muuda
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleDeleteGame(game.id)
                }}
                disabled={deleteGameMutation.isPending}
                className="flex-1 px-3 py-2 bg-red-900/20 hover:bg-red-900/30 text-red-400 hover:text-red-300 border border-red-500/30 hover:border-red-500/50 rounded-lg text-sm font-['Orbitron'] font-medium transition-all duration-200 disabled:opacity-50 uppercase tracking-wider"
              >
                Kustuta
              </button>
            </div>

            {/* Selection Glow Effect */}
            {selectedGameId === game.id && (
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-red-500/10 to-orange-500/10 pointer-events-none"></div>
            )}
          </div>
        ))}
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false)
          setEditingGame(null)
          setFormData({ name: '' })
        }}
        title={editingGame ? 'Muuda mängu' : 'Loo uus mäng'}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium font-['Orbitron'] text-gray-300 mb-3 uppercase tracking-wider">
              Mängu nimi *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
              placeholder="Sisesta mängu nimi"
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setIsCreateModalOpen(false)
                setEditingGame(null)
                setFormData({ name: '' })
              }}
              className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white font-['Orbitron'] rounded-xl font-medium transition-all duration-200 uppercase tracking-wider"
            >
              Tühista
            </button>
            <button
              type="submit"
              disabled={createGameMutation.isPending || updateGameMutation.isPending}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-['Orbitron'] rounded-xl font-medium transition-all duration-200 disabled:opacity-50 shadow-lg hover:shadow-[0_0_20px_rgba(255,0,64,0.3)] uppercase tracking-wider"
            >
              {createGameMutation.isPending || updateGameMutation.isPending 
                ? 'Salvestamine...' 
                : editingGame ? 'Uuenda' : 'Loo mäng'
              }
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}