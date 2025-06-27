// src/components/landing/edetabel/RalliesListView.tsx - COMPACT VERSION
'use client'

import type { ApprovedRally } from '@/hooks/useApprovedRallies'
import { PaginationControls } from './PaginationControls'

interface RalliesListViewProps {
  rallies: ApprovedRally[]
  isLoading: boolean
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  onRallyClick: (id: string) => void
}

export function RalliesListView({ 
  rallies, 
  isLoading, 
  currentPage, 
  totalPages, 
  onPageChange, 
  onRallyClick 
}: RalliesListViewProps) {
  if (isLoading) {
    return <LoadingState message="LAADIN RALLIANDMEID..." />
  }

  if (rallies.length === 0) {
    return <EmptyState icon="🏁" message="Ralliandmeid ei leitud" />
  }

  return (
    <div className="space-y-4">
      {/* Pagination Top */}
      <PaginationControls 
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />

      {/* Rallies List - Changed from grid gap-4 to gap-2 */}
      <div className="grid gap-2">
        {rallies.map((rally, index) => (
          <RallyCard
            key={rally.id}
            rally={rally}
            index={index}
            onClick={() => onRallyClick(rally.id)}
          />
        ))}
      </div>

      {/* Pagination Bottom */}
      <PaginationControls 
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </div>
  )
}

// Compact Rally Card Component
function RallyCard({ 
  rally, 
  index, 
  onClick 
}: { 
  rally: ApprovedRally
  index: number
  onClick: () => void 
}) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('et-EE')
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
              <div className="flex items-center gap-3">
                {/* Title */}
                <h3 className="text-base font-bold text-white group-hover:text-red-400 transition-colors truncate">
                  {rally.name}
                </h3>
                
                {/* Badges */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-md text-xs font-['Orbitron']">
                    {rally.game_name}
                  </span>
                  <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-md text-xs">
                    {rally.game_type_name}
                  </span>
                </div>
              </div>
              
              {/* Details Row */}
              <div className="flex items-center space-x-4 mt-1 text-xs text-gray-400">
                <span className="flex items-center space-x-1">
                  <span className="text-red-400">📅</span>
                  <span>{formatDate(rally.competition_date)}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <span className="text-red-400">👥</span>
                  <span>{rally.total_participants} osalejat</span>
                </span>
              </div>
            </div>

            {/* Right Section - Arrow */}
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