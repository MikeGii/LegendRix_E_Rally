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

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-md z-50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
        <div 
          className="relative bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-purple-500/30 shadow-[0_0_40px_rgba(139,0,255,0.3)] max-w-2xl w-full overflow-hidden"
          style={{ maxHeight: '80vh', height: 'auto' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Animated background pattern */}
          <div className="absolute inset-0 grid-pattern opacity-[0.02] pointer-events-none"></div>
          
          {/* Gradient orbs for ambience */}
          <div className="absolute top-0 left-0 w-48 h-48 gradient-orb gradient-orb-purple opacity-10"></div>
          <div className="absolute bottom-0 right-0 w-48 h-48 gradient-orb gradient-orb-red opacity-10"></div>

          {/* Header */}
          <div className="relative p-6 border-b border-purple-500/20 bg-black/50">
            <h2 className="text-2xl font-black text-white pr-12 font-['Orbitron'] uppercase tracking-wider">
              <span className="text-purple-500">◈</span> Muuda tiimi
            </h2>
            
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2 tech-border rounded-lg transition-all duration-200 hover:shadow-[0_0_15px_rgba(139,0,255,0.5)]"
              aria-label="Sulge"
            >
              <svg className="w-6 h-6 text-purple-400 hover:text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <form 
            onSubmit={handleSubmit} 
            className="relative z-10 p-6 overflow-y-auto custom-modal-scrollbar"
            style={{ 
              maxHeight: 'calc(80vh - 144px)',
              minHeight: '200px',
              overflowY: 'auto'
            }}
          >
            <div className="space-y-6">
              {/* Team Name */}
              <div>
                <label className="flex items-center gap-2 text-xs font-bold text-gray-400 mb-2 font-['Orbitron'] uppercase tracking-wider">
                  <span className="text-red-500">⬢</span> Tiimi nimi
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

              {/* Game Info - Read Only */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="flex items-center gap-2 text-xs font-bold text-gray-400 mb-2 font-['Orbitron'] uppercase tracking-wider">
                    <span className="text-purple-500">◈</span> Mäng
                  </label>
                  <div className="px-4 py-3 bg-gray-900/50 border border-gray-700/50 rounded-xl text-gray-400">
                    {team.game?.name || 'Määramata'}
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-xs font-bold text-gray-400 mb-2 font-['Orbitron'] uppercase tracking-wider">
                    <span className="text-orange-500">◆</span> Klass
                  </label>
                  <div className="px-4 py-3 bg-gray-900/50 border border-gray-700/50 rounded-xl text-gray-400">
                    {team.game_class?.name || 'Määramata'}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Vehicle Selection */}
                <div>
                  <label className="flex items-center gap-2 text-xs font-bold text-gray-400 mb-2 font-['Orbitron'] uppercase tracking-wider">
                    <span className="text-red-500">⬢</span> Sõiduk
                  </label>
                  <select
                    value={selectedVehicleId}
                    onChange={(e) => setSelectedVehicleId(e.target.value)}
                    disabled={vehiclesLoading}
                    className="w-full px-4 py-3 bg-black/50 border border-orange-500/30 rounded-xl text-white focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium appearance-none cursor-pointer"
                  >
                    <option value="" className="bg-gray-900">Sõiduk määramata</option>
                    {gameVehicles.map((vehicle) => (
                      <option key={vehicle.id} value={vehicle.id} className="bg-gray-900">
                        {vehicle.vehicle_name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Max Members */}
                <div>
                  <label className="flex items-center gap-2 text-xs font-bold text-gray-400 mb-2 font-['Orbitron'] uppercase tracking-wider">
                    <span className="text-orange-500">◉</span> Max liikmete arv
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
                  {team.members_count > maxMembers && (
                    <p className="text-xs text-red-400 mt-2 font-['Orbitron'] uppercase tracking-wider">
                      ⚠ Praegu on tiimis {team.members_count} liiget!
                    </p>
                  )}
                </div>
              </div>

              {/* Team Manager Search */}
              <div className="relative">
                <label className="flex items-center gap-2 text-xs font-bold text-gray-400 mb-2 font-['Orbitron'] uppercase tracking-wider">
                  <span className="text-purple-500">◉</span> Tiimi pealik
                </label>
                <input
                  type="text"
                  value={managerSearch}
                  onChange={(e) => {
                    setManagerSearch(e.target.value)
                    setShowDropdown(true)
                  }}
                  onFocus={() => setShowDropdown(true)}
                  className="w-full px-4 py-3 bg-black/50 border border-purple-500/30 rounded-xl text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all duration-200 font-medium"
                  placeholder="Otsi kasutajat nime või mängijanime järgi"
                  required
                />
                
                {/* Search Results Dropdown */}
                {showDropdown && searchResults.length > 0 && (
                  <div className="absolute z-10 w-full mt-2 bg-gray-900 border border-purple-500/30 rounded-xl shadow-[0_0_30px_rgba(139,0,255,0.3)] max-h-48 overflow-y-auto">
                    {searchResults.map((user, index) => (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => selectManager(user)}
                        className="w-full px-4 py-3 text-left hover:bg-purple-500/10 transition-all duration-200 first:rounded-t-xl last:rounded-b-xl border-b border-gray-800 last:border-0 group"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-white font-medium group-hover:text-purple-400 transition-colors">
                              {user.name}
                              {user.player_name && (
                                <span className="text-gray-500 ml-2">({user.player_name})</span>
                              )}
                            </div>
                            <div className="text-xs text-gray-500 font-['Orbitron']">{user.email}</div>
                          </div>
                          <div className="text-purple-500/40 group-hover:text-purple-500 transition-colors">
                            <span className="font-['Orbitron']">#{index + 1}</span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                
                {/* Selected Manager Display */}
                {selectedManager && (
                  <div className="mt-3 p-4 bg-gradient-to-r from-purple-900/20 to-black/20 border border-purple-500/30 rounded-xl">
                    <p className="text-xs text-purple-400 font-['Orbitron'] uppercase tracking-wider mb-1">Valitud pealik:</p>
                    <p className="text-white font-bold text-lg">
                      {selectedManager.name}
                      {selectedManager.player_name && (
                        <span className="text-purple-400 ml-2 font-normal">({selectedManager.player_name})</span>
                      )}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </form>

          {/* Footer */}
          <div className="relative p-6 border-t border-purple-500/20 bg-black/50">
            <div className="flex items-center justify-end space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 tech-border rounded-xl font-['Orbitron'] uppercase tracking-wider text-sm text-gray-300 hover:text-white transition-all duration-200 hover:shadow-[0_0_15px_rgba(139,0,255,0.3)]"
              >
                Tühista
              </button>
              <button
                type="submit"
                form="team-edit-form"
                onClick={handleSubmit}
                disabled={updateTeamMutation.isPending}
                className="px-6 py-3 futuristic-btn futuristic-btn-secondary rounded-xl font-['Orbitron'] uppercase tracking-wider text-sm font-bold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updateTeamMutation.isPending ? (
                  <span className="flex items-center justify-center gap-3">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Uuendan...
                  </span>
                ) : (
                  '◈ Salvesta muudatused'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}