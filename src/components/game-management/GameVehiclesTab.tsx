// src/components/game-management/GameVehiclesTab.tsx
'use client'

import { useState } from 'react'
import { Game } from '@/types'
import { GameVehicle, useCreateVehicle, useUpdateVehicle, useDeleteVehicle } from '@/hooks/useGameVehicles'
import { FormModal } from '@/components/ui/Modal'

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
      <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">🚗</span>
          </div>
          <h3 className="text-xl font-semibold text-white mb-3">Mäng pole valitud</h3>
          <p className="text-slate-400 mb-6">
            Vali mäng "Games" vahelehelt, et hallata sõidukeid.
          </p>
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-slate-300">Vali mäng:</h4>
            <select
              value={selectedGameId}
              onChange={(e) => onGameChange(e.target.value)}
              className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Vali mäng...</option>
              {games.map((game) => (
                <option key={game.id} value={game.id}>
                  {game.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    )
  }

  // Show empty state
  if (gameVehicles.length === 0) {
    return (
      <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">🚗</span>
          </div>
          <h3 className="text-xl font-semibold text-white mb-3">Sõidukeid pole</h3>
          <p className="text-slate-400 mb-6">
            Lisa sõidukeid mängule "{selectedGame?.name}".
          </p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200"
          >
            Lisa esimene sõiduk
          </button>
        </div>

        {/* Create/Edit Modal */}
        <FormModal
          isOpen={isCreateModalOpen}
          onClose={handleCloseModal}
          title={editingVehicle ? 'Muuda sõidukit' : 'Lisa uus sõiduk'}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Sõiduki nimi *
              </label>
              <input
                type="text"
                value={formData.vehicle_name}
                onChange={(e) => setFormData({ ...formData, vehicle_name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Sisesta sõiduki nimi"
                required
                autoFocus
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={handleCloseModal}
                className="flex-1 px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg font-medium transition-all duration-200"
              >
                Tühista
              </button>
              <button
                type="submit"
                disabled={createVehicleMutation.isPending || updateVehicleMutation.isPending}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-50"
              >
                {createVehicleMutation.isPending || updateVehicleMutation.isPending 
                  ? 'Salvestamine...' 
                  : editingVehicle ? 'Uuenda' : 'Lisa sõiduk'
                }
              </button>
            </div>
          </form>
        </FormModal>
      </div>
    )
  }

  // Vehicle list view
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">
            Sõidukid ({gameVehicles.length})
          </h2>
          <p className="text-slate-400">
            Halda sõidukeid mängu "{selectedGame?.name}" jaoks
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200"
        >
          + Lisa sõiduk
        </button>
      </div>

      {/* Vehicles Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {gameVehicles.map((vehicle) => (
          <div
            key={vehicle.id}
            className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6 hover:bg-slate-800/70 transition-all duration-200"
          >
            {/* Vehicle Info */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <span className="text-blue-400 text-lg">🚗</span>
                </div>
                <div>
                  <h3 className="font-semibold text-white">{vehicle.vehicle_name}</h3>
                  <p className="text-sm text-slate-400">
                    {selectedGame?.name}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleEdit(vehicle)}
                className="flex-1 px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg text-sm font-medium transition-all duration-200"
              >
                ✏️ Muuda
              </button>
              <button
                onClick={() => handleDelete(vehicle)}
                disabled={deletingVehicleId === vehicle.id}
                className="flex-1 px-3 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-50"
              >
                {deletingVehicleId === vehicle.id ? '🗑️ Kustutamine...' : '🗑️ Kustuta'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create/Edit Modal */}
      <FormModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseModal}
        title={editingVehicle ? 'Muuda sõidukit' : 'Lisa uus sõiduk'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Sõiduki nimi *
            </label>
            <input
              type="text"
              value={formData.vehicle_name}
              onChange={(e) => setFormData({ ...formData, vehicle_name: e.target.value })}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Sisesta sõiduki nimi"
              required
              autoFocus
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={handleCloseModal}
              className="flex-1 px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg font-medium transition-all duration-200"
            >
              Tühista
            </button>
            <button
              type="submit"
              disabled={createVehicleMutation.isPending || updateVehicleMutation.isPending}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-50"
            >
              {createVehicleMutation.isPending || updateVehicleMutation.isPending 
                ? 'Salvestamine...' 
                : editingVehicle ? 'Uuenda' : 'Lisa sõiduk'
              }
            </button>
          </div>
        </form>
      </FormModal>
    </div>
  )
}