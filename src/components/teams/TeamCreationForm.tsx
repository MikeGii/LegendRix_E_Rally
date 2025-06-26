// src/components/teams/TeamCreationForm.tsx
'use client'

import { useState } from 'react'
import { useCreateTeam, useUserSearch } from '@/hooks/useTeams'
import { useGames, useGameClasses } from '@/hooks/useGames'
import { useVehiclesForGame } from '@/hooks/useGameVehicles'

export function TeamCreationForm() {
  const [teamName, setTeamName] = useState('')
  const [managerSearch, setManagerSearch] = useState('')
  const [selectedManager, setSelectedManager] = useState<{id: string, name: string, player_name?: string} | null>(null)
  const [maxMembers, setMaxMembers] = useState(5)
  const [selectedGameId, setSelectedGameId] = useState('')
  const [selectedClassId, setSelectedClassId] = useState('')
  const [selectedVehicleId, setSelectedVehicleId] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)

  const { data: searchResults = [] } = useUserSearch(managerSearch)
  const { data: games = [], isLoading: gamesLoading } = useGames()
  const { data: gameClasses = [], isLoading: classesLoading } = useGameClasses(selectedGameId)
  const { data: gameVehicles = [], isLoading: vehiclesLoading } = useVehiclesForGame(selectedGameId)
  const createTeamMutation = useCreateTeam()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!teamName || !selectedManager || !selectedGameId || !selectedClassId) {
      alert('Palun täida kõik väljad')
      return
    }

    try {
      await createTeamMutation.mutateAsync({
        team_name: teamName,
        manager_id: selectedManager.id,
        max_members_count: maxMembers,
        game_id: selectedGameId,
        class_id: selectedClassId,
        vehicle_id: selectedVehicleId || undefined
      })

      // Reset form
      setTeamName('')
      setManagerSearch('')
      setSelectedManager(null)
      setMaxMembers(5)
      setSelectedGameId('')
      setSelectedClassId('')
      setSelectedVehicleId('')
      
      alert('Tiim edukalt loodud!')
    } catch (error) {
      alert('Viga tiimi loomisel')
    }
  }

  const selectManager = (user: any) => {
    setSelectedManager(user)
    setManagerSearch(user.player_name || user.name)
    setShowDropdown(false)
  }

  const handleGameChange = (gameId: string) => {
    setSelectedGameId(gameId)
    setSelectedClassId('') // Reset class when game changes
    setSelectedVehicleId('') // Reset vehicle when game changes
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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

      {/* Game Selection */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Mäng
        </label>
        <select
          value={selectedGameId}
          onChange={(e) => handleGameChange(e.target.value)}
          className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
          required
        >
          <option value="">Vali mäng</option>
          {games.map((game) => (
            <option key={game.id} value={game.id}>
              {game.name}
            </option>
          ))}
        </select>
      </div>

      {/* Game Class Selection */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Mängu klass
        </label>
        <select
          value={selectedClassId}
          onChange={(e) => setSelectedClassId(e.target.value)}
          disabled={!selectedGameId || classesLoading}
          className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          required
        >
          <option value="">
            {!selectedGameId ? 'Vali esmalt mäng' : classesLoading ? 'Laadin...' : 'Vali klass'}
          </option>
          {gameClasses.map((gameClass) => (
            <option key={gameClass.id} value={gameClass.id}>
              {gameClass.name}
            </option>
          ))}
        </select>
      </div>

      {/* Vehicle Selection */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Sõiduk <span className="text-slate-500">(valikuline)</span>
        </label>
        <select
          value={selectedVehicleId}
          onChange={(e) => setSelectedVehicleId(e.target.value)}
          disabled={!selectedGameId || vehiclesLoading}
          className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="">
            {!selectedGameId ? 'Vali esmalt mäng' : vehiclesLoading ? 'Laadin...' : 'Sõiduk määramata'}
          </option>
          {gameVehicles.map((vehicle) => (
            <option key={vehicle.id} value={vehicle.id}>
              {vehicle.vehicle_name}
            </option>
          ))}
        </select>
        {selectedGameId && gameVehicles.length === 0 && !vehiclesLoading && (
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
          placeholder="Otsi kasutajat nime või mängijanime järgi"
          required
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

      {/* Submit Button */}
      <button
        type="submit"
        disabled={createTeamMutation.isPending}
        className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800/50 text-white rounded-xl font-medium transition-all duration-200 shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {createTeamMutation.isPending ? 'Loon tiimi...' : 'Loo tiim'}
      </button>
    </form>
  )
}