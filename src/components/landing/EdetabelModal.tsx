// src/components/landing/EdetabelModal.tsx
'use client'

import { useState } from 'react'
import { useApprovedRallies } from '@/hooks/useApprovedRallies'
import { ApprovedRallyCard } from '@/components/edetabel/ApprovedRallyCard'
import { RallyResultsModal } from '@/components/edetabel/RallyResultsModal'
import type { ApprovedRally } from '@/hooks/useApprovedRallies'

interface EdetabelModalProps {
  isOpen: boolean
  onClose: () => void
}

export function EdetabelModal({ isOpen, onClose }: EdetabelModalProps) {
  const [selectedRallyId, setSelectedRallyId] = useState<string | null>(null)
  const [gameFilter, setGameFilter] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'participants'>('date')

  const { data: approvedRallies = [], isLoading } = useApprovedRallies()

  // Filter and sort rallies
  const filteredRallies = approvedRallies
    .filter(rally => {
      const matchesGame = !gameFilter || rally.game_name === gameFilter
      const matchesSearch = !searchTerm || 
        rally.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rally.game_name.toLowerCase().includes(searchTerm.toLowerCase())
      return matchesGame && matchesSearch
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.competition_date).getTime() - new Date(a.competition_date).getTime()
        case 'name':
          return a.name.localeCompare(b.name)
        case 'participants':
          return b.total_participants - a.total_participants
        default:
          return 0
      }
    })

  // Get unique games for filter
  const availableGames = Array.from(new Set(approvedRallies.map(r => r.game_name))).sort()
  const totalParticipants = approvedRallies.reduce((sum, rally) => sum + rally.total_participants, 0)
  const selectedRally = approvedRallies.find(r => r.id === selectedRallyId)

  if (!isOpen) return null

  return (
    <>
      {/* Main Edetabel Modal */}
      <div className="fixed inset-0 z-40 overflow-y-auto">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
          onClick={() => setSelectedRallyId(null) || onClose()}
        />
        
        {/* Modal */}
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative w-full max-w-7xl bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-slate-700 shadow-2xl max-h-[90vh] overflow-hidden">
            
            {/* Header */}
            <div className="sticky top-0 bg-slate-900/90 backdrop-blur-xl border-b border-slate-700 p-6 z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">🏆 Edetabel</h2>
                  <p className="text-slate-400">
                    Kinnitatud ralli tulemused • {approvedRallies.length} rallit • {totalParticipants} osalejat
                  </p>
                </div>
                
                <button
                  onClick={onClose}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <span className="text-2xl">×</span>
                </button>
              </div>

              {/* Filters */}
              <div className="mt-6 flex flex-col lg:flex-row lg:items-center gap-4">
                {/* Search */}
                <div className="flex-1">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-slate-400">🔍</span>
                    </div>
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Otsi ralli või mängu nime järgi..."
                      className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Game Filter */}
                <select
                  value={gameFilter}
                  onChange={(e) => setGameFilter(e.target.value)}
                  className="px-4 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white focus:border-blue-500"
                >
                  <option value="">Kõik mängud</option>
                  {availableGames.map((game) => (
                    <option key={game} value={game}>{game}</option>
                  ))}
                </select>

                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-4 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white focus:border-blue-500"
                >
                  <option value="date">Kuupäev</option>
                  <option value="name">Nimi</option>
                  <option value="participants">Osalejaid</option>
                </select>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="inline-block w-8 h-8 border-4 border-slate-600 border-t-blue-500 rounded-full animate-spin mb-4"></div>
                  <p className="text-slate-400">Laen edetabelit...</p>
                </div>
              ) : filteredRallies.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-24 h-24 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-4xl text-slate-500">🏆</span>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">
                    {approvedRallies.length === 0 ? 'Tulemusi pole veel kinnitatud' : 'Tulemused ei vasta filtritele'}
                  </h3>
                  <p className="text-slate-400 max-w-md mx-auto">
                    {approvedRallies.length === 0 
                      ? 'Kui rallidel on tulemused sisestatud ja kinnitatud, ilmuvad need siia.'
                      : 'Proovi muuta otsingukriteeriume või filtreid.'
                    }
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredRallies.map((rally) => (
                    <ApprovedRallyCard
                      key={rally.id}
                      rally={rally}
                      onClick={() => setSelectedRallyId(rally.id)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-slate-900/90 backdrop-blur-xl border-t border-slate-700 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">
                  Näidatakse {filteredRallies.length} tulemust
                </span>
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
                >
                  Sulge
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rally Results Modal (on top) */}
      {selectedRally && (
        <RallyResultsModal
          rally={selectedRally}
          isOpen={!!selectedRallyId}
          onClose={() => setSelectedRallyId(null)}
        />
      )}
    </>
  )
}