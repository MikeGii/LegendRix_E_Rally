import { Rally, useDeleteRally } from '@/hooks/useRallyManagement'

interface RalliesGridProps {
  rallies: Rally[]
  isLoading: boolean
  onEditRally: (rally: Rally) => void
  onRefresh: () => void
}

export function RalliesGrid({ rallies, isLoading, onEditRally, onRefresh }: RalliesGridProps) {
  const deleteRallyMutation = useDeleteRally()

  const handleDeleteRally = async (rallyId: string, rallyName: string) => {
    if (!confirm(`Are you sure you want to delete "${rallyName}"? This will also delete all registrations and results.`)) {
      return
    }

    try {
      await deleteRallyMutation.mutateAsync(rallyId)
      onRefresh()
    } catch (error) {
      console.error('Failed to delete rally:', error)
      alert('Failed to delete rally. Please try again.')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'registration_open': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'registration_closed': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'active': return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      case 'completed': return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
      case 'cancelled': return 'bg-red-500/20 text-red-400 border-red-500/30'
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30'
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-slate-600 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading rallies...</p>
        </div>
      </div>
    )
  }

  if (rallies.length === 0) {
    return (
      <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-16">
        <div className="text-center">
          <div className="w-24 h-24 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl text-slate-500">🏁</span>
          </div>
          <h3 className="text-2xl font-bold text-white mb-4">No Rallies Created</h3>
          <p className="text-slate-400 mb-8 max-w-md mx-auto">
            Get started by creating your first rally competition. You'll need games, events, and classes set up first.
          </p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => window.location.href = '/game-management'}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all duration-200"
            >
              Setup Games First
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8">
      <h2 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
        <span>🏁</span>
        <span>All Rallies ({rallies.length})</span>
      </h2>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {rallies.map((rally) => (
          <div key={rally.id} className="bg-slate-900/50 rounded-xl border border-slate-700/30 p-6 hover:bg-slate-800/50 transition-all duration-200">
            {/* Rally Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                  <span className="text-green-300 text-xl">🏁</span>
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">{rally.name}</h3>
                  <p className="text-sm text-slate-400">{rally.game_name}</p>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => onEditRally(rally)}
                  className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/20 rounded-lg transition-all duration-200"
                  title="Edit Rally"
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleDeleteRally(rally.id, rally.name)}
                  className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/20 rounded-lg transition-all duration-200"
                  title="Delete Rally"
                >
                  🗑️
                </button>
              </div>
            </div>

            {/* Rally Status */}
            <div className="mb-4">
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(rally.status)}`}>
                {rally.status.replace('_', ' ').toUpperCase()}
              </span>
              {rally.is_featured && (
                <span className="ml-2 px-2 py-1 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-full text-xs font-medium">
                  ⭐ FEATURED
                </span>
              )}
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
                  Reg. deadline: {new Date(rally.registration_deadline).toLocaleDateString('en-US', {
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

              <div className="flex items-center space-x-2 text-sm">
                <span className="text-slate-400">🌍</span>
                <span className="text-slate-300">
                  {rally.total_events || 0} events, {rally.total_tracks || 0} tracks
                </span>
              </div>

              {rally.prize_pool && rally.prize_pool > 0 && (
                <div className="flex items-center space-x-2 text-sm">
                  <span className="text-slate-400">💰</span>
                  <span className="text-green-400 font-medium">€{rally.prize_pool} prize pool</span>
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
              <button 
                onClick={() => onEditRally(rally)}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-all duration-200"
              >
                Edit Rally
              </button>
              <button className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm font-medium transition-all duration-200">
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}