// src/components/registration/RallyDetails.tsx - CLEANED VERSION
'use client'

import { TransformedRally } from '@/hooks/useOptimizedRallies'

interface RallyDetailsProps {
  rally: TransformedRally | null
  isLoading: boolean
}

export function RallyDetails({ rally, isLoading }: RallyDetailsProps) {
  if (isLoading) {
    return (
      <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-slate-600 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-400">Loading rally details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!rally) {
    return (
      <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl text-slate-500">🏁</span>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Select a Rally</h3>
          <p className="text-slate-400">
            Choose a game and rally to see detailed information here.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8 space-y-6">
      {/* Rally Header */}
      <div className="flex items-start space-x-4">
        <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
          <span className="text-blue-400 text-xl">🏁</span>
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-white">{rally.name}</h3>
          <p className="text-slate-400">{rally.game_name}</p>
          <p className="text-sm text-slate-500">{rally.game_type_name}</p>
          
          {rally.is_featured && (
            <span className="mt-2 inline-block px-2 py-1 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-full text-xs font-medium">
              ⭐ FEATURED RALLY
            </span>
          )}
        </div>
      </div>

      {/* Rally Schedule */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-white">Schedule</h4>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Competition Date</span>
            <span className="text-slate-300 font-medium">
              {new Date(rally.competition_date).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Registration Deadline</span>
            <span className="text-slate-300 font-medium">
              {new Date(rally.registration_deadline).toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Status</span>
            <span className="px-3 py-1 bg-green-500/20 text-green-400 border border-green-500/30 rounded-full text-xs font-medium">
              {rally.status.replace('_', ' ').toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* Rally Information - CLEANED (removed prize_pool, entry_fee) */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-white">Rally Information</h4>
        
        <div className="space-y-3">
          {rally.max_participants && (
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Max Participants</span>
              <span className="text-slate-300 font-medium">{rally.max_participants}</span>
            </div>
          )}
          
          {rally.registered_participants !== undefined && (
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Current Registrations</span>
              <span className="text-slate-300 font-medium">{rally.registered_participants}</span>
            </div>
          )}

          {rally.total_events !== undefined && rally.total_events > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Events</span>
              <span className="text-slate-300 font-medium">{rally.total_events}</span>
            </div>
          )}

          {rally.total_tracks !== undefined && rally.total_tracks > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Total Tracks</span>
              <span className="text-slate-300 font-medium">{rally.total_tracks}</span>
            </div>
          )}
        </div>
      </div>

      {/* Rally Description */}
      {rally.description && (
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-white">Description</h4>
          <p className="text-slate-300 leading-relaxed">{rally.description}</p>
        </div>
      )}

      {/* Rally Rules */}
      {rally.rules && (
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-white">Rules</h4>
          <div className="bg-slate-700/30 rounded-lg p-4">
            <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{rally.rules}</p>
          </div>
        </div>
      )}

      {/* Events Preview */}
      {rally.events && rally.events.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-white">Events ({rally.events.length})</h4>
          <div className="space-y-2">
            {rally.events.map((event, index) => (
              <div key={event.event_id} className="flex items-center space-x-3 text-sm">
                <span className="w-6 h-6 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center text-xs font-medium">
                  {index + 1}
                </span>
                <span className="text-slate-300">{event.event_name}</span>
                {event.tracks && event.tracks.length > 0 && (
                  <span className="text-slate-500">
                    ({event.tracks.length} {event.tracks.length === 1 ? 'track' : 'tracks'})
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}