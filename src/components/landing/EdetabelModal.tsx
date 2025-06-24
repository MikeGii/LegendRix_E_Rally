'use client'

import { useState } from 'react'
import { useApprovedRallies } from '@/hooks/useApprovedRallies'
import { usePublicChampionships, PublicChampionship } from '@/hooks/usePublicChampionships'
import { RallyResultsModal } from '@/components/edetabel/RallyResultsModal'
import { ChampionshipResultsModal } from '@/components/edetabel/ChampionshipResultsModal'
import type { ApprovedRally } from '@/hooks/useApprovedRallies'

interface EdetabelModalProps {
  isOpen: boolean
  onClose: () => void
  onChampionshipModalToggle?: (isOpen: boolean) => void // ADD THIS
}

export function EdetabelModal({ isOpen, onClose, onChampionshipModalToggle }: EdetabelModalProps) {
  // Rally states
  const [selectedRallyId, setSelectedRallyId] = useState<string | null>(null)
  const [gameFilter, setGameFilter] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'participants'>('date')
  const [currentPage, setCurrentPage] = useState(1)

  // Championship states
  const [viewType, setViewType] = useState<'rallies' | 'championships'>('rallies')
  const [isChampionshipModalOpen, setIsChampionshipModalOpen] = useState(false)
  const [selectedChampionship, setSelectedChampionship] = useState<PublicChampionship | null>(null)

  // Data hooks
  const { data: approvedRallies = [], isLoading } = useApprovedRallies()
  const { data: publicChampionships = [], isLoading: isLoadingChampionships } = usePublicChampionships()

  // Pagination settings
  const RALLIES_PER_PAGE = 10

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

  // Calculate pagination
  const totalPages = Math.ceil(filteredRallies.length / RALLIES_PER_PAGE)
  const startIndex = (currentPage - 1) * RALLIES_PER_PAGE
  const endIndex = startIndex + RALLIES_PER_PAGE
  const paginatedRallies = filteredRallies.slice(startIndex, endIndex)

  // Reset pagination when filters change
  const handleFilterChange = (newGameFilter: string, newSearchTerm: string, newSortBy: 'date' | 'name' | 'participants') => {
    setGameFilter(newGameFilter)
    setSearchTerm(newSearchTerm)
    setSortBy(newSortBy)
    setCurrentPage(1) // Reset to first page
  }

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

  // Update championship click handler:
  const handleChampionshipClick = (championship: PublicChampionship) => {
    setSelectedChampionship(championship)
    setIsChampionshipModalOpen(true)
    onChampionshipModalToggle?.(true) // ADD THIS LINE
  }


  // Create championship close handler:
  const handleChampionshipModalClose = () => {
    setIsChampionshipModalOpen(false)
    setSelectedChampionship(null)
    onChampionshipModalToggle?.(false)
  }

  const getChampionshipStatus = (championship: PublicChampionship) => {
    const status = (championship as any).status || 'ongoing'
    
    if (status === 'completed') {
      return {
        text: 'Lõppenud',
        className: 'px-2 py-1 bg-red-600/20 text-red-400 rounded text-xs font-medium'
      }
    } else {
      return {
        text: 'Käimasolev',
        className: 'px-2 py-1 bg-green-600/20 text-green-400 rounded text-xs font-medium'
      }
    }
  }

  // Format date function
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('et-EE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  // Pagination component
  const PaginationControls = ({ position }: { position: 'top' | 'bottom' }) => {
    if (totalPages <= 1) return null

    const getPageNumbers = () => {
      const pages = []
      const maxVisible = 5
      
      if (totalPages <= maxVisible) {
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        if (currentPage <= 3) {
          for (let i = 1; i <= 4; i++) {
            pages.push(i)
          }
          pages.push('...')
          pages.push(totalPages)
        } else if (currentPage >= totalPages - 2) {
          pages.push(1)
          pages.push('...')
          for (let i = totalPages - 3; i <= totalPages; i++) {
            pages.push(i)
          }
        } else {
          pages.push(1)
          pages.push('...')
          for (let i = currentPage - 1; i <= currentPage + 1; i++) {
            pages.push(i)
          }
          pages.push('...')
          pages.push(totalPages)
        }
      }
      
      return pages
    }

    return (
      <div className={`flex items-center justify-center gap-2 ${position === 'top' ? 'mb-4' : 'mt-6'}`}>
        <button
          onClick={() => setCurrentPage(1)}
          disabled={currentPage === 1}
          className="px-3 py-1 text-sm bg-slate-800/50 border border-slate-600 rounded-lg text-slate-300 hover:bg-slate-700/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          ««
        </button>
        
        <button
          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
          disabled={currentPage === 1}
          className="px-3 py-1 text-sm bg-slate-800/50 border border-slate-600 rounded-lg text-slate-300 hover:bg-slate-700/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          ‹
        </button>

        <div className="flex items-center gap-1">
          {getPageNumbers().map((page, index) => (
            <button
              key={index}
              onClick={() => typeof page === 'number' && setCurrentPage(page)}
              disabled={page === '...'}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                page === currentPage
                  ? 'bg-blue-600 text-white border border-blue-500'
                  : page === '...'
                  ? 'text-slate-500 cursor-default'
                  : 'bg-slate-800/50 border border-slate-600 text-slate-300 hover:bg-slate-700/50'
              }`}
            >
              {page}
            </button>
          ))}
        </div>

        <button
          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
          disabled={currentPage === totalPages}
          className="px-3 py-1 text-sm bg-slate-800/50 border border-slate-600 rounded-lg text-slate-300 hover:bg-slate-700/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          ›
        </button>
        
        <button
          onClick={() => setCurrentPage(totalPages)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 text-sm bg-slate-800/50 border border-slate-600 rounded-lg text-slate-300 hover:bg-slate-700/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          »»
        </button>

        <span className="ml-4 text-sm text-slate-400">
          Lehekülg {currentPage} / {totalPages} ({filteredRallies.length} rallit)
        </span>
      </div>
    )
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
                      : 'Koondarvestuste tulemused'
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
                    onClick={() => {
                      setViewType('rallies')
                      setCurrentPage(1) // Reset pagination when switching views
                    }}
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
                    🏆 Koondarvestused ({publicChampionships.length})
                  </button>
                </div>

                {/* Quick Stats for Rallies */}
                {viewType === 'rallies' && (
                  <div className="flex items-center gap-6 text-sm text-slate-400">
                    <span>{availableGames.length} mängu</span>
                  </div>
                )}
              </div>

              {/* Filters for Rallies */}
              {viewType === 'rallies' && (
                <div className="flex flex-wrap items-center gap-4 mt-4">
                  <input
                    type="text"
                    placeholder="Otsi rallide hulgast..."
                    value={searchTerm}
                    onChange={(e) => handleFilterChange(gameFilter, e.target.value, sortBy)}
                    className="px-4 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  
                  <select
                    value={gameFilter}
                    onChange={(e) => handleFilterChange(e.target.value, searchTerm, sortBy)}
                    className="px-4 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Kõik mängud</option>
                    {availableGames.map(game => (
                      <option key={game} value={game}>{game}</option>
                    ))}
                  </select>

                  <select
                    value={sortBy}
                    onChange={(e) => handleFilterChange(gameFilter, searchTerm, e.target.value as 'date' | 'name' | 'participants')}
                    className="px-4 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="date">Sorteeritud kuupäeva järgi</option>
                    <option value="name">Sorteeritud nime järgi</option>
                    <option value="participants">Sorteeritud osalejate järgi</option>
                  </select>
                </div>
              )}
            </div>

            {/* Content Area with Scroll */}
            <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
              <div className="p-6">
                {viewType === 'rallies' ? (
                  <>
                    {/* Loading State */}
                    {isLoading ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="w-8 h-8 border-2 border-slate-600 border-t-blue-500 rounded-full animate-spin"></div>
                        <span className="ml-3 text-slate-400">Laen rallide andmeid...</span>
                      </div>
                    ) : filteredRallies.length === 0 ? (
                      <div className="text-center py-12">
                        <span className="text-slate-400">Ühtegi rallit ei leitud</span>
                      </div>
                    ) : (
                      <>
                        {/* Top Pagination Controls */}
                        <PaginationControls position="top" />

                        {/* Rally Rows - ORIGINAL COMPACT ROW LAYOUT */}
                        <div className="space-y-3">
                          {paginatedRallies.map((rally) => (
                            <div
                              key={rally.id}
                              onClick={() => setSelectedRallyId(rally.id)}
                              className="bg-slate-900/50 rounded-xl border border-slate-700/50 p-4 hover:bg-slate-800/50 hover:border-slate-600/50 transition-all duration-200 cursor-pointer"
                            >
                              {/* Rally Header Row */}
                              <div className="flex items-center justify-between">
                                {/* Left side - Rally info */}
                                <div className="flex items-center space-x-4">
                                  <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <span className="text-blue-400 text-lg">🏁</span>
                                  </div>
                                  <div>
                                    <h3 className="font-bold text-white text-lg leading-tight mb-1">
                                      {rally.name}
                                    </h3>
                                    <div className="flex items-center space-x-4 text-sm text-slate-400">
                                      <span className="flex items-center space-x-1">
                                        <span>📅</span>
                                        <span>{formatDate(rally.competition_date)}</span>
                                      </span>
                                      <span className="flex items-center space-x-1">
                                        <span>🎮</span>
                                        <span>{rally.game_name}</span>
                                      </span>
                                      <span className="flex items-center space-x-1">
                                        <span>🏁</span>
                                        <span>{rally.game_type_name}</span>
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Right side - Participants count and arrow */}
                                <div className="flex items-center space-x-4">
                                  <div className="text-center">
                                    <div className="text-xl font-bold text-white">
                                      {rally.total_participants}
                                    </div>
                                    <div className="text-xs text-slate-400">osalejat</div>
                                  </div>
                                  <div className="text-slate-400 group-hover:text-blue-400 transition-colors">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Bottom Pagination Controls */}
                        <PaginationControls position="bottom" />
                      </>
                    )}
                  </>
                ) : (
                  <>
                    {/* Championships View */}
                    {isLoadingChampionships ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="w-8 h-8 border-2 border-slate-600 border-t-blue-500 rounded-full animate-spin"></div>
                        <span className="ml-3 text-slate-400">Laen meistrivõistluste andmeid...</span>
                      </div>
                    ) : publicChampionships.length === 0 ? (
                      <div className="text-center py-12">
                        <span className="text-slate-400">Ühtegi meistrivõistlust ei leitud</span>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {publicChampionships.map((championship) => {
                          const statusInfo = getChampionshipStatus(championship)
                          
                          return (
                            <div
                              key={championship.id}
                              onClick={() => handleChampionshipClick(championship)}
                              className="group bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 hover:bg-slate-800/60 hover:border-slate-600/50 transition-all duration-300 cursor-pointer"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-3">
                                    <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
                                      {championship.name}
                                    </h3>
                                    <span className="px-2 py-1 bg-blue-600/20 text-blue-400 rounded text-xs font-medium">
                                      {championship.season_year}
                                    </span>
                                    <span className={statusInfo.className}>
                                      {statusInfo.text}
                                    </span>
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
                          )
                        })}
                      </div>
                    )}
                  </>
                )}
              </div>
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
      {selectedChampionship && (
        <ChampionshipResultsModal
          isOpen={isChampionshipModalOpen}
          onClose={() => {
            setIsChampionshipModalOpen(false)
            setSelectedChampionship(null)
            onChampionshipModalToggle?.(false) // ADD THIS LINE
          }}
          championshipId={selectedChampionship.id}
          championshipName={selectedChampionship.name}
        />
      )}
    </>
  )
}