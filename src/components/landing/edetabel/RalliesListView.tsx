// src/components/landing/edetabel/RalliesListView.tsx
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
    <div className="space-y-6">
      {/* Pagination Top */}
      <PaginationControls 
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />

      {/* Rallies Grid */}
      <div className="grid gap-4">
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

// Rally Card Component
function RallyCard({ 
  rally, 
  index, 
  onClick 
}: { 
  rally: ApprovedRally
  index: number
  onClick: () => void 
}) {
  return (
    <div
      onClick={onClick}
      className="group relative overflow-hidden rounded-xl cursor-pointer transition-all duration-300 hover:scale-[1.01]"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="tech-border rounded-xl">
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-3">
                <span className="px-3 py-1 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-lg text-sm font-['Orbitron'] uppercase tracking-wider">
                  {rally.game_name}
                </span>
                <span className="text-gray-500 text-sm">
                  {new Date(rally.competition_date).toLocaleDateString('et-EE')}
                </span>
              </div>
              
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-red-400 transition-colors">
                {rally.name}
              </h3>
              
              <div className="flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                  <span className="text-red-400">👥</span>
                  <span className="text-gray-400">{rally.total_participants} osalejat</span>
                </div>
              </div>
            </div>
            
            <div className="text-red-400 group-hover:text-red-300 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>

          {/* Bottom gradient line */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500/0 to-transparent group-hover:via-red-500/50 transition-all duration-300"></div>
        </div>
      </div>
    </div>
  )
}

// Loading State Component
function LoadingState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-red-500/20 border-t-red-500 rounded-full animate-spin"></div>
        <div className="absolute inset-0 w-16 h-16 border-4 border-purple-500/20 border-b-purple-500 rounded-full animate-spin" 
          style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
      </div>
      <p className="mt-4 text-gray-400 font-['Orbitron'] tracking-wider">{message}</p>
    </div>
  )
}

// Empty State Component
function EmptyState({ icon, message }: { icon: string; message: string }) {
  return (
    <div className="text-center py-20">
      <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
        <span className="text-3xl">{icon}</span>
      </div>
      <p className="text-gray-400 text-lg">{message}</p>
    </div>
  )
}