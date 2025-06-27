// src/components/landing/edetabel/ChampionshipsListView.tsx - COMPACT VERSION
'use client'

import { PublicChampionship } from '@/hooks/usePublicChampionships'

interface ChampionshipsListViewProps {
  championships: PublicChampionship[]
  isLoading: boolean
  onChampionshipClick: (championship: PublicChampionship) => void
}

export function ChampionshipsListView({ 
  championships, 
  isLoading, 
  onChampionshipClick 
}: ChampionshipsListViewProps) {
  if (isLoading) {
    return <LoadingState message="LAADIN MEISTRIVÕISTLUSI..." />
  }

  if (championships.length === 0) {
    return <EmptyState icon="🏆" message="Meistrivõistlusi ei leitud" />
  }

  return (
    // Changed from gap-4 to gap-2 for compact spacing
    <div className="grid gap-2">
      {championships.map((championship, index) => (
        <ChampionshipCard
          key={championship.id}
          championship={championship}
          index={index}
          onClick={() => onChampionshipClick(championship)}
        />
      ))}
    </div>
  )
}

// Compact Championship Card Component
function ChampionshipCard({ 
  championship, 
  index, 
  onClick 
}: { 
  championship: PublicChampionship
  index: number
  onClick: () => void 
}) {
  const getStatusStyle = (status: string) => {
    return status === 'completed'
      ? 'bg-red-500/20 text-red-400 border-red-500/30'
      : 'bg-green-500/20 text-green-400 border-green-500/30'
  }

  const getStatusText = (status: string) => {
    return status === 'completed' ? 'Lõppenud' : 'Käimasolev'
  }

  return (
    <div
      onClick={onClick}
      className="group relative overflow-hidden rounded-xl cursor-pointer transition-all duration-300 hover:scale-[1.005]"
      style={{ animationDelay: `${index * 30}ms` }}
    >
      <div className="tech-border rounded-xl">
        {/* Reduced padding from p-6 to p-3 */}
        <div className="p-3">
          <div className="flex items-center justify-between gap-4">
            {/* Left Section */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                {/* Title and Badges on same line */}
                <h3 className="text-base font-bold text-white group-hover:text-red-400 transition-colors truncate">
                  {championship.name}
                </h3>
                
                {/* Badges */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-md text-xs font-['Orbitron']">
                    {championship.season_year}
                  </span>
                  <span className={`px-2 py-0.5 rounded-md text-xs font-medium border ${getStatusStyle(championship.status)}`}>
                    {getStatusText(championship.status)}
                  </span>
                </div>
              </div>
              
              {/* Details Row */}
              <div className="flex items-center space-x-4 text-xs text-gray-400">
                {championship.game_name && (
                  <span className="flex items-center space-x-1">
                    <span className="text-red-400">🎮</span>
                    <span>{championship.game_name}</span>
                  </span>
                )}
                <span className="flex items-center space-x-1">
                  <span className="text-red-400">🏁</span>
                  <span>{championship.total_rallies} rallit</span>
                </span>
                <span className="flex items-center space-x-1">
                  <span className="text-red-400">👥</span>
                  <span>{championship.total_participants} osalejat</span>
                </span>
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center">
              <span className="text-red-400 group-hover:text-red-300 transition-colors text-2xl">
                →
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Loading State Component
function LoadingState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-red-500/20 border-t-red-500 rounded-full animate-spin"></div>
        <div 
          className="absolute inset-0 w-16 h-16 border-4 border-purple-500/20 border-b-purple-500 rounded-full animate-spin" 
          style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}
        ></div>
      </div>
      <p className="mt-4 text-gray-400 font-['Orbitron'] tracking-wider">{message}</p>
    </div>
  )
}

// Empty State Component
function EmptyState({ icon, message }: { icon: string; message: string }) {
  return (
    <div className="text-center py-16">
      <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
        <span className="text-3xl">{icon}</span>
      </div>
      <p className="text-gray-400 text-lg">{message}</p>
    </div>
  )
}