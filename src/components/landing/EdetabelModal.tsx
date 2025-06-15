// src/components/landing/EdetabelModal.tsx - FIXED VERSION
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

  // FIXED: Handle close function properly
  const handleClose = () => {
    setSelectedRallyId(null)
    onClose()
  }

  const handleBackdropClick = () => {
    if (selectedRallyId) {
      setSelectedRallyId(null)
    } else {
      handleClose()
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Main Edetabel Modal */}
      <div className="fixed inset-0 z-40 overflow-y-auto">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
          onClick={handleBackdropClick}
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
                  onClick={handleClose}
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
                      placeholder="Otsi rallisid..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-slate-600 rounded-lg bg-slate-800/50 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Game Filter */}
                <div className="lg:w-48">
                  <select
                    value={gameFilter}
                    onChange={(e) => setGameFilter(e.target.value)}
                    className="block w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800/50 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Kõik mängud</option>
                    {availableGames.map(game => (
                      <option key={game} value={game}>{game}</option>
                    ))}
                  </select>
                </div>

                {/* Sort */}
                <div className="lg:w-48">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'date' | 'name' | 'participants')}
                    className="block w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800/50 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="date">Kuupäev</option>
                    <option value="name">Nimi</option>
                    <option value="participants">Osalejate arv</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="bg-slate-800/30 rounded-xl p-6 animate-pulse">
                      <div className="h-6 bg-slate-700 rounded w-1/3 mb-4"></div>
                      <div className="h-4 bg-slate-700 rounded w-1/2 mb-2"></div>
                      <div className="h-4 bg-slate-700 rounded w-1/4"></div>
                    </div>
                  ))}
                </div>
              ) : filteredRallies.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-6xl mb-4">🏆</div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {approvedRallies.length === 0 ? 'Pole veel kinnitatud rallisid' : 'Rallisid ei leitud'}
                  </h3>
                  <p className="text-slate-400">
                    {approvedRallies.length === 0 
                      ? 'Kinnitatud ralliid ilmuvad siia, kui tulemused on heaks kiidetud.'
                      : 'Proovi muuta filtrit või otsingusõna.'
                    }
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {filteredRallies.map(rally => (
                    <ApprovedRallyCard
                      key={rally.id}
                      rally={rally}
                      onClick={() => setSelectedRallyId(rally.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Rally Results Modal */}
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