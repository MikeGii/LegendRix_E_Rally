// Fixed UserAchievements component that accepts userId prop
'use client'

import { useAuth } from '@/components/AuthProvider'
import { useUserAchievements } from '@/hooks/useUserAchievements'

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  type: 'training' | 'participation' | 'victory' | 'championship'
  requirement: string
  earned: boolean
  earnedAt?: string
  progress?: {
    current: number
    required: number
    percentage: number
  }
}

interface UserAchievementsProps {
  userId?: string // NEW: Allow passing userId to view any user's achievements
}

export function UserAchievements({ userId }: UserAchievementsProps) {
  const { user } = useAuth()
  
  // Use passed userId or fall back to current user's ID
  const targetUserId = userId || user?.id || ''
  
  const { 
    data: achievements = [], 
    isLoading, 
    error,
    refetch 
  } = useUserAchievements(targetUserId)

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, index) => (
            <div
              key={index}
              className="bg-slate-800/20 backdrop-blur-sm border border-slate-700/20 rounded-lg p-4 animate-pulse"
            >
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-slate-600/50 rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-4 bg-slate-600/50 rounded mb-2"></div>
                  <div className="h-3 bg-slate-600/30 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center">
          <span className="text-xs text-slate-500">Laadin saavutusi...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-700/30 rounded-lg p-4 text-center">
        <div className="text-red-300 text-sm mb-3">❌ Saavutuste laadimine ebaõnnestus</div>
        <button
          onClick={() => refetch()}
          className="text-xs text-red-200 hover:text-red-100 underline"
        >
          Proovi uuesti
        </button>
      </div>
    )
  }

  const earnedAchievements = achievements.filter(a => a.earned)
  const availableAchievements = achievements.filter(a => !a.earned)

  return (
    <div className="space-y-6">
      {/* Achievement Stats */}
      <div className="bg-gradient-to-r from-yellow-900/20 to-orange-900/20 backdrop-blur-sm border border-yellow-700/30 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <h5 className="text-sm font-medium text-yellow-200 mb-1">Saavutused</h5>
            <p className="text-xs text-yellow-300">
              {earnedAchievements.length} / {achievements.length} earned
            </p>
          </div>
          <div className="text-2xl">
            {earnedAchievements.length > 0 ? '🏆' : '🎯'}
          </div>
        </div>
      </div>

      {/* Earned Achievements */}
      {earnedAchievements.length > 0 && (
        <div>
          <h6 className="text-sm font-medium text-green-200 mb-3 flex items-center space-x-2">
            <span>🏆</span>
            <span>Saavutatud ({earnedAchievements.length})</span>
          </h6>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {earnedAchievements.map((achievement) => (
              <AchievementCard key={achievement.id} achievement={achievement} />
            ))}
          </div>
        </div>
      )}

      {/* Available Achievements */}
      {availableAchievements.length > 0 && (
        <div>
          <h6 className="text-sm font-medium text-slate-300 mb-3 flex items-center space-x-2">
            <span>🎯</span>
            <span>Saadaval ({availableAchievements.length})</span>
          </h6>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {availableAchievements.map((achievement) => (
              <AchievementCard key={achievement.id} achievement={achievement} />
            ))}
          </div>
        </div>
      )}

      {/* No achievements state */}
      {achievements.length === 0 && (
        <div className="text-center py-8">
          <div className="text-4xl mb-4">🎯</div>
          <h6 className="text-lg font-medium text-slate-300 mb-2">Saavutusi pole veel</h6>
          <p className="text-slate-400 text-sm">
            Osale rallides, et saavutusi teenida!
          </p>
        </div>
      )}
    </div>
  )
}

// Achievement Card Component
function AchievementCard({ achievement }: { achievement: Achievement }) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('et-EE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  return (
    <div className={`
      relative overflow-hidden rounded-lg border transition-all duration-200
      ${achievement.earned
        ? 'bg-gradient-to-br from-green-900/30 to-emerald-900/20 border-green-700/40 shadow-lg'
        : 'bg-slate-800/20 border-slate-700/30 hover:border-slate-600/40'
      }
    `}>
      {/* Achievement Content */}
      <div className="p-4">
        <div className="flex items-start space-x-3">
          {/* Icon */}
          <div className={`
            w-12 h-12 rounded-lg flex items-center justify-center text-xl flex-shrink-0
            ${achievement.earned
              ? 'bg-green-500/20 border border-green-400/30'
              : 'bg-slate-700/30 border border-slate-600/30'
            }
          `}>
            {achievement.earned ? '🏆' : achievement.icon}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h6 className={`
              font-medium text-sm mb-1
              ${achievement.earned ? 'text-green-200' : 'text-slate-300'}
            `}>
              {achievement.title}
            </h6>
            
            <p className={`
              text-xs mb-2
              ${achievement.earned ? 'text-green-300/80' : 'text-slate-400'}
            `}>
              {achievement.description}
            </p>

            <p className="text-xs text-slate-500">
              {achievement.requirement}
            </p>

            {/* Progress bar for non-earned achievements */}
            {!achievement.earned && achievement.progress && (
              <div className="mt-2">
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Progress</span>
                  <span>{achievement.progress.current} / {achievement.progress.required}</span>
                </div>
                <div className="w-full bg-slate-700/50 rounded-full h-1.5">
                  <div 
                    className="bg-blue-500 h-1.5 rounded-full transition-all duration-300" 
                    style={{ width: `${achievement.progress.percentage}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Earned date */}
            {achievement.earned && achievement.earnedAt && (
              <p className="text-xs text-green-400 mt-2">
                Saavutatud: {formatDate(achievement.earnedAt)}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}