// src/app/results/page.tsx - SAFE UPDATE: Preserves existing functionality
'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { 
  useCompletedRallies, 
  useApprovedRallies,
  useRallyParticipants, 
  useRallyEvents 
} from '@/hooks/useResultsManagement'
import { useRalliesWithTeamResults } from '@/hooks/useTeamRallies'
import { LoadingState } from '@/components/shared/States'
import { DashboardLayout } from '@/components/DashboardLayout'
import { AdminPageHeader } from '@/components/shared/AdminPageHeader'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { RallySelector } from '@/components/results/RallySelector'
import { RallyHeader } from '@/components/results/RallyHeader'
import { ResultsEntryInterface } from '@/components/results/ResultsEntryInterface'
import { TeamResultsInterface } from '@/components/results/TeamResultsInterface'

// Import existing components for approved results view
import { useApprovedRallyResults } from '@/hooks/useApprovedRallies'

function ResultsPageContent() {
  const { user, loading: authLoading } = useAuth()
  const [selectedRally, setSelectedRally] = useState<string | null>(null)
  const [currentTab, setCurrentTab] = useState<'pending' | 'approved' | 'team'>('pending')

  const { 
    data: completedRallies = [], 
    isLoading: completedLoading,
    error: completedError 
  } = useCompletedRallies()

  const { 
    data: approvedRallies = [], 
    isLoading: approvedLoading,
    error: approvedError 
  } = useApprovedRallies()

  const {
    data: teamRallies = [],
    isLoading: teamLoading,
    error: teamError
  } = useRalliesWithTeamResults()

  const { 
    data: participants = [], 
    isLoading: participantsLoading 
  } = useRallyParticipants(selectedRally || '')

  const { 
    data: events = [] 
  } = useRallyEvents(selectedRally || '')

  // For approved results view
  const { 
    data: approvedResults = [], 
    isLoading: approvedResultsLoading 
  } = useApprovedRallyResults(selectedRally || '')

  if (completedLoading && approvedLoading && teamLoading) {
    return <LoadingState message="Laen rallisid..." />
  }

  // Find selected rally from all sources
  const allRallies = [...completedRallies, ...approvedRallies, ...teamRallies]
  const selectedRallyData = allRallies.find(r => r.id === selectedRally)

  // Check if we're viewing team results
  const isViewingTeamResults = currentTab === 'team' && teamRallies.some(r => r.id === selectedRally)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-6">
        <AdminPageHeader 
          title="Tulemuste haldus"
          description="Sisesta ja halda ralli tulemusi" 
          icon={''}        
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Rally Selector Sidebar */}
          <div className="lg:col-span-1">
            <RallySelector
              rallies={[]}
              selectedRallyId={selectedRally}
              onSelectRally={setSelectedRally}
              isLoading={completedLoading || approvedLoading || teamLoading}
              error={completedError || approvedError || teamError}
              onTabChange={setCurrentTab}
            />
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2">
            {selectedRally && selectedRallyData ? (
              <div className="space-y-6">
                {/* Show different content based on current tab and rally type */}
                {isViewingTeamResults ? (
                  // Team Results View
                  <TeamResultsInterface
                    rallyId={selectedRally}
                    rallyName={selectedRallyData.name}
                  />
                ) : currentTab === 'approved' ? (
                  // Approved Results View - Read Only
                  <>
                    <RallyHeader
                      rally={selectedRallyData}
                      participants={participants}
                    />
                    
                    <div className="bg-slate-800/30 backdrop-blur-xl rounded-xl border border-slate-700/50">
                      <div className="p-6 border-b border-slate-700/50">
                        <h3 className="text-lg font-semibold text-white">Kinnitatud tulemused</h3>
                        <p className="text-sm text-slate-400 mt-1">
                          See ralli on kinnitatud. Tulemusi ei saa enam muuta.
                        </p>
                      </div>
                      
                      {approvedResultsLoading ? (
                        <div className="p-8 text-center">
                          <div className="w-8 h-8 border-4 border-slate-600 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
                          <p className="text-slate-400 mt-2">Laen tulemusi...</p>
                        </div>
                      ) : approvedResults.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-slate-800/50">
                              <tr className="border-b border-slate-700/50">
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Koht</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Nimi</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Klass</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase">Punktid</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase">Lisa punktid</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase">Kokku</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700/30">
                              {approvedResults.map((result: any) => (
                                <tr key={result.id} className="hover:bg-slate-800/30">
                                  <td className="px-4 py-3 text-sm text-white">{result.class_position}</td>
                                  <td className="px-4 py-3 text-sm text-white">{result.participant_name}</td>
                                  <td className="px-4 py-3 text-sm text-slate-300">{result.class_name}</td>
                                  <td className="px-4 py-3 text-sm text-right text-slate-300">{result.total_points || 0}</td>
                                  <td className="px-4 py-3 text-sm text-right text-slate-300">{result.extra_points || 0}</td>
                                  <td className="px-4 py-3 text-sm text-right font-medium text-white">
                                    {(result.total_points || 0) + (result.extra_points || 0)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="p-8 text-center">
                          <p className="text-slate-400">Tulemusi ei leitud</p>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  // Pending Results - Editable View
                  <>
                    <RallyHeader
                      rally={selectedRallyData}
                      participants={participants}
                    />

                    <ResultsEntryInterface
                      rallyId={selectedRally}
                      participants={participants}
                      events={events}
                      isLoading={participantsLoading}
                    />
                  </>
                )}
              </div>
            ) : (
              <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8 text-center">
                <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl text-slate-500">
                    {currentTab === 'team' ? '👥' : '🏁'}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {currentTab === 'team' ? 'Vali võistkondlik ralli' : 'Vali ralli'}
                </h3>
                <p className="text-slate-400 mb-4">
                  {currentTab === 'team' 
                    ? 'Vali vasakult ralli, et näha võistkondlikke tulemusi.'
                    : 'Vali vasakult ralli, et näha osalejaid ja sisestada tulemusi.'
                  }
                </p>
                {completedRallies.length === 0 && approvedRallies.length === 0 && teamRallies.length === 0 && (
                  <div className="mt-4 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                    <p className="text-blue-400 text-sm">
                      💡 Vihje: Loo Rally Management lehel uus ralli ja määra selle staatus "completed", et see ilmuks siia.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ResultsPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <DashboardLayout>
        <ResultsPageContent />
      </DashboardLayout>
    </ProtectedRoute>
  )
}