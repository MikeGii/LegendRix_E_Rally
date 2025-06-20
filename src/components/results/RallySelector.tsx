// src/components/results/RallySelector.tsx - FIXED: Separate approved rallies tab
'use client'

import { useState } from 'react'
import { useCompletedRallies, useApprovedRallies } from '@/hooks/useResultsManagement'
import type { CompletedRally } from '@/hooks/useResultsManagement'

interface RallySelectorProps {
  rallies: CompletedRally[]
  selectedRallyId: string | null
  onSelectRally: (rallyId: string) => void
  isLoading: boolean
  error: any
}

export function RallySelector({
  selectedRallyId,
  onSelectRally,
  isLoading,
  error
}: RallySelectorProps) {
  const [activeTab, setActiveTab] = useState<'pending' | 'approved'>('pending')
  
  // Load both completed and approved rallies
  const { data: completedRallies = [], isLoading: completedLoading } = useCompletedRallies()
  const { data: approvedRallies = [], isLoading: approvedLoading } = useApprovedRallies()

  const currentRallies = activeTab === 'pending' ? completedRallies : approvedRallies
  const currentLoading = activeTab === 'pending' ? completedLoading : approvedLoading

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffInDays === 0) return 'Täna'
    if (diffInDays === 1) return 'Eile'
    if (diffInDays < 7) return `${diffInDays} päeva tagasi`
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} nädalat tagasi`
    return `${Math.floor(diffInDays / 30)} kuud tagasi`
  }

  if (error) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
        <div className="text-center">
          <p className="text-red-400 mb-2">Viga rallidede laadimisel</p>
          <p className="text-slate-400 text-sm">{error.message}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-white">Tulemuste haldus</h2>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 p-1 bg-slate-800/50 rounded-lg">
        <button
          onClick={() => setActiveTab('pending')}
          className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
            activeTab === 'pending'
              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
              : 'text-slate-400 hover:text-slate-300'
          }`}
        >
          Vajab tulemusi
        </button>
        <button
          onClick={() => setActiveTab('approved')}
          className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
            activeTab === 'approved'
              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
              : 'text-slate-400 hover:text-slate-300'
          }`}
        >
          Kinnitatud tulemused
        </button>
      </div>

      {/* Loading State */}
      {currentLoading && (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-20 bg-slate-700/50 rounded-xl"></div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!currentLoading && currentRallies.length === 0 && (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl text-slate-500">🏁</span>
          </div>
          <h3 className="text-lg font-medium text-white mb-2">
            {activeTab === 'pending' ? 'Tulemusi pole vaja sisestada' : 'Kinnitatud tulemusi pole'}
          </h3>
          <p className="text-slate-400 text-sm">
            {activeTab === 'pending' 
              ? 'Kõikide lõppenud rallidede tulemused on sisestatud.' 
              : 'Ühtegi ralli tulemusi pole veel kinnitatud.'
            }
          </p>
        </div>
      )}

      {/* Rally List */}
      {!currentLoading && currentRallies.length > 0 && (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {currentRallies.map((rally) => (
            <div
              key={rally.id}
              onClick={() => onSelectRally(rally.id)}
              className={`
                p-4 rounded-xl border cursor-pointer transition-all duration-200
                hover:scale-[1.02] hover:shadow-lg
                ${selectedRallyId === rally.id
                  ? 'bg-blue-500/20 border-blue-500/50 shadow-lg shadow-blue-500/25'
                  : 'bg-slate-900/50 border-slate-700/50 hover:border-slate-600/50 hover:bg-slate-800/50'
                }
              `}
            >
              {/* Rally Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h4 className={`font-medium text-sm leading-tight ${
                    selectedRallyId === rally.id ? 'text-blue-300' : 'text-white'
                  }`}>
                    {rally.name}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    {rally.game_name} • {getTimeAgo(rally.competition_date)}
                  </p>
                </div>
                
                {/* Status Badge */}
                <div className={`px-2 py-1 rounded-md text-xs font-medium ${
                  activeTab === 'approved'
                    ? 'bg-green-500/20 text-green-400'
                    : rally.results_completed
                    ? 'bg-blue-500/20 text-blue-400'
                    : 'bg-orange-500/20 text-orange-400'
                }`}>
                  {activeTab === 'approved' 
                    ? 'Kinnitatud' 
                    : rally.results_completed 
                    ? 'Sisestatud' 
                    : 'Ootel'
                  }
                </div>
              </div>

              {/* Rally Stats */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="flex items-center space-x-2">
                  <span className="text-slate-500">👥</span>
                  <span className="text-slate-400">{rally.participant_count} osalejat</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-slate-500">📅</span>
                  <span className="text-slate-400">
                    {new Date(rally.competition_date).toLocaleDateString('et-EE', {
                      day: 'numeric',
                      month: 'short'
                    })}
                  </span>
                </div>
              </div>

              {/* Description Preview */}
              {rally.description && (
                <div className="mt-2 pt-2 border-t border-slate-700/30">
                  <p className="text-xs text-slate-500 line-clamp-2">
                    {rally.description}
                  </p>
                </div>
              )}

              {/* Selection Indicator */}
              {selectedRallyId === rally.id && (
                <div className="mt-3 pt-2 border-t border-blue-500/30">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                    <span className="text-xs text-blue-400 font-medium">Valitud</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Instructions */}
      {!currentLoading && currentRallies.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-700/30">
          <p className="text-xs text-slate-500 text-center">
            {activeTab === 'approved' 
              ? 'Vaata kinnitatud tulemusi'
              : 'Kliki rallile tulemuste sisestamiseks'
            }
          </p>
        </div>
      )}
    </div>
  )
}