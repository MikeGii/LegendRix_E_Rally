'use client'

import { useState } from 'react'
import { useApprovedRallies } from '@/hooks/useApprovedRallies'
import { usePublicChampionships, PublicChampionship } from '@/hooks/usePublicChampionships'
import { ApprovedRallyCard } from '@/components/edetabel/ApprovedRallyCard'
import { RallyResultsModal } from '@/components/edetabel/RallyResultsModal'
import { ChampionshipResultsModal } from '@/components/edetabel/ChampionshipResultsModal'
import type { ApprovedRally } from '@/hooks/useApprovedRallies'

interface EdetabelModalProps {
  isOpen: boolean
  onClose: () => void
}

export function EdetabelModal({ isOpen, onClose }: EdetabelModalProps) {
  // Rally states
  const [selectedRallyId, setSelectedRallyId] = useState<string | null>(null)
  const [gameFilter, setGameFilter] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'participants'>('date')

  // Championship states
  const [viewType, setViewType] = useState<'rallies' | 'championships'>('rallies')
  const [isChampionshipModalOpen, setIsChampionshipModalOpen] = useState(false)
  const [selectedChampionship, setSelectedChampionship] = useState<PublicChampionship | null>(null)

  // Data hooks
  const { data: approvedRallies = [], isLoading } = useApprovedRallies()
  const { data: publicChampionships = [], isLoading: isLoadingChampionships } = usePublicChampionships()

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

  // Handle close function properly
  const handleClose = () => {
    setSelectedRallyId(null)
    setSelectedChampionship(null)
    setIsChampionshipModalOpen(false)
    onClose()
  }

  const handleBackdropClick = () => {
    if (selectedRallyId) {
      setSelectedRallyId(null)
    } else if (isChampionshipModalOpen) {
      setIsChampionshipModalOpen(false)
      setSelectedChampionship(null)
    } else {
      handleClose()
    }
  }

  // Championship click handler
  const handleChampionshipClick = (championship: PublicChampionship) => {
    setSelectedChampionship(championship)
    setIsChampionshipModalOpen(true)
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
                  <h2 className="text-2xl font-bold text-white mb-2">
                    🏆 Edetabel
                  </h2>
                  <p className="text-slate-400">
                    {viewType === 'rallies' 
                      ? 'Kinnitatud ralli tulemused'
                      : 'Meistrivõistluste tulemused'
                    }
                  </p>
                </div>
                
                <button
                  onClick={handleClose}
                  className="p-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* View Type Toggle */}
              <div className="flex items-center gap-4 mt-4">
                <div className="flex bg-slate-800/50 rounded-lg p-1">
                  <button
                    onClick={() => setViewType('rallies')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      viewType === 'rallies'
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    🏁 Rallid ({approvedRallies.length})
                  </button>
                  <button
                    onClick={() => setViewType('championships')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      viewType === 'championships'
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    🏆 Meistrivõistlused ({publicChampionships.length})
                  </button>
                </div>

                {/* Stats */}
                <div className="hidden md:flex items-center gap-4 text-sm text-slate-400">
                  {viewType === 'rallies' ? (
                    <>
                      <span>📊 {approvedRallies.length} ralli</span>
                      <span>👥 {totalParticipants} osalejat</span>
                    </>
                  ) : (
                    <>
                      <span>🏆 {publicChampionships.length} meistrivõistlust</span>
                      <span>📅 {new Date().getFullYear()} hooaeg</span>
                    </>
                  )}
                </div>
              </div>

              {/* Rally Filters - Only show for rallies view */}
              {viewType === 'rallies' && (
                <div className="flex flex-wrap gap-4 mt-4">
                  {/* Search */}
                  <div className="flex-1 min-w-64">
                    <input
                      type="text"
                      placeholder="Otsi rallisid..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>

                  {/* Game Filter */}
                  <select
                    value={gameFilter}
                    onChange={(e) => setGameFilter(e.target.value)}
                    className="px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  >
                    <option value="">Kõik mängud</option>
                    {availableGames.map(game => (
                      <option key={game} value={game}>{game}</option>
                    ))}
                  </select>

                  {/* Sort */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  >
                    <option value="date">Kuupäeva järgi</option>
                    <option value="name">Nime järgi</option>
                    <option value="participants">Osalejate järgi</option>
                  </select>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              
              {/* RALLIES VIEW */}
              {viewType === 'rallies' && (
                <div>
                  {isLoading ? (
                    <div className="space-y-4">
                      {[...Array(6)].map((_, i) => (
                        <div key={i} className="animate-pulse bg-slate-700/30 rounded-xl h-32"></div>
                      ))}
                    </div>
                  ) : filteredRallies.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4">🏁</div>
                      <p className="text-slate-400 text-lg">
                        {searchTerm || gameFilter ? 'Otsingule vastavaid rallisid ei leitud' : 'Kinnitatud tulemustega rallisid ei ole veel'}
                      </p>
                      {(searchTerm || gameFilter) && (
                        <button
                          onClick={() => {
                            setSearchTerm('')
                            setGameFilter('')
                          }}
                          className="mt-4 px-4 py-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 transition-colors"
                        >
                          Tühista filtrid
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="grid gap-6">
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
              )}

              {/* CHAMPIONSHIPS VIEW */}
              {viewType === 'championships' && (
                <div>
                  {isLoadingChampionships ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="animate-pulse bg-slate-700/30 rounded-lg h-24"></div>
                      ))}
                    </div>
                  ) : publicChampionships.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4">🏆</div>
                      <p className="text-slate-400 text-lg">Aktiivseid meistrivõistlusi ei leitud</p>
                      <p className="text-slate-500 text-sm mt-2">
                        Meistrivõistlused ilmuvad siia, kui admin need kinnitab
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {publicChampionships.map(championship => (
                        <div
                          key={championship.id}
                          onClick={() => handleChampionshipClick(championship)}
                          className="bg-slate-800/30 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6 hover:bg-slate-800/50 hover:border-slate-600/50 transition-all duration-200 cursor-pointer group"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
                                  {championship.name}
                                </h3>
                                <span className="px-2 py-1 bg-blue-600/20 text-blue-400 rounded text-xs font-medium">
                                  {championship.season_year}
                                </span>
                                {championship.is_active && (
                                  <span className="px-2 py-1 bg-green-600/20 text-green-400 rounded text-xs font-medium">
                                    Aktiivne
                                  </span>
                                )}
                              </div>
                              
                              <div className="flex items-center gap-4 text-sm text-slate-400">
                                {championship.game_name && (
                                  <span className="flex items-center gap-1">
                                    🎮 {championship.game_name}
                                  </span>
                                )}
                                {championship.game_type_name && (
                                  <span className="flex items-center gap-1">
                                    🏁 {championship.game_type_name}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-6 text-center">
                              <div>
                                <div className="text-2xl font-bold text-white">{championship.total_rallies}</div>
                                <div className="text-xs text-slate-400">Etappi</div>
                              </div>
                              <div>
                                <div className="text-2xl font-bold text-blue-400">{championship.total_participants}</div>
                                <div className="text-xs text-slate-400">Osalejaid</div>
                              </div>
                              <div className="text-slate-400 group-hover:text-blue-400 transition-colors">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Rally Results Modal */}
      {selectedRallyId && selectedRally && (
        <RallyResultsModal
          isOpen={!!selectedRallyId}
          onClose={() => setSelectedRallyId(null)}
          rally={selectedRally}
        />
      )}

      {/* Championship Results Modal */}
      {isChampionshipModalOpen && selectedChampionship && (
        <ChampionshipResultsModal
          isOpen={isChampionshipModalOpen}
          onClose={() => {
            setIsChampionshipModalOpen(false)
            setSelectedChampionship(null)
          }}
          championshipId={selectedChampionship.id}
          championshipName={selectedChampionship.name}
        />
      )}
    </>
  )
}