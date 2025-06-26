// src/components/teams/TeamEditModal.tsx
'use client'

import { useState, useEffect } from 'react'
import { Team, useUpdateTeam, useUserSearch } from '@/hooks/useTeams'
import { useVehiclesForGame } from '@/hooks/useGameVehicles'

interface TeamEditModalProps {
  team: Team
  onClose: () => void
}

export function TeamEditModal({ team, onClose }: TeamEditModalProps) {
  const [teamName, setTeamName] = useState(team.team_name)
  const [managerSearch, setManagerSearch] = useState(team.manager?.player_name || team.manager?.name || '')
  const [selectedManager, setSelectedManager] = useState<{id: string, name: string, player_name?: string} | null>(
    team.manager ? {
      id: team.manager.id,
      name: team.manager.name,
      player_name: team.manager.player_name
    } : null
  )
  const [maxMembers, setMaxMembers] = useState(team.max_members_count)
  const [selectedVehicleId, setSelectedVehicleId] = useState(team.vehicle_id || '')
  const [showDropdown, setShowDropdown] = useState(false)

  const { data: searchResults = [] } = useUserSearch(managerSearch)
  const { data: gameVehicles = [], isLoading: vehiclesLoading } = useVehiclesForGame(team.game_id)
  const updateTeamMutation = useUpdateTeam()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!teamName || !selectedManager) {
      alert('Palun täida kõik väljad')
      return
    }

    try {
      await updateTeamMutation.mutateAsync({
        id: team.id,
        team_name: teamName,
        manager_id: selectedManager.id,
        max_members_count: maxMembers,
        vehicle_id: selectedVehicleId || undefined
      })

      alert('Tiim edukalt uuendatud!')
      onClose()
    } catch (error) {
      alert('Viga tiimi uuendamisel')
    }
  }

  const selectManager = (user: any) => {
    setSelectedManager(user)
    setManagerSearch(user.player_name || user.name)
    setShowDropdown(false)
  }

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose])

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-2xl border border-slate-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-700">
          <h2 className="text-xl font-semibold text-white">Muuda tiimi</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Team Name */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Tiimi nimi
            </label>
            <input
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
              placeholder="Sisesta tiimi nimi"
              required
            />
          </div>

          {/* Game Info - Read Only */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Mäng
            </label>
            <div className="px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-slate-400">
              {team.game?.name || 'Määramata'}
            </div>
          </div>

          {/* Class Info - Read Only */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Klass
            </label>
            <div className="px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-slate-400">
              {team.game_class?.name || 'Määramata'}
            </div>
          </div>

          {/* Vehicle Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Sõiduk
            </label>
            <select
              value={selectedVehicleId}
              onChange={(e) => setSelectedVehicleId(e.target.value)}
              disabled={vehiclesLoading}
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">Sõiduk määramata</option>
              {gameVehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.vehicle_name}
                </option>
              ))}
            </select>
            {gameVehicles.length === 0 && !vehiclesLoading && (
              <p className="text-sm text-yellow-400 mt-1">
                Sellele mängule pole sõidukeid lisatud
              </p>
            )}
          </div>

          {/* Team Manager Search */}
          <div className="relative">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Tiimi pealik
            </label>
            <input
              type="text"
              value={managerSearch}
              onChange={(e) => {
                setManagerSearch(e.target.value)
                setShowDropdown(true)
              }}
              onFocus={() => setShowDropdown(true)}
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
              placeholder="Otsi kasutajat"
            />

            {/* Search Results Dropdown */}
            {showDropdown && searchResults.length > 0 && (
              <div className="absolute z-10 w-full mt-2 bg-slate-800 border border-slate-600 rounded-xl shadow-xl max-h-48 overflow-y-auto">
                {searchResults.map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => selectManager(user)}
                    className="w-full px-4 py-3 text-left hover:bg-slate-700 transition-colors first:rounded-t-xl last:rounded-b-xl"
                  >
                    <div className="text-white font-medium">
                      {user.name}
                      {user.player_name && (
                        <span className="text-slate-400 ml-2">({user.player_name})</span>
                      )}
                    </div>
                    <div className="text-sm text-slate-400">{user.email}</div>
                  </button>
                ))}
              </div>
            )}

            {/* Selected Manager Display */}
            {selectedManager && (
              <div className="mt-2 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <p className="text-sm text-blue-400">Valitud pealik:</p>
                <p className="text-white font-medium">
                  {selectedManager.name}
                  {selectedManager.player_name && ` (${selectedManager.player_name})`}
                </p>
              </div>
            )}
          </div>

          {/* Max Members */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Maksimaalne liikmete arv
            </label>
            <input
              type="number"
              min="2"
              max="10"
              value={maxMembers}
              onChange={(e) => setMaxMembers(parseInt(e.target.value))}
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
              required
            />
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium transition-all duration-200"
            >
              Tühista
            </button>
            <button
              type="submit"
              disabled={updateTeamMutation.isPending}
              className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800/50 text-white rounded-xl font-medium transition-all duration-200 shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updateTeamMutation.isPending ? 'Uuendan...' : 'Salvesta muudatused'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}