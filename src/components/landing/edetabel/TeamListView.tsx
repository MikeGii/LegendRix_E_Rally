// src/components/landing/edetabel/TeamListView.tsx
'use client'

import { useState } from 'react'
import { usePublicRalliesWithTeamResults } from '@/hooks/usePublicRalliesWithTeamResults'

interface TeamListViewProps {
  isLoading?: boolean
}

export function TeamListView({ isLoading: externalLoading = false }: TeamListViewProps) {
  const [selectedRallyId, setSelectedRallyId] = useState<string | null>(null)
  const { data: rallies = [], isLoading: ralliesLoading } = usePublicRalliesWithTeamResults()
  
  const isLoading = externalLoading || ralliesLoading

  if (isLoading) {
    return <LoadingState message="LAADIN TIIMIDE RALLIANDMEID..." />
  }

  if (rallies.length === 0) {
    return <EmptyState icon="👥" message="Tiimide tulemusi ei leitud" />
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const months = ['jaan', 'veeb', 'märts', 'apr', 'mai', 'juuni', 
                   'juuli', 'aug', 'sept', 'okt', 'nov', 'dets']
    return `${date.getDate()}. ${months[date.getMonth()]} ${date.getFullYear()}`
  }

  return (
    <div className="space-y-4">
      {/* Rally list */}
      <div className="grid gap-2">
        {rallies.map((rally, index) => (
          <div
            key={rally.id}
            onClick={() => setSelectedRallyId(rally.id)}
            className="group relative overflow-hidden rounded-xl cursor-pointer transition-all duration-300 hover:scale-[1.005]"
            style={{ animationDelay: `${index * 30}ms` }}
          >
            <div className="tech-border rounded-xl">
              <div className="p-3">
                <div className="flex items-center justify-between gap-4">
                  {/* Left Section */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-base font-bold text-white group-hover:text-red-400 transition-colors truncate">
                        {rally.name}
                      </h3>
                      
                      {/* Badges */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-md text-xs font-['Orbitron']">
                          TIIMID
                        </span>
                      </div>
                    </div>
                    
                    {/* Details Row */}
                    <div className="flex items-center space-x-4 text-xs text-gray-400">
                      <span className="flex items-center space-x-1">
                        <span className="text-red-400">📅</span>
                        <span>{formatDate(rally.competition_date)}</span>
                      </span>
                      {rally.game_name && (
                        <span className="flex items-center space-x-1">
                          <span className="text-red-400">🎮</span>
                          <span>{rally.game_name}</span>
                        </span>
                      )}
                      <span className="flex items-center space-x-1">
                        <span className="text-red-400">👥</span>
                        <span>{rally.team_count || 0} tiimi</span>
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
        ))}
      </div>

      {/* Info message */}
      <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
        <p className="text-xs text-blue-400 text-center">
          ℹ️ Tiimide tulemuste vaatamine tuleb varsti
        </p>
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