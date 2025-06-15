// src/app/results/page.tsx - Results Management Page with Unified Layout
'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useCompletedRallies } from '@/hooks/useResultsManagement'
import { LoadingState } from '@/components/shared/States'
import { DashboardLayout } from '@/components/DashboardLayout'
import { AdminPageHeader } from '@/components/shared/AdminPageHeader'
import { ProtectedRoute } from '@/components/ProtectedRoute'

interface CompletedRally {
  id: string
  name: string
  competition_date: string
  participant_count: number
  results_needed_since?: string
  results_completed: boolean
  game_name?: string
  game_type_name?: string
}

function ResultsPageContent() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [selectedRally, setSelectedRally] = useState<string | null>(null)

  const { 
    data: completedRallies = [], 
    isLoading: ralliesLoading,
    error: ralliesError,
    refetch: refetchRallies
  } = useCompletedRallies()

  if (ralliesLoading) {
    return <LoadingState message="Laen lõppenud rallisid..." />
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('et-EE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTimeAgo = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)

    if (diffDays > 0) {
      return `${diffDays} päev${diffDays > 1 ? 'a' : ''} tagasi`
    } else if (diffHours > 0) {
      return `${diffHours} tund${diffHours > 1 ? 'i' : ''} tagasi`
    } else {
      return 'Äsja'
    }
  }

  // Stats for the header
  const stats = [
    {
      label: 'Lõppenud rallid',
      value: completedRallies.length,
      color: 'blue' as const
    },
    {
      label: 'Vajab tulemusi',
      value: completedRallies.filter(r => !r.results_completed).length,
      color: 'yellow' as const
    },
    {
      label: 'Tulemused sisestatud',
      value: completedRallies.filter(r => r.results_completed).length,
      color: 'green' as const
    }
  ]

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Admin Page Header */}
      <AdminPageHeader
        title="Tulemuste Haldus"
        description="Halda lõppenud rallidevtulemusi ja sisesta punkte"
        icon="🏆"
        stats={stats}
        onRefresh={refetchRallies}
        isLoading={ralliesLoading}
      />

      {/* Error State */}
      {ralliesError && (
        <div className="bg-red-900/20 border border-red-800/50 rounded-lg p-4">
          <p className="text-red-400">
            Viga rallidevlaadimisel: {ralliesError.message}
          </p>
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Completed Rallies List */}
        <div className="lg:col-span-1">
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <span className="mr-2">🏁</span>
              Lõppenud Rallid
            </h2>
            
            {completedRallies.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-3">📋</div>
                <p className="text-slate-400 text-sm">
                  Pole lõppenud rallisid, mis vajaksid tulemuste sisestamist
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {completedRallies.map((rally: CompletedRally) => (
                  <div
                    key={rally.id}
                    onClick={() => setSelectedRally(rally.id)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      selectedRally === rally.id
                        ? 'bg-blue-600/20 border-blue-500/50'
                        : 'bg-slate-700/30 border-slate-600/30 hover:bg-slate-700/50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-white text-sm">
                        {rally.name}
                      </h3>
                      {!rally.results_completed && (
                        <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-1 rounded">
                          Vajab tähelepanu
                        </span>
                      )}
                      {rally.results_completed && (
                        <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">
                          Valmis
                        </span>
                      )}
                    </div>
                    
                    <div className="text-xs text-slate-400 space-y-1">
                      <div>📅 {formatDate(rally.competition_date)}</div>
                      <div>👥 {rally.participant_count} osavõtjat</div>
                      {rally.game_name && (
                        <div>🎮 {rally.game_name}</div>
                      )}
                      {rally.results_needed_since && !rally.results_completed && (
                        <div className="text-orange-400">
                          ⏰ Lõppes {getTimeAgo(rally.results_needed_since)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Rally Details & Results Entry */}
        <div className="lg:col-span-2">
          {selectedRally ? (
            <RallyResultsPanel rallyId={selectedRally} />
          ) : (
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-xl p-8">
              <div className="text-center">
                <div className="text-6xl mb-4">🏆</div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Vali ralli tulemuste haldamiseks
                </h3>
                <p className="text-slate-400">
                  Kliki vasakul asuvale rallile, et sisestada või muuta tulemusi
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Rally Results Panel Component
function RallyResultsPanel({ rallyId }: { rallyId: string }) {
  return (
    <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white flex items-center">
          <span className="mr-2">📊</span>
          Tulemuste Sisestamine
        </h2>
        
        <div className="flex space-x-2">
          <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm">
            Salvesta Tulemused
          </button>
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm">
            Eelvaade
          </button>
        </div>
      </div>

      {/* Rally Info */}
      <div className="bg-slate-700/30 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-medium text-white mb-2">
          Rally ID: {rallyId}
        </h3>
        <p className="text-slate-400 text-sm">
          Siin kuvatakse ralli üksikasjad ja osalejate nimekiri punktide sisestamiseks.
        </p>
      </div>

      {/* Participants Table Placeholder */}
      <div className="bg-slate-700/30 rounded-lg p-6">
        <h4 className="text-md font-medium text-white mb-4">
          Osalejad ja Punktid
        </h4>
        
        <div className="text-center py-12">
          <div className="text-4xl mb-3">🔧</div>
          <p className="text-slate-400">
            Tulemuste sisestamise vorm tuleb järgmises etapis
          </p>
        </div>
      </div>
    </div>
  )
}

// Main Export with Protection and Layout
export default function ResultsPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <DashboardLayout>
        <ResultsPageContent />
      </DashboardLayout>
    </ProtectedRoute>
  )
}