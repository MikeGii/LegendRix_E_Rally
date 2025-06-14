// src/components/registration/RallyDetails.tsx - Updated with Unified Theme and Estonian
'use client'

import { TransformedRally } from '@/hooks/useOptimizedRallies'

interface RallyDetailsProps {
  rally: TransformedRally | null
}

export function RallyDetails({ rally }: RallyDetailsProps) {
  if (!rally) {
    return (
      <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8">
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl text-slate-500">🏁</span>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Ralli ei leitud</h3>
          <p className="text-slate-400">Valitud ralli andmeid ei õnnestunud laadida.</p>
        </div>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'registration_open': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'registration_closed': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'active': return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
      case 'completed': return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      case 'cancelled': return 'bg-red-500/20 text-red-400 border-red-500/30'
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'upcoming': return 'Tulemas'
      case 'registration_open': return 'Registreerimine avatud'
      case 'registration_closed': return 'Registreerimine suletud'
      case 'active': return 'Käimasolev'
      case 'completed': return 'Lõppenud'
      case 'cancelled': return 'Tühistatud'
      default: return status
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('et-EE', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatShortDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('et-EE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  // Calculate days until registration deadline
  const daysUntilDeadline = () => {
    const now = new Date()
    const deadline = new Date(rally.registration_deadline)
    const diffTime = deadline.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const deadlineDays = daysUntilDeadline()

  return (
    <div className="space-y-6">
      {/* Rally Header Card */}
      <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
        <div className="flex items-start space-x-4">
          <div className="w-16 h-16 bg-blue-500/20 rounded-xl flex items-center justify-center">
            <span className="text-blue-400 text-2xl">🏁</span>
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-white mb-2">{rally.name}</h3>
            <div className="flex items-center space-x-3 mb-3">
              <span className="text-slate-300 font-medium">{rally.game_name}</span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400">{rally.game_type_name}</span>
            </div>
            
            <div className="flex items-center space-x-3">
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(rally.status)}`}>
                {getStatusText(rally.status)}
              </span>
              
              {rally.is_featured && (
                <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-full text-xs font-medium">
                  ⭐ ESILETÕSTETUD
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        {rally.description && (
          <div className="mt-4 pt-4 border-t border-slate-700/50">
            <p className="text-slate-300">{rally.description}</p>
          </div>
        )}
      </div>

      {/* Rally Schedule */}
      <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
            <span className="text-green-400 text-lg">📅</span>
          </div>
          <h4 className="text-lg font-semibold text-white">Ajakava</h4>
        </div>
        
        <div className="space-y-4">
          <div className="bg-slate-900/50 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-medium">Võistluse kuupäev</span>
              <span className="text-slate-200 font-medium">
                {formatDate(rally.competition_date)}
              </span>
            </div>
          </div>
          
          <div className="bg-slate-900/50 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-medium">Registreerimise tähtaeg</span>
              <div className="text-right">
                <span className="text-slate-200 font-medium block">
                  {formatDate(rally.registration_deadline)}
                </span>
                {deadlineDays > 0 && (
                  <span className="text-blue-400 text-sm">
                    {deadlineDays} päeva jäänud
                  </span>
                )}
                {deadlineDays === 0 && (
                  <span className="text-yellow-400 text-sm">Täna viimane päev!</span>
                )}
                {deadlineDays < 0 && (
                  <span className="text-red-400 text-sm">Tähtaeg möödunud</span>
                )}
              </div>
            </div>
          </div>
          
          <div className="bg-slate-900/50 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-medium">Olek</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(rally.status)}`}>
                {getStatusText(rally.status)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Rally Information */}
      <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
            <span className="text-purple-400 text-lg">📊</span>
          </div>
          <h4 className="text-lg font-semibold text-white">Ralli info</h4>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          {rally.max_participants && (
            <div className="bg-slate-900/50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-white mb-1">{rally.max_participants}</div>
              <div className="text-sm text-slate-400">Max osalejat</div>
            </div>
          )}
          
          <div className="bg-slate-900/50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-green-400 mb-1">{rally.registered_participants || 0}</div>
            <div className="text-sm text-slate-400">Registreeritud</div>
          </div>
          
          {rally.total_events !== undefined && (
            <div className="bg-slate-900/50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-blue-400 mb-1">{rally.total_events}</div>
              <div className="text-sm text-slate-400">
                {rally.total_events === 1 ? 'Sündmus' : 'Sündmused'}
              </div>
            </div>
          )}

          {rally.total_tracks !== undefined && (
            <div className="bg-slate-900/50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-yellow-400 mb-1">{rally.total_tracks}</div>
              <div className="text-sm text-slate-400">
                {rally.total_tracks === 1 ? 'Rada' : 'Rajad'}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Rally Events Preview */}
      {rally.events && rally.events.length > 0 && (
        <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center">
              <span className="text-orange-400 text-lg">🏁</span>
            </div>
            <h4 className="text-lg font-semibold text-white">Sündmused</h4>
          </div>
          
          <div className="space-y-3">
            {rally.events.slice(0, 3).map((event, index) => (
              <div key={index} className="bg-slate-900/50 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center">
                      <span className="text-orange-400 text-sm">{event.event_order || index + 1}</span>
                    </div>
                    <div>
                      <h5 className="font-medium text-white">{event.event_name}</h5>
                      {event.tracks && event.tracks.length > 0 && (
                        <p className="text-sm text-slate-400">
                          {event.tracks.length} {event.tracks.length === 1 ? 'rada' : 'rada'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {rally.events.length > 3 && (
              <div className="text-center py-2">
                <span className="text-slate-400 text-sm">
                  ... ja veel {rally.events.length - 3} sündmust
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Rally Rules */}
      {rally.rules && (
        <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center">
              <span className="text-red-400 text-lg">📋</span>
            </div>
            <h4 className="text-lg font-semibold text-white">Reeglid</h4>
          </div>
          
          <div className="bg-slate-900/50 rounded-xl p-4">
            <p className="text-slate-300 whitespace-pre-wrap">{rally.rules}</p>
          </div>
        </div>
      )}
    </div>
  )
}