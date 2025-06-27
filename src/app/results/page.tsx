// src/app/results/page.tsx - FIXED: Use ClassSeparatedParticipantsTable for approved results
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
import { ClassSeparatedParticipantsTable } from '@/components/results/components/ClassSeparatedParticipantsTable'

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

  // Transform approved results to match participant format for ClassSeparatedParticipantsTable
  const approvedParticipants = approvedResults.map(result => ({
    id: result.id,
    user_id: result.user_id,
    player_name: result.participant_name,
    class_name: result.class_name,
    registration_date: result.registration_date
  }))

  // Transform approved results to match the results format
  const approvedResultsMap = approvedResults.reduce((acc, result) => {
    acc[result.id] = {
      overallPosition: result.overall_position,
      classPosition: result.class_position,
      totalPoints: result.total_points || 0,
      extraPoints: result.extra_points || 0,
      participated: true
    }
    return acc
  }, {} as Record<string, any>)

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
                      
                      {/* Use ClassSeparatedParticipantsTable for approved results */}
                      <div className="p-6">
                        <ClassSeparatedParticipantsTable
                          participants={approvedParticipants}
                          results={approvedResultsMap}
                          editMode={false}
                          onUpdateResult={() => {}}
                          onClearResults={() => {}}
                          onRemoveParticipant={() => {}}
                          isRemoving={false}
                        />
                      </div>
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