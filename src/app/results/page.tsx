// src/app/results/page.tsx - CLEANED VERSION with proper container width
'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { 
  useCompletedRallies, 
  useRallyParticipants, 
  useRallyEvents 
} from '@/hooks/useResultsManagement'
import { LoadingState } from '@/components/shared/States'
import { DashboardLayout } from '@/components/DashboardLayout'
import { AdminPageHeader } from '@/components/shared/AdminPageHeader'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { RallySelector } from '@/components/results/RallySelector'
import { RallyHeader } from '@/components/results/RallyHeader'
import { ResultsEntryInterface } from '@/components/results/ResultsEntryInterface'

function ResultsPageContent() {
  const { user, loading: authLoading } = useAuth()
  const [selectedRally, setSelectedRally] = useState<string | null>(null)

  const { 
    data: completedRallies = [], 
    isLoading: ralliesLoading,
    error: ralliesError 
  } = useCompletedRallies()

  const { 
    data: participants = [], 
    isLoading: participantsLoading 
  } = useRallyParticipants(selectedRally || '')

  const { 
    data: events = [] 
  } = useRallyEvents(selectedRally || '')

  if (ralliesLoading && !completedRallies.length) {
    return <LoadingState message="Laen lõppenud rallisid..." />
  }

  const selectedRallyData = completedRallies.find(r => r.id === selectedRally)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-6">
        <AdminPageHeader 
                  title="Tulemuste haldus"
                  description="Sisesta ja halda ralli tulemusi" icon={''}        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Rally Selector Sidebar */}
          <div className="lg:col-span-1">
            <RallySelector
              rallies={completedRallies}
              selectedRallyId={selectedRally}
              onSelectRally={setSelectedRally}
              isLoading={ralliesLoading}
              error={ralliesError}
            />
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2">
            {selectedRally && selectedRallyData ? (
              <div className="space-y-6">
                {/* Rally Header with Stats */}
                <RallyHeader
                  rally={selectedRallyData}
                  participants={participants}
                />

                {/* Results Entry Interface */}
                <ResultsEntryInterface
                  rallyId={selectedRally}
                  participants={participants}
                  events={events}
                  isLoading={participantsLoading}
                />
              </div>
            ) : (
              <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8 text-center">
                <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl text-slate-500">🏁</span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Vali ralli</h3>
                <p className="text-slate-400 mb-4">
                  Vali vasakult ralli, et näha osalejaid ja sisestada tulemusi.
                </p>
                {completedRallies.length === 0 && (
                  <div className="mt-4 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                    <p className="text-blue-400 text-sm">
                      💡 Vihje: Loo Rally Management lehel uus ralli ja määra selle kuupäev minevikku, et see ilmuks siia.
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