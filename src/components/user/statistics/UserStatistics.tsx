// src/components/user/statistics/UserStatistics.tsx - REDESIGNED WITH FUTURISTIC BLACK-RED-GRAY THEME
'use client'

import { useAuth } from '@/components/AuthProvider'
import { useUserStatistics, useUpdateUserStatistics } from '@/hooks/useUserStatistics'

interface UserStatisticsProps {
  userId?: string
  showRefreshButton?: boolean
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
        <div className="grid grid-cols-2 gap-4">
          {[...Array(7)].map((_, index) => (
            <div
              key={index}
              className="flex justify-between items-center p-4 bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl animate-pulse"
            >
              <div className="h-4 bg-gray-700/50 rounded w-1/2"></div>
              <div className="h-6 bg-gray-700/50 rounded w-12"></div>
            </div>
          ))}
        </div>
        <div className="text-center">
          <div className="inline-flex items-center space-x-2 text-gray-500 font-['Orbitron'] text-xs uppercase tracking-wider">
            <div className="w-4 h-4 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin"></div>
            <span>Arvutan statistikat...</span>
          </div>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="bg-gradient-to-r from-red-900/30 to-red-800/20 border border-red-500/30 rounded-xl p-6 text-center shadow-[0_0_20px_rgba(239,68,68,0.3)]">
        <span className="text-red-400 font-['Orbitron'] uppercase tracking-wider text-sm">❌ Statistika laadimine ebaõnnestus</span>
        {canRefresh && (
          <div className="flex justify-center space-x-4 mt-4">
            <button
              onClick={() => refetch()}
              className="text-xs text-red-300 hover:text-red-200 underline font-['Orbitron'] uppercase tracking-wider"
            >
              Proovi uuesti
            </button>
            <button
              onClick={handleRefreshStats}
              disabled={updateStatsMutation.isPending}
              className="text-xs text-red-300 hover:text-red-200 underline disabled:opacity-50 font-['Orbitron'] uppercase tracking-wider"
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
      <div className="bg-gradient-to-r from-gray-900/30 to-gray-800/20 border border-gray-700/30 rounded-xl p-6 text-center">
        <span className="text-gray-400 font-['Orbitron'] uppercase tracking-wider text-sm">Statistika pole saadaval</span>
      </div>
    )
  }

  // Define stat cards with futuristic styling
  const statCards = [
    {
      category: 'Osalemised',
      stats: [
        { label: 'Treeningutel osalenud', value: statistics.trainings, icon: '🎯', color: 'gray' },
        { label: 'Tavaüritustel osalenud', value: statistics.regularRallies, icon: '🏁', color: 'gray' },
        { label: 'Tiitlivõistlustel osalenud', value: statistics.championshipRallies, icon: '🏆', color: 'gray' },
        { label: 'Kokku osalemisi', value: statistics.totalParticipations, icon: '📊', color: 'red', highlight: true }
      ]
    },
    {
      category: 'Saavutused',
      stats: [
        { label: 'Meistrivõistluste tiitleid', value: statistics.championshipTitles, icon: '👑', color: 'purple' },
        { label: 'Võidetud rallisid', value: statistics.rallyWins, icon: '🥇', color: 'yellow' },
        { label: 'Poodiumi kohti', value: statistics.podiumFinishes, icon: '🏅', color: 'orange' }
      ]
    }
  ]

