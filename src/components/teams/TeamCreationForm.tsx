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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Team Name */}
        <div>
          <label className="block text-xs font-bold text-gray-400 mb-2 font-['Orbitron'] uppercase tracking-wider">
            Tiimi nimi
          </label>
          <input
            type="text"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            className="w-full px-4 py-3 bg-black/50 border border-red-500/30 rounded-xl text-white placeholder-gray-500 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all duration-200 font-medium"
            placeholder="Sisesta tiimi nimi"
            required
          />
        </div>

        {/* Max Members */}
        <div>
          <label className="block text-xs font-bold text-gray-400 mb-2 font-['Orbitron'] uppercase tracking-wider">
            Maksimaalne liikmete arv
          </label>
          <div className="relative">
            <input
              type="number"
              min="2"
              max="10"
              value={maxMembers}
              onChange={(e) => setMaxMembers(parseInt(e.target.value))}
              className="w-full px-4 py-3 bg-black/50 border border-orange-500/30 rounded-xl text-white placeholder-gray-500 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all duration-200 font-['Orbitron'] font-bold text-center"
              required
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-orange-500/60 pointer-events-none">
              <span className="text-sm font-['Orbitron']">MAX</span>
            </div>
          </div>
        </div>
      </div>

      {/* Game Selection */}
      <div>
        <label className="flex items-center gap-2 text-xs font-bold text-gray-400 mb-2 font-['Orbitron'] uppercase tracking-wider">
          <span className="text-purple-500">◈</span> Mäng
        </label>
        <select
          value={selectedGameId}
          onChange={(e) => handleGameChange(e.target.value)}
          className="w-full px-4 py-3 bg-black/50 border border-purple-500/30 rounded-xl text-white focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all duration-200 font-medium appearance-none cursor-pointer"
          required
        >
          <option value="" className="bg-gray-900">Vali mäng</option>
          {games.map((game) => (
            <option key={game.id} value={game.id} className="bg-gray-900">
              {game.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Game Class Selection */}
        <div>
          <label className="flex items-center gap-2 text-xs font-bold text-gray-400 mb-2 font-['Orbitron'] uppercase tracking-wider">
            <span className="text-orange-500">◆</span> Mängu klass
          </label>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            disabled={!selectedGameId || classesLoading}
            className="w-full px-4 py-3 bg-black/50 border border-orange-500/30 rounded-xl text-white focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium appearance-none cursor-pointer"
            required
          >
            <option value="" className="bg-gray-900">
              {!selectedGameId ? 'Vali esmalt mäng' : classesLoading ? 'Laadin...' : 'Vali klass'}
            </option>
            {gameClasses.map((gameClass) => (
              <option key={gameClass.id} value={gameClass.id} className="bg-gray-900">
                {gameClass.name}
              </option>
            ))}
          </select>
        </div>

        {/* Vehicle Selection */}
        <div>
          <label className="flex items-center gap-2 text-xs font-bold text-gray-400 mb-2 font-['Orbitron'] uppercase tracking-wider">
            <span className="text-red-500">⬢</span> Sõiduk <span className="text-gray-600 font-normal">(valikuline)</span>
          </label>
          <select
            value={selectedVehicleId}
            onChange={(e) => setSelectedVehicleId(e.target.value)}
            disabled={!selectedGameId || vehiclesLoading}
            className="w-full px-4 py-3 bg-black/50 border border-gray-700/50 rounded-xl text-white focus:border-red-500/50 focus:outline-none focus:ring-2 focus:ring-red-500/10 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium appearance-none cursor-pointer"
          >
            <option value="" className="bg-gray-900">
              {!selectedGameId ? 'Vali esmalt mäng' : vehiclesLoading ? 'Laadin...' : 'Sõiduk määramata'}
            </option>
            {gameVehicles.map((vehicle) => (
              <option key={vehicle.id} value={vehicle.id} className="bg-gray-900">
                {vehicle.vehicle_name}
              </option>
            ))}
          </select>
          {selectedGameId && gameVehicles.length === 0 && !vehiclesLoading && (
            <p className="text-xs text-orange-400 mt-2 font-['Orbitron'] uppercase tracking-wider">
              ⚠ Sellele mängule pole sõidukeid lisatud
            </p>
          )}
        </div>
      </div>

      {/* Team Manager Search */}
      <div className="relative">
        <label className="flex items-center gap-2 text-xs font-bold text-gray-400 mb-2 font-['Orbitron'] uppercase tracking-wider">
          <span className="text-red-500">◉</span> Tiimi pealik
        </label>
        <input
          type="text"
          value={managerSearch}
          onChange={(e) => {
            setManagerSearch(e.target.value)
            setShowDropdown(true)
          }}
          onFocus={() => setShowDropdown(true)}
          className="w-full px-4 py-3 bg-black/50 border border-red-500/30 rounded-xl text-white placeholder-gray-500 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all duration-200 font-medium"
          placeholder="Otsi kasutajat nime või mängijanime järgi"
          required
        />
        
        {/* Search Results Dropdown */}
        {showDropdown && searchResults.length > 0 && (
          <div className="absolute z-10 w-full mt-2 bg-gray-900 border border-red-500/30 rounded-xl shadow-[0_0_30px_rgba(255,0,64,0.3)] max-h-48 overflow-y-auto">
            {searchResults.map((user, index) => (
              <button
                key={user.id}
                type="button"
                onClick={() => selectManager(user)}
                className="w-full px-4 py-3 text-left hover:bg-red-500/10 transition-all duration-200 first:rounded-t-xl last:rounded-b-xl border-b border-gray-800 last:border-0 group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white font-medium group-hover:text-red-400 transition-colors">
                      {user.name}
                      {user.player_name && (
                        <span className="text-gray-500 ml-2">({user.player_name})</span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 font-['Orbitron']">{user.email}</div>
                  </div>
                  <div className="text-red-500/40 group-hover:text-red-500 transition-colors">
                    <span className="font-['Orbitron']">#{index + 1}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
        
        {/* Selected Manager Display */}
        {selectedManager && (
          <div className="mt-3 p-4 bg-gradient-to-r from-red-900/20 to-black/20 border border-red-500/30 rounded-xl">
            <p className="text-xs text-red-400 font-['Orbitron'] uppercase tracking-wider mb-1">Valitud pealik:</p>
            <p className="text-white font-bold text-lg">
              {selectedManager.name}
              {selectedManager.player_name && (
                <span className="text-red-400 ml-2 font-normal">({selectedManager.player_name})</span>
              )}
            </p>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <div className="pt-4">
        <button
          type="submit"
          disabled={createTeamMutation.isPending}
          className="w-full px-6 py-4 futuristic-btn futuristic-btn-primary rounded-xl font-['Orbitron'] uppercase tracking-wider font-bold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
        >
          {createTeamMutation.isPending ? (
            <span className="flex items-center justify-center gap-3">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Loon tiimi...
            </span>
          ) : (
            '▣ Loo tiim'
          )}
        </button>
      </div>
    </form>
  )
}