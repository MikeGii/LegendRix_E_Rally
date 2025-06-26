// src/components/teams/TeamCreationForm.tsx
'use client'

import { useState } from 'react'
import { useCreateTeam, useUserSearch } from '@/hooks/useTeams'
import { useGames, useGameClasses } from '@/hooks/useGames'

export function TeamCreationForm() {
  const [teamName, setTeamName] = useState('')
  const [managerSearch, setManagerSearch] = useState('')
  const [selectedManager, setSelectedManager] = useState<{id: string, name: string, player_name?: string} | null>(null)
  const [maxMembers, setMaxMembers] = useState(5)
  const [selectedGameId, setSelectedGameId] = useState('')
  const [selectedClassId, setSelectedClassId] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)

  const { data: searchResults = [] } = useUserSearch(managerSearch)
  const { data: games = [], isLoading: gamesLoading } = useGames()
  const { data: gameClasses = [], isLoading: classesLoading } = useGameClasses(selectedGameId)
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
        class_id: selectedClassId
      })

      // Reset form
      setTeamName('')
      setManagerSearch('')
      setSelectedManager(null)
      setMaxMembers(5)
      setSelectedGameId('')
      setSelectedClassId('')
      
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
            {!selectedGameId ? 'Vali esmalt mäng' : 'Vali klass'}
          </option>
          {gameClasses.map((gameClass) => (
            <option key={gameClass.id} value={gameClass.id}>
              {gameClass.name}
            </option>
          ))}
        </select>
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
            setSelectedManager(null)
            setShowDropdown(true)
          }}
          onFocus={() => setShowDropdown(true)}
          className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
          placeholder="Sisesta vähemalt 3 tähte otsinguks"
        />
        
        {/* Search Results Dropdown */}
        {showDropdown && managerSearch.length >= 3 && searchResults.length > 0 && (
          <div className="absolute z-10 w-full mt-2 bg-slate-800 border border-slate-700 rounded-xl shadow-xl max-h-60 overflow-y-auto">
            {searchResults.map((user) => (
              <button
                key={user.id}
                type="button"
                onClick={() => selectManager(user)}
                className="w-full px-4 py-3 text-left hover:bg-slate-700/50 transition-colors duration-200 flex items-center justify-between group"
              >
                <div>
                  <p className="text-white font-medium">{user.name}</p>
                  {user.player_name && (
                    <p className="text-slate-400 text-sm">🎮 {user.player_name}</p>
                  )}
                </div>
                <span className="text-slate-500 group-hover:text-slate-300">→</span>
              </button>
            ))}
          </div>
        )}

        {/* Selected Manager Display */}
        {selectedManager && (
          <div className="mt-2 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
            <p className="text-green-400 text-sm">
              ✅ Valitud: {selectedManager.name}
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