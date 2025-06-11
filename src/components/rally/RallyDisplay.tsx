'use client'

interface Rally {
  rally_id: string
  rally_game_id: string
  rally_type_id: string
  rally_date: string
  registration_ending_date: string
  optional_notes?: string
  created_by: string
  created_at: string
  updated_at: string
  game_name: string
  type_name: string
  events: Array<{
    event_id: string
    event_name: string
    event_order: number
    country?: string
    surface_type?: string
  }>
  creator_name?: string
}

interface RallyDisplayProps {
  rallies: Rally[]
  showLimit?: number
}

export function RallyDisplay({ rallies, showLimit }: RallyDisplayProps) {
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

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {displayRallies.map((rally) => (
        <div
          key={rally.rally_id}
          className="bg-slate-800/30 backdrop-blur-xl rounded-xl border border-slate-700/50 p-6 hover:bg-slate-800/40 transition-all duration-200"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <span className="text-blue-400 text-xl">🏁</span>
              </div>
              <div>
                <h3 className="font-semibold text-white">{rally.game_name}</h3>
                <p className="text-sm text-slate-400">{rally.type_name}</p>
              </div>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex items-center space-x-2 text-sm">
              <span className="text-slate-400">📅</span>
              <span className="text-slate-300">
                {new Date(rally.rally_date).toLocaleDateString('en-US', {
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
                Registration until {new Date(rally.registration_ending_date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>

            {rally.optional_notes && (
              <div className="flex items-start space-x-2 text-sm">
                <span className="text-slate-400 mt-0.5">📝</span>
                <span className="text-slate-300">{rally.optional_notes}</span>
              </div>
            )}
          </div>

          <div className="flex space-x-3">
            <button className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-all duration-200">
              Register
            </button>
            <button className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm font-medium transition-all duration-200">
              Details
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}