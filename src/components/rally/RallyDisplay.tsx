'use client'

import { RealRally } from '@/hooks/useOptimizedRallies'

interface RallyDisplayProps {
  rallies: RealRally[]
  showLimit?: number
  showRegistration?: boolean
  onRegister?: (rally: RealRally) => void
}

export function RallyDisplay({ rallies, showLimit, showRegistration = false, onRegister }: RallyDisplayProps) {
  const displayRallies = showLimit ? rallies.slice(0, showLimit) : rallies

  if (rallies.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-4xl text-slate-500">🏁</span>
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">No Upcoming Rallies</h3>
        <p className="text-slate-400">
          Check back soon for new rally announcements!
        </p>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'registration_open': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'registration_closed': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30'
    }
  }

  const isRegistrationOpen = (rally: RealRally) => {
    const now = new Date()
    const deadline = new Date(rally.registration_deadline)
    return rally.status === 'registration_open' || 
           (rally.status === 'upcoming' && deadline > now)
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {displayRallies.map((rally) => (
        <div
          key={rally.id}
          className="bg-slate-800/30 backdrop-blur-xl rounded-xl border border-slate-700/50 p-6 hover:bg-slate-800/40 transition-all duration-200"
        >
          {/* Rally Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <span className="text-blue-400 text-xl">🏁</span>
              </div>
              <div>
                <h3 className="font-semibold text-white">{rally.name}</h3>
                <p className="text-sm text-slate-400">{rally.game_name}</p>
              </div>
            </div>
            
            {rally.is_featured && (
              <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-full text-xs font-medium">
                ⭐ FEATURED
              </span>
            )}
          </div>

          {/* Rally Status */}
          <div className="mb-4">
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(rally.status)}`}>
              {rally.status.replace('_', ' ').toUpperCase()}
            </span>
          </div>

          {/* Rally Info */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center space-x-2 text-sm">
              <span className="text-slate-400">🎮</span>
              <span className="text-slate-300">{rally.game_type_name}</span>
            </div>
            
            <div className="flex items-center space-x-2 text-sm">
              <span className="text-slate-400">📅</span>
              <span className="text-slate-300">
                {new Date(rally.competition_date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
            
            <div className="flex items-center space-x-2 text-sm">
              <span className="text-slate-400">⏰</span>
              <span className="text-slate-300">
                Registration until {new Date(rally.registration_deadline).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>

            <div className="flex items-center space-x-2 text-sm">
              <span className="text-slate-400">👥</span>
              <span className="text-slate-300">
                {rally.registered_participants || 0} / {rally.max_participants || '∞'} participants
              </span>
            </div>

            {rally.total_events && rally.total_events > 0 && (
              <div className="flex items-center space-x-2 text-sm">
                <span className="text-slate-400">🌍</span>
                <span className="text-slate-300">
                  {rally.total_events} events, {rally.total_tracks || 0} tracks
                </span>
              </div>
            )}

            {rally.prize_pool && rally.prize_pool > 0 && (
              <div className="flex items-center space-x-2 text-sm">
                <span className="text-slate-400">💰</span>
                <span className="text-green-400 font-medium">€{rally.prize_pool} prize pool</span>
              </div>
            )}

            {rally.entry_fee && rally.entry_fee > 0 && (
              <div className="flex items-center space-x-2 text-sm">
                <span className="text-slate-400">💳</span>
                <span className="text-slate-300">€{rally.entry_fee} entry fee</span>
              </div>
            )}
          </div>

          {/* Rally Description */}
          {rally.description && (
            <div className="mb-4">
              <p className="text-slate-300 text-sm line-clamp-2">{rally.description}</p>
            </div>
          )}

          {/* Rally Actions */}
          <div className="flex space-x-3">
            {showRegistration && isRegistrationOpen(rally) ? (
              <button 
                onClick={() => onRegister?.(rally)}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-all duration-200"
              >
                Register Now
              </button>
            ) : showRegistration ? (
              <button 
                disabled
                className="flex-1 px-4 py-2 bg-slate-600 text-slate-400 rounded-lg text-sm font-medium cursor-not-allowed"
              >
                Registration Closed
              </button>
            ) : (
              <button className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-all duration-200">
                View Details
              </button>
            )}
            
            <button className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm font-medium transition-all duration-200">
              Details
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}