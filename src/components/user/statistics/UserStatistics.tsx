// Fixed UserStatistics component that accepts userId prop
'use client'

import { useAuth } from '@/components/AuthProvider'
import { useUserStatistics, useUpdateUserStatistics } from '@/hooks/useUserStatistics'

interface UserStatisticsProps {
  userId?: string // NEW: Allow passing userId to view any user's statistics
  showRefreshButton?: boolean // NEW: Option to hide refresh button for public views
}

export function UserStatistics({ userId, showRefreshButton = true }: UserStatisticsProps) {
  const { user } = useAuth()
  
  // Use passed userId or fall back to current user's ID
  const targetUserId = userId || user?.id || ''
  
  // Only allow refresh for current user's own statistics
  const canRefresh = showRefreshButton && user?.id === targetUserId
  
  const { 
    data: statistics, 
    isLoading, 
    error, 
    refetch 
  } = useUserStatistics(targetUserId)

  const updateStatsMutation = useUpdateUserStatistics()

  const handleRefreshStats = () => {
    if (canRefresh && targetUserId) {
      updateStatsMutation.mutate(targetUserId)
    }
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {[...Array(7)].map((_, index) => (
            <div
              key={index}
              className={`flex justify-between items-center p-3 bg-slate-800/20 backdrop-blur-sm border border-slate-700/20 rounded-lg animate-pulse ${
                index === 3 ? 'bg-gradient-to-r from-blue-600/10 to-purple-600/10' : ''
              }`}
            >
              <span className="text-slate-400 text-sm">Laadimine...</span>
              <div className="w-6 h-4 bg-slate-600/50 rounded"></div>
            </div>
          ))}
        </div>
        <div className="text-center">
          <span className="text-xs text-slate-500">Arvutan statistikat...</span>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-700/30 rounded-lg p-4 text-center">
        <span className="text-red-300 text-sm">❌ Statistika laadimine ebaõnnestus</span>
        {canRefresh && (
          <div className="flex justify-center space-x-2 mt-2">
            <button
              onClick={() => refetch()}
              className="text-xs text-red-200 hover:text-red-100 underline"
            >
              Proovi uuesti
            </button>
            <button
              onClick={handleRefreshStats}
              disabled={updateStatsMutation.isPending}
              className="text-xs text-red-200 hover:text-red-100 underline disabled:opacity-50"
            >
              Värskenda cache
            </button>
          </div>
        )}
      </div>
    )
  }

  // Show no data state
  if (!statistics) {
    return (
      <div className="bg-slate-800/20 border border-slate-700/30 rounded-lg p-4 text-center">
        <span className="text-slate-400 text-sm">Statistika pole saadaval</span>
      </div>
    )
  }

  // Show statistics
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {/* Left Column - Participation Stats */}
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-slate-800/30 backdrop-blur-sm border border-slate-700/30 rounded-lg">
            <span className="text-slate-300 text-sm">Treeningutel osalenud:</span>
            <span className="text-white font-semibold">{statistics.trainings}</span>
          </div>

          <div className="flex justify-between items-center p-3 bg-slate-800/30 backdrop-blur-sm border border-slate-700/30 rounded-lg">
            <span className="text-slate-300 text-sm">Tavaüritustel osalenud:</span>
            <span className="text-white font-semibold">{statistics.regularRallies}</span>
          </div>

          <div className="flex justify-between items-center p-3 bg-slate-800/30 backdrop-blur-sm border border-slate-700/30 rounded-lg">
            <span className="text-slate-300 text-sm">Tiitlivõistlustel osalenud:</span>
            <span className="text-white font-semibold">{statistics.championshipRallies}</span>
          </div>

          <div className="flex justify-between items-center p-3 bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm border border-blue-400/30 rounded-lg">
            <span className="text-blue-200 font-medium text-sm">Kokku osalemisi:</span>
            <span className="text-white font-bold">{statistics.totalParticipations}</span>
          </div>
        </div>

        {/* Right Column - Achievement Stats */}
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-slate-800/30 backdrop-blur-sm border border-slate-700/30 rounded-lg">
            <span className="text-slate-300 text-sm">Meistrivõistluste tiitleid:</span>
            <span className="text-white font-semibold">{statistics.championshipTitles}</span>
          </div>

          <div className="flex justify-between items-center p-3 bg-slate-800/30 backdrop-blur-sm border border-slate-700/30 rounded-lg">
            <span className="text-slate-300 text-sm">Võidetud rallisid:</span>
            <span className="text-white font-semibold">{statistics.rallyWins}</span>
          </div>

          <div className="flex justify-between items-center p-3 bg-slate-800/30 backdrop-blur-sm border border-slate-700/30 rounded-lg">
            <span className="text-slate-300 text-sm">Poodiumi kohti:</span>
            <span className="text-white font-semibold">{statistics.podiumFinishes}</span>
          </div>

          {/* Empty space to align with left column */}
          <div className="p-3"></div>
        </div>
      </div>

      {/* Cache Status and Refresh - Only show for own statistics */}
      {canRefresh && statistics.lastCalculatedAt && (
        <div className="flex items-center justify-between p-2 bg-slate-800/20 border border-slate-700/20 rounded-lg">
          <span className="text-xs text-slate-500">
            Viimati uuendatud: {new Date(statistics.lastCalculatedAt).toLocaleDateString('et-EE')}
          </span>
          <button
            onClick={handleRefreshStats}
            disabled={updateStatsMutation.isPending}
            className="text-xs text-blue-400 hover:text-blue-300 disabled:opacity-50"
          >
            {updateStatsMutation.isPending ? '🔄' : '↻'} Värskenda
          </button>
        </div>
      )}
    </div>
  )
}