// src/components/user/achievements/UserAchievements.tsx - REDESIGNED WITH FUTURISTIC BLACK-RED-GRAY THEME
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
  userId?: string
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
              className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-4 animate-pulse"
            >
              <div className="flex items-center space-x-3">
                <div className="w-14 h-14 bg-gray-700/50 rounded-xl"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-700/50 rounded mb-2"></div>
                  <div className="h-3 bg-gray-700/30 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center">
          <div className="inline-flex items-center space-x-2 text-gray-500 font-['Orbitron'] text-xs uppercase tracking-wider">
            <div className="w-4 h-4 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin"></div>
            <span>Laadin saavutusi...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-gradient-to-r from-red-900/30 to-red-800/20 border border-red-500/30 rounded-xl p-6 text-center shadow-[0_0_20px_rgba(239,68,68,0.3)]">
        <div className="text-red-400 text-sm mb-3 font-['Orbitron'] uppercase tracking-wider">❌ Saavutuste laadimine ebaõnnestus</div>
        <button
          onClick={() => refetch()}
          className="text-xs text-red-300 hover:text-red-200 underline font-['Orbitron'] uppercase tracking-wider"
        >
          Proovi uuesti
        </button>
      </div>
    )
  }

  const earnedAchievements = achievements.filter(a => a.earned)
  const availableAchievements = achievements.filter(a => !a.earned)

  return (
    <div className="space-y-8">
      {/* Achievement Stats Header */}
      <div className="tech-border rounded-xl shadow-[0_0_20px_rgba(255,0,64,0.2)] bg-black/60 backdrop-blur-xl p-6 relative overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-[0.02] pointer-events-none"></div>
        
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h5 className="text-lg font-bold text-white font-['Orbitron'] uppercase tracking-wider mb-1">
              Saavutused
            </h5>
            <p className="text-sm text-gray-400">
              <span className="text-red-400 font-bold">{earnedAchievements.length}</span>
              <span className="text-gray-500"> / </span>
              <span className="text-gray-300">{achievements.length}</span>
              <span className="text-gray-500 ml-2">teenitud</span>
            </p>
          </div>
          <div className="relative">
            <div className="text-5xl opacity-80">
              {earnedAchievements.length > 0 ? '🏆' : '🎯'}
            </div>
            {earnedAchievements.length > 0 && (
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-[0_0_10px_rgba(255,0,64,0.8)]">
                {earnedAchievements.length}
              </div>
            )}
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="mt-4">
          <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-red-600 to-red-500 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(255,0,64,0.5)]"
              style={{ width: `${(earnedAchievements.length / achievements.length) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Earned Achievements */}
      {earnedAchievements.length > 0 && (
        <div>
          <div className="flex items-center space-x-3 mb-4">
            <h6 className="text-sm font-bold text-white font-['Orbitron'] uppercase tracking-wider">
              🏆 Saavutatud ({earnedAchievements.length})
            </h6>
            <div className="flex-1 h-px bg-gradient-to-r from-green-500/50 via-gray-500/30 to-transparent"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {earnedAchievements.map((achievement, index) => (
              <AchievementCard 
                key={achievement.id} 
                achievement={achievement} 
                index={index}
              />
            ))}
          </div>
        </div>
      )}

      {/* Available Achievements */}
      {availableAchievements.length > 0 && (
        <div>
          <div className="flex items-center space-x-3 mb-4">
            <h6 className="text-sm font-bold text-white font-['Orbitron'] uppercase tracking-wider">
              🎯 Saadaval ({availableAchievements.length})
            </h6>
            <div className="flex-1 h-px bg-gradient-to-r from-gray-500/50 via-gray-500/30 to-transparent"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableAchievements.map((achievement, index) => (
              <AchievementCard 
                key={achievement.id} 
                achievement={achievement} 
                index={index + earnedAchievements.length}
              />
            ))}
          </div>
        </div>
      )}

      {/* No achievements state */}
      {achievements.length === 0 && (
        <div className="text-center py-16">
          <div className="w-32 h-32 bg-gradient-to-br from-red-900/50 to-gray-900/50 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-red-500/30 shadow-[0_0_40px_rgba(255,0,64,0.3)]">
            <span className="text-6xl opacity-80">🎯</span>
          </div>
          <h6 className="text-xl font-bold text-white mb-2 font-['Orbitron'] uppercase tracking-wider">
            Saavutusi pole veel
          </h6>
          <p className="text-gray-400">
            Osale rallides, et saavutusi teenida!
          </p>
        </div>
      )}
    </div>
  )
}

// Achievement Card Component with futuristic design
function AchievementCard({ achievement, index }: { achievement: Achievement; index: number }) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('et-EE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const getTypeStyles = (type: string, earned: boolean) => {
    if (!earned) {
      return {
        bg: 'bg-gradient-to-br from-gray-900/50 to-gray-800/30',
        border: 'border-gray-700/50',
        icon: 'bg-gray-800/50 border-gray-700/50',
        text: 'text-gray-400',
        glow: ''
      }
    }

    switch (type) {
      case 'championship':
        return {
          bg: 'bg-gradient-to-br from-purple-900/30 to-purple-800/20',
          border: 'border-purple-500/40',
          icon: 'bg-purple-900/40 border-purple-500/50',
          text: 'text-purple-300',
          glow: 'shadow-[0_0_20px_rgba(168,85,247,0.4)]'
        }
      case 'victory':
        return {
          bg: 'bg-gradient-to-br from-yellow-900/30 to-yellow-800/20',
          border: 'border-yellow-500/40',
          icon: 'bg-yellow-900/40 border-yellow-500/50',
          text: 'text-yellow-300',
          glow: 'shadow-[0_0_20px_rgba(234,179,8,0.4)]'
        }
      case 'participation':
        return {
          bg: 'bg-gradient-to-br from-blue-900/30 to-blue-800/20',
          border: 'border-blue-500/40',
          icon: 'bg-blue-900/40 border-blue-500/50',
          text: 'text-blue-300',
          glow: 'shadow-[0_0_20px_rgba(59,130,246,0.4)]'
        }
      default:
        return {
          bg: 'bg-gradient-to-br from-green-900/30 to-green-800/20',
          border: 'border-green-500/40',
          icon: 'bg-green-900/40 border-green-500/50',
          text: 'text-green-300',
          glow: 'shadow-[0_0_20px_rgba(34,197,94,0.4)]'
        }
    }
  }

  const styles = getTypeStyles(achievement.type, achievement.earned)

  return (
    <div
      className={`
        group relative overflow-hidden rounded-xl border transition-all duration-300
        ${styles.bg} ${styles.border} ${styles.glow}
        hover:scale-[1.02] ${achievement.earned ? 'hover:shadow-[0_0_30px_rgba(255,0,64,0.3)]' : ''}
      `}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Animated sweep effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none"></div>
      
      {/* Trophy glow for earned achievements */}
      {achievement.earned && (
        <div className="absolute top-2 right-2">
          <div className="relative">
            <span className="text-2xl opacity-50 absolute animate-ping">🏆</span>
            <span className="text-2xl relative">🏆</span>
          </div>
        </div>
      )}
      
      {/* Achievement Content */}
      <div className="relative p-5">
        <div className="flex items-start space-x-4">
          {/* Icon */}
          <div className={`
            w-14 h-14 rounded-xl flex items-center justify-center text-2xl flex-shrink-0
            ${styles.icon} backdrop-blur-sm group-hover:scale-110 transition-transform duration-300
          `}>
            {achievement.earned ? achievement.icon : achievement.icon}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h6 className={`
              font-bold text-sm mb-1 font-['Orbitron'] uppercase tracking-wider
              ${achievement.earned ? styles.text : 'text-gray-300'}
            `}>
              {achievement.title}
            </h6>
            
            <p className={`
              text-xs mb-2 leading-relaxed
              ${achievement.earned ? 'text-gray-300' : 'text-gray-500'}
            `}>
              {achievement.description}
            </p>

            <p className="text-xs text-gray-500 italic">
              {achievement.requirement}
            </p>

            {/* Progress bar for non-earned achievements */}
            {!achievement.earned && achievement.progress && (
              <div className="mt-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-500 font-['Orbitron'] uppercase tracking-wider">Progress</span>
                  <span className="text-gray-400 font-['Orbitron']">
                    {achievement.progress.current} / {achievement.progress.required}
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-800/50 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-red-600 to-red-500 rounded-full transition-all duration-500"
                    style={{ width: `${achievement.progress.percentage}%` }}
                  ></div>
                </div>
                <div className="text-right mt-1">
                  <span className="text-xs text-gray-500 font-['Orbitron']">
                    {achievement.progress.percentage}%
                  </span>
                </div>
              </div>
            )}

            {/* Earned date */}
            {achievement.earned && achievement.earnedAt && (
              <div className="mt-3 pt-3 border-t border-gray-800/50">
                <p className="text-xs text-green-400 font-['Orbitron'] uppercase tracking-wider">
                  ✅ Saavutatud: {formatDate(achievement.earnedAt)}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}