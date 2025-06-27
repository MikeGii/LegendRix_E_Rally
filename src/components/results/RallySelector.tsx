// src/components/results/RallySelector.tsx - UPDATED: With team results tab
'use client'

import { useState } from 'react'
import { useCompletedRallies, useApprovedRallies } from '@/hooks/useResultsManagement'
import { useRalliesWithTeamResults } from '@/hooks/useTeamRallies'
import type { CompletedRally } from '@/hooks/useResultsManagement'

interface RallySelectorProps {
  rallies: CompletedRally[]
  selectedRallyId: string | null
  onSelectRally: (rallyId: string) => void
  isLoading: boolean
  error: any
  onTabChange?: (tab: 'pending' | 'approved' | 'team') => void
}

export function RallySelector({
  selectedRallyId,
  onSelectRally,
  isLoading,
  error,
  onTabChange
}: RallySelectorProps) {
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'team'>('pending')
  
  // Load completed, approved, and team rallies
  const { data: completedRallies = [], isLoading: completedLoading } = useCompletedRallies()
  const { data: approvedRallies = [], isLoading: approvedLoading } = useApprovedRallies()
  const { data: teamRallies = [], isLoading: teamLoading } = useRalliesWithTeamResults()

  const currentRallies = activeTab === 'pending' 
    ? completedRallies 
    : activeTab === 'approved' 
    ? approvedRallies 
    : teamRallies
  
  const currentLoading = activeTab === 'pending' 
    ? completedLoading 
    : activeTab === 'approved'
    ? approvedLoading
    : teamLoading

  const handleTabChange = (tab: 'pending' | 'approved' | 'team') => {
    setActiveTab(tab)
    if (onTabChange) {
      onTabChange(tab)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('et-EE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  if (error) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-4">
        <div className="text-center">
          <p className="text-red-400 mb-1 text-sm">Viga rallidede laadimisel</p>
          <p className="text-slate-500 text-xs">{error.message}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-slate-800/30 backdrop-blur-xl rounded-xl border border-slate-700/50">
      {/* Header */}
      <div className="p-4 border-b border-slate-700/50">
        <h2 className="text-base font-semibold text-white">Tulemuste haldus</h2>
      </div>

      {/* Redesigned Tabs - More compact and better visual hierarchy */}
      <div className="px-3 pt-3">
        <div className="flex gap-1 bg-slate-900/50 p-1 rounded-lg">
          <button
            onClick={() => handleTabChange('pending')}
            className={`
              flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200
              ${activeTab === 'pending'
                ? 'bg-blue-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }
            `}
          >
            <div className="flex items-center justify-center gap-1.5">
              <span>Vajab tulemusi</span>
              {!completedLoading && completedRallies.length > 0 && (
                <span className={`
                  px-1.5 py-0.5 rounded-full text-[10px] font-bold
                  ${activeTab === 'pending' ? 'bg-blue-600' : 'bg-slate-700'}
                `}>
                  {completedRallies.length}
                </span>
              )}
            </div>
          </button>
          
          <button
            onClick={() => handleTabChange('approved')}
            className={`
              flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200
              ${activeTab === 'approved'
                ? 'bg-green-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }
            `}
          >
            <div className="flex items-center justify-center gap-1.5">
              <span>Kinnitatud</span>
              {!approvedLoading && approvedRallies.length > 0 && (
                <span className={`
                  px-1.5 py-0.5 rounded-full text-[10px] font-bold
                  ${activeTab === 'approved' ? 'bg-green-600' : 'bg-slate-700'}
                `}>
                  {approvedRallies.length}
                </span>
              )}
            </div>
          </button>
          
          <button
            onClick={() => handleTabChange('team')}
            className={`
              flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200
              ${activeTab === 'team'
                ? 'bg-purple-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }
            `}
          >
            <div className="flex items-center justify-center gap-1.5">
              <span>Võistkonnad</span>
              {!teamLoading && teamRallies.length > 0 && (
                <span className={`
                  px-1.5 py-0.5 rounded-full text-[10px] font-bold
                  ${activeTab === 'team' ? 'bg-purple-600' : 'bg-slate-700'}
                `}>
                  {teamRallies.length}
                </span>
              )}
            </div>
          </button>
        </div>
      </div>

      {/* Rally List Container */}
      <div className="p-3">
        {/* Loading State */}
        {currentLoading && (
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-14 bg-slate-700/30 rounded-lg"></div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!currentLoading && currentRallies.length === 0 && (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-slate-700/30 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-xl">
                {activeTab === 'team' ? '👥' : '🏁'}
              </span>
            </div>
            <h3 className="text-sm font-medium text-white mb-1">
              {activeTab === 'pending' 
                ? 'Tulemusi pole vaja sisestada' 
                : activeTab === 'approved'
                ? 'Kinnitatud tulemusi pole'
                : 'Võistkondlikke tulemusi pole'
              }
            </h3>
            <p className="text-slate-500 text-xs">
              {activeTab === 'pending' 
                ? 'Kõik rallid on sisestatud' 
                : activeTab === 'approved'
                ? 'Ühtegi ralli pole kinnitatud'
                : 'Võistkondlikud tulemused ilmuvad pärast kinnitamist'
              }
            </p>
          </div>
        )}

        {/* Rally List - Compact design */}
        {!currentLoading && currentRallies.length > 0 && (
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
            {currentRallies.map((rally) => (
              <div
                key={rally.id}
                onClick={() => onSelectRally(rally.id)}
                className={`
                  group px-3 py-2.5 rounded-lg border cursor-pointer transition-all duration-200
                  ${selectedRallyId === rally.id
                    ? 'bg-blue-500/10 border-blue-500/50 shadow-sm'
                    : 'bg-slate-900/30 border-slate-700/30 hover:border-slate-600/50 hover:bg-slate-800/30'
                  }
                `}
              >
                {/* Compact rally info */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h4 className={`text-sm font-medium truncate ${
                      selectedRallyId === rally.id ? 'text-blue-400' : 'text-white'
                    }`}>
                      {rally.name}
                    </h4>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-xs text-slate-500">
                        {formatDate(rally.competition_date)}
                      </span>
                      <span className="text-xs text-slate-600">•</span>
                      <span className="text-xs text-slate-400">
                        {rally.participant_count} osalejat
                      </span>
                    </div>
                  </div>
                  
                  {/* Status indicator */}
                  <div className="flex items-center gap-2">
                    {selectedRallyId === rally.id && (
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                    )}
                    <div className={`
                      px-2 py-0.5 rounded text-[10px] font-medium whitespace-nowrap
                      ${activeTab === 'approved' || activeTab === 'team'
                        ? 'bg-green-500/20 text-green-400'
                        : rally.results_completed
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'bg-orange-500/20 text-orange-400'
                      }
                    `}>
                      {activeTab === 'approved' 
                        ? 'Kinnitatud' 
                        : activeTab === 'team'
                        ? 'Võistkonnad'
                        : rally.results_completed 
                        ? 'Sisestatud' 
                        : 'Ootel'
                      }
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom hint */}
      {!currentLoading && currentRallies.length > 0 && (
        <div className="px-4 pb-3 pt-1">
          <p className="text-[10px] text-slate-500 text-center">
            {activeTab === 'approved' 
              ? 'Kliki rallile tulemuste vaatamiseks'
              : activeTab === 'team'
              ? 'Kliki rallile võistkondlike tulemuste vaatamiseks'
              : 'Kliki rallile tulemuste sisestamiseks'
            }
          </p>
        </div>
      )}
    </div>
  )
}

/* Add this to your global CSS file */
<style jsx global>{`
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-track {
    background: rgba(30, 41, 59, 0.5);
    border-radius: 3px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(100, 116, 139, 0.5);
    border-radius: 3px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(100, 116, 139, 0.7);
  }
`}</style>