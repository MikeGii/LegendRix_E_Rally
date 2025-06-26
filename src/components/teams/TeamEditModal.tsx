// src/components/teams/TeamEditModal.tsx
'use client'

import { useState, useEffect } from 'react'
import { Team, useUpdateTeam, useUserSearch } from '@/hooks/useTeams'

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
  const [showDropdown, setShowDropdown] = useState(false)

  const { data: searchResults = [] } = useUserSearch(managerSearch)
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
        max_members_count: maxMembers
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
                if (e.target.value !== (team.manager?.player_name || team.manager?.name)) {
                  setSelectedManager(null)
                }
              }}
              onFocus={() => setShowDropdown(true)}
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
              placeholder="Sisesta vähemalt 3 tähte otsinguks"
            />
            
            {/* Search Results Dropdown */}
            {showDropdown && managerSearch.length >= 3 && searchResults.length > 0 && !selectedManager && (
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
              min={Math.max(2, team.members_count)}
              max="10"
              value={maxMembers}
              onChange={(e) => setMaxMembers(parseInt(e.target.value))}
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
              required
            />
            {team.members_count > 2 && (
              <p className="mt-1 text-xs text-slate-400">
                Miinimum: {team.members_count} (praegune liikmete arv)
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium transition-all duration-200"
            >
              Tühista
            </button>
            <button
              type="submit"
              disabled={updateTeamMutation.isPending}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800/50 text-white rounded-xl font-medium transition-all duration-200 shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updateTeamMutation.isPending ? 'Uuendan...' : 'Salvesta muudatused'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}