// src/components/registration/RallyDetails.tsx
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
        </div>
      </div>

      {/* Rally Schedule */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-white">Ajakava</h4>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Võistluse kuupäev</span>
            <span className="text-slate-300 font-medium">
              {new Date(rally.competition_date).toLocaleDateString('et-EE', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Registreerimise tähtaeg</span>
            <span className="text-slate-300 font-medium">
              {new Date(rally.registration_deadline).toLocaleDateString('et-EE', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Participation Info */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-white">Osalejad</h4>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Registreerunuid</span>
            <span className="text-green-400 font-medium">
              {rally.registered_participants || 0}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Maksimaalne arv</span>
            <span className="text-slate-300 font-medium">
              {rally.max_participants || 'Piiranguta'}
            </span>
          </div>
          
          {rally.max_participants && (
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${Math.min(((rally.registered_participants || 0) / rally.max_participants) * 100, 100)}%` 
                }}
              ></div>
            </div>
          )}
        </div>
      </div>

      {/* Events Information */}
      {rally.total_events && rally.total_events > 0 && (
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-white">Riigid</h4>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Kokku riike</span>
              <span className="text-slate-300 font-medium">{rally.total_events}</span>
            </div>
            
            {rally.events && rally.events.length > 0 && (
              <div>
                <p className="text-slate-400 text-sm mb-3">Rallid:</p>
                <div className="space-y-2">
                  {rally.events.map((event, index) => (
                    <div key={index} className="bg-slate-700/30 rounded-lg p-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                          <span className="text-blue-400 text-sm">🏁</span>
                        </div>
                        <div className="flex-1">
                          <span className="text-slate-200 font-medium">
                            {event.event_name || `Rally ${index + 1}`}
                          </span>
                          {event.country && (
                            <p className="text-xs text-slate-400 mt-1">
                              {event.country}
                            </p>
                          )}
                          {event.surface_type && (
                            <p className="text-xs text-slate-500 mt-1">
                              Pind: {event.surface_type}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Description */}
      {rally.description && (
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-white">Kirjeldus</h4>
          <p className="text-slate-300 text-sm leading-relaxed">
            {rally.description}
          </p>
        </div>
      )}

      {/* Rules */}
      {rally.rules && (
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-white">Reeglid</h4>
          <div className="bg-slate-700/30 rounded-lg p-4">
            <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
              {rally.rules}
            </p>
          </div>
        </div>
      )}

      {/* Registration Status */}
      <div className="border-t border-slate-700 pt-6">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-green-400 font-medium">Registreerimine avatud</span>
        </div>
        <p className="text-slate-400 text-sm mt-2">
          Täitke vorm selle ralli jaoks registreerumiseks
        </p>
      </div>
    </div>
  )
}