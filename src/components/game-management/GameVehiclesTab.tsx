// src/components/game-management/GameVehiclesTab.tsx
'use client'

import { useState } from 'react'
import { Game } from '@/types'
import { GameVehicle, useCreateVehicle, useUpdateVehicle, useDeleteVehicle } from '@/hooks/useGameVehicles'
import { Modal } from '@/components/ui/Modal'
import '@/styles/futuristic-theme.css'

interface GameVehiclesTabProps {
  gameVehicles: GameVehicle[]
  games: Game[]
  selectedGameId: string
  onGameChange: (gameId: string) => void
}

interface VehicleFormData {
  vehicle_name: string
}

export function GameVehiclesTab({ gameVehicles, games, selectedGameId, onGameChange }: GameVehiclesTabProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingVehicle, setEditingVehicle] = useState<GameVehicle | null>(null)
  const [formData, setFormData] = useState<VehicleFormData>({ vehicle_name: '' })
  const [deletingVehicleId, setDeletingVehicleId] = useState<string | null>(null)

  const createVehicleMutation = useCreateVehicle()
  const updateVehicleMutation = useUpdateVehicle()
  const deleteVehicleMutation = useDeleteVehicle()

  const selectedGame = games.find(g => g.id === selectedGameId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.vehicle_name.trim() || !selectedGameId) return

    try {
      if (editingVehicle) {
        await updateVehicleMutation.mutateAsync({
          id: editingVehicle.id,
          vehicle_name: formData.vehicle_name.trim()
        })
        alert('Sõiduk edukalt uuendatud!')
      } else {
        await createVehicleMutation.mutateAsync({
          game_id: selectedGameId,
          vehicle_name: formData.vehicle_name.trim()
        })
        alert('Sõiduk edukalt lisatud!')
      }
      
      handleCloseModal()
    } catch (error: any) {
      alert(error.message || 'Viga sõiduki salvestamisel')
    }
  }

  const handleEdit = (vehicle: GameVehicle) => {
    setEditingVehicle(vehicle)
    setFormData({ vehicle_name: vehicle.vehicle_name })
    setIsCreateModalOpen(true)
  }

  const handleDelete = async (vehicle: GameVehicle) => {
    if (!confirm(`Kas oled kindel, et soovid kustutada sõiduki "${vehicle.vehicle_name}"?`)) {
      return
    }

    setDeletingVehicleId(vehicle.id)
    try {
      await deleteVehicleMutation.mutateAsync({ 
        vehicleId: vehicle.id, 
        gameId: selectedGameId 
      })
      alert('Sõiduk edukalt kustutatud!')
    } catch (error: any) {
      alert(error.message || 'Viga sõiduki kustutamisel')
    } finally {
      setDeletingVehicleId(null)
    }
  }

  const handleCloseModal = () => {
    setIsCreateModalOpen(false)
    setEditingVehicle(null)
    setFormData({ vehicle_name: '' })
  }

  // No game selected
  if (!selectedGameId) {
    return (
      <div className="tech-border rounded-2xl bg-gray-900/30 backdrop-blur-xl p-12">
        <div className="text-center">
          <div className="w-24 h-24 bg-yellow-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-yellow-500/20">
            <span className="text-5xl text-yellow-400">🚗</span>
          </div>
          <h3 className="text-xl font-semibold font-['Orbitron'] text-white mb-3 uppercase">
            Mäng valimata
          </h3>
          <p className="text-gray-400 mb-8 max-w-md mx-auto">
            Vali mäng "Mängud" vahekaardilt, et hallata selle sõidukeid
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
                  className="tech-border rounded-xl p-4 bg-gray-800/30 hover:bg-gray-800/50 border-gray-700/50 hover:border-yellow-500/50 transition-all duration-300 group hover:shadow-[0_0_20px_rgba(250,204,21,0.2)]"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🎮</span>
                    <span className="font-['Orbitron'] text-white group-hover:text-yellow-400 transition-colors">
                      {game.name}
                    </span>
                    <span className="ml-auto text-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity">
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

  // Empty state when game is selected but no vehicles exist
  if (gameVehicles.length === 0) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold font-['Orbitron'] text-white uppercase tracking-wider">
              Sõidukid <span className="text-yellow-500">(0)</span>
            </h2>
            <p className="text-gray-400 mt-1">
              Valitud mäng: <span className="text-yellow-400 font-medium">{selectedGame?.name}</span>
            </p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-6 py-3 bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white font-['Orbitron'] font-medium rounded-xl transition-all duration-300 shadow-lg hover:shadow-[0_0_30px_rgba(250,204,21,0.5)] uppercase tracking-wider group"
          >
            <span className="flex items-center gap-2">
              <span className="text-xl">+</span>
              <span>Loo sõiduk</span>
            </span>
          </button>
        </div>

        {/* Empty State Content */}
        <div className="tech-border rounded-2xl bg-gray-900/30 backdrop-blur-xl p-12">
          <div className="text-center">
            <div className="w-24 h-24 bg-yellow-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-yellow-500/20">
              <span className="text-5xl text-yellow-400">🚗</span>
            </div>
            <h3 className="text-xl font-semibold font-['Orbitron'] text-white mb-2 uppercase">
              Sõidukeid ei leitud
            </h3>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              Lisa esimene sõiduk mängu andmebaasi
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-8 py-3 bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white font-['Orbitron'] font-medium rounded-xl transition-all duration-300 shadow-lg hover:shadow-[0_0_30px_rgba(250,204,21,0.5)] uppercase tracking-wider"
            >
              Loo esimene sõiduk
            </button>
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
            Sõidukid <span className="text-yellow-500">({gameVehicles.length})</span>
          </h2>
          <p className="text-gray-400 mt-1">
            Valitud mäng: <span className="text-yellow-400 font-medium">{selectedGame?.name}</span>
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-6 py-3 bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white font-['Orbitron'] font-medium rounded-xl transition-all duration-300 shadow-lg hover:shadow-[0_0_30px_rgba(250,204,21,0.5)] uppercase tracking-wider group"
        >
          <span className="flex items-center gap-2">
            <span className="text-xl">+</span>
            <span>Loo sõiduk</span>
          </span>
        </button>
      </div>

      {/* Game Vehicles Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {gameVehicles.map((vehicle) => (
          <div 
            key={vehicle.id} 
            className="relative tech-border rounded-2xl p-6 transition-all duration-300 bg-gray-900/30 border-gray-700/50 hover:bg-gray-900/50 hover:border-yellow-500/50 hover:shadow-[0_0_20px_rgba(250,204,21,0.2)] group"
          >
            {/* Vehicle Icon & Header */}
            <div className="flex items-start gap-4 mb-6">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300 bg-gray-800/50 border border-gray-700/50 group-hover:border-yellow-500/50">
                <span className="text-2xl">🚗</span>
              </div>
              <div className="flex-1">
                <h3 className="font-bold font-['Orbitron'] text-white text-lg uppercase tracking-wide">
                  {vehicle.vehicle_name}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Loodud {new Date(vehicle.created_at).toLocaleDateString('et-EE')}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(vehicle)}
                className="flex-1 px-3 py-2 bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 hover:text-white border border-gray-700/50 hover:border-gray-600/50 rounded-lg text-sm font-['Orbitron'] font-medium transition-all duration-200 uppercase tracking-wider"
              >
                Muuda
              </button>
              <button
                onClick={() => handleDelete(vehicle)}
                disabled={deleteVehicleMutation.isPending}
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
        onClose={() => {
          setIsCreateModalOpen(false)
          setEditingVehicle(null)
          setFormData({ vehicle_name: '' })
        }}
        title={editingVehicle ? 'Muuda sõidukit' : 'Loo uus sõiduk'}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium font-['Orbitron'] text-gray-300 mb-3 uppercase tracking-wider">
              Sõiduki nimi *
            </label>
            <input
              type="text"
              value={formData.vehicle_name}
              onChange={(e) => setFormData({ ...formData, vehicle_name: e.target.value })}
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
              placeholder="Sisesta sõiduki nimi"
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setIsCreateModalOpen(false)
                setEditingVehicle(null)
                setFormData({ vehicle_name: '' })
              }}
              className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white font-['Orbitron'] rounded-xl font-medium transition-all duration-200 uppercase tracking-wider"
            >
              Tühista
            </button>
            <button
              type="submit"
              disabled={createVehicleMutation.isPending || updateVehicleMutation.isPending}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white font-['Orbitron'] rounded-xl font-medium transition-all duration-200 disabled:opacity-50 shadow-lg hover:shadow-[0_0_20px_rgba(250,204,21,0.3)] uppercase tracking-wider"
            >
              {createVehicleMutation.isPending || updateVehicleMutation.isPending 
                ? 'Salvestamine...' 
                : editingVehicle ? 'Uuenda' : 'Loo sõiduk'
              }
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}