  const getStatStyles = (color: string, highlight?: boolean) => {
    if (highlight) {
      return {
        bg: 'bg-gradient-to-r from-red-900/30 to-gray-900/20',
        border: 'border-red-500/50',
        text: 'text-red-400',
        value: 'text-white',
        glow: 'shadow-[0_0_20px_rgba(255,0,64,0.3)]'
      }
    }

    switch (color) {
      case 'purple':
        return {
          bg: 'bg-gradient-to-r from-purple-900/20 to-purple-800/10',
          border: 'border-purple-500/30',
          text: 'text-purple-400',
          value: 'text-purple-300',
          glow: 'hover:shadow-[0_0_15px_rgba(168,85,247,0.3)]'
        }
      case 'yellow':
        return {
          bg: 'bg-gradient-to-r from-yellow-900/20 to-yellow-800/10',
          border: 'border-yellow-500/30',
          text: 'text-yellow-400',
          value: 'text-yellow-300',
          glow: 'hover:shadow-[0_0_15px_rgba(234,179,8,0.3)]'
        }
      case 'orange':
        return {
          bg: 'bg-gradient-to-r from-orange-900/20 to-orange-800/10',
          border: 'border-orange-500/30',
          text: 'text-orange-400',
          value: 'text-orange-300',
          glow: 'hover:shadow-[0_0_15px_rgba(249,115,22,0.3)]'
        }
      default:
        return {
          bg: 'bg-gradient-to-r from-gray-900/30 to-gray-800/20',
          border: 'border-gray-700/50',
          text: 'text-gray-400',
          value: 'text-gray-300',
          glow: 'hover:shadow-[0_0_10px_rgba(156,163,175,0.2)]'
        }
    }
  }

  // Show statistics with futuristic design
  return (
    <div className="space-y-6">
      {/* Category sections */}
      {statCards.map((category, categoryIndex) => (
        <div key={category.category} className="space-y-4">
          {/* Category header */}
          <div className="flex items-center space-x-3">
            <h4 className="text-sm font-bold text-white font-['Orbitron'] uppercase tracking-wider">
              {category.category}
            </h4>
            <div className="flex-1 h-px bg-gradient-to-r from-red-500/50 via-gray-500/30 to-transparent"></div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {category.stats.map((stat, index) => {
              const styles = getStatStyles(stat.color, stat.highlight)
              return (
                <div
                  key={stat.label}
                  className={`
                    group relative overflow-hidden rounded-xl border transition-all duration-300
                    ${styles.bg} ${styles.border} ${styles.glow}
                    backdrop-blur-sm hover:scale-[1.02]
                  `}
                  style={{ animationDelay: `${(categoryIndex * 4 + index) * 50}ms` }}
                >
                  {/* Animated sweep effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none"></div>
                  
                  <div className="relative p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl opacity-80 group-hover:scale-110 transition-transform duration-300">
                        {stat.icon}
                      </span>
                      <span className={`${styles.text} text-sm font-medium`}>
                        {stat.label}:
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`${styles.value} text-2xl font-black font-['Orbitron'] tracking-wider`}>
                        {stat.value}
                      </span>
                      {stat.highlight && (
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(255,0,64,0.8)]"></div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}

      {/* Cache Status and Refresh - Only show for own statistics */}
      {canRefresh && statistics.lastCalculatedAt && (
        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-900/30 to-gray-800/20 border border-gray-800 rounded-xl backdrop-blur-sm">
          <span className="text-xs text-gray-500 font-['Orbitron'] uppercase tracking-wider">
            Viimati uuendatud: {new Date(statistics.lastCalculatedAt).toLocaleDateString('et-EE')}
          </span>
          <button
            onClick={handleRefreshStats}
            disabled={updateStatsMutation.isPending}
            className={`
              flex items-center space-x-2 px-3 py-1 rounded-lg border transition-all duration-300
              ${updateStatsMutation.isPending 
                ? 'bg-gray-900/50 border-gray-700 text-gray-500 cursor-not-allowed' 
                : 'bg-gray-900/50 border-gray-700 hover:border-red-500/50 text-gray-400 hover:text-red-400 hover:shadow-[0_0_10px_rgba(255,0,64,0.3)]'
              }
            `}
          >
            <span className={`text-sm ${updateStatsMutation.isPending ? 'animate-spin' : ''}`}>
              {updateStatsMutation.isPending ? '🔄' : '↻'}
            </span>
            <span className="text-xs font-['Orbitron'] uppercase tracking-wider">
              Värskenda
            </span>
          </button>
        </div>
      )}
    </div>
  )
}