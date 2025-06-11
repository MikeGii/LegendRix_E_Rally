// src/components/rally/EnhancedRallyDisplay.tsx
'use client'

import { useState } from 'react'
import { TransformedRally, RallyEventDetail, RallyClassDetail } from '@/hooks/useOptimizedRallies'

interface EnhancedRallyDisplayProps {
  rallies: TransformedRally[]
  showLimit?: number
  showRegistration?: boolean
  onRegister?: (rally: TransformedRally, classId: string) => void
  onViewDetails?: (rally: TransformedRally) => void
}

interface RallyModalProps {
  rally: TransformedRally
  onClose: () => void
  onRegister?: (rally: TransformedRally, classId: string) => void
}

export function EnhancedRallyDisplay({ 
  rallies, 
  showLimit, 
  showRegistration = false, 
  onRegister,
  onViewDetails 
}: EnhancedRallyDisplayProps) {
  const [selectedRally, setSelectedRally] = useState<TransformedRally | null>(null)
  const displayRallies = showLimit ? rallies.slice(0, showLimit) : rallies

  if (rallies.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-4xl text-slate-500">🏁</span>
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">No Rallies Available</h3>
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
      case 'active': return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      case 'completed': return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30'
    }
  }

  const getRegistrationStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'closed': return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
      case 'full': return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'expired': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30'
    }
  }

  const formatDaysUntil = (days: number) => {
    if (days < 0) return 'Past event'
    if (days === 0) return 'Today'
    if (days === 1) return 'Tomorrow'
    if (days < 7) return `${days} days`
    if (days < 30) return `${Math.ceil(days / 7)} weeks`
    return `${Math.ceil(days / 30)} months`
  }

  const handleViewDetails = (rally: TransformedRally) => {
    if (onViewDetails) {
      onViewDetails(rally)
    } else {
      setSelectedRally(rally)
    }
  }

  const handleRegister = (rally: TransformedRally, classId: string) => {
    if (onRegister) {
      onRegister(rally, classId)
    }
    setSelectedRally(null)
  }

  return (
    <>
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
              
              <div className="flex flex-col items-end space-y-2">
                {rally.is_featured && (
                  <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-full text-xs font-medium">
                    ⭐ FEATURED
                  </span>
                )}
                {rally.user_registration && (
                  <span className="px-2 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full text-xs font-medium">
                    ✅ REGISTERED
                  </span>
                )}
              </div>
            </div>

            {/* Rally Status */}
            <div className="flex items-center space-x-2 mb-4">
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(rally.status)}`}>
                {rally.status.replace('_', ' ').toUpperCase()}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getRegistrationStatusColor(rally.registrationStatus)}`}>
                REG: {rally.registrationStatus.toUpperCase()}
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
                <span className="text-blue-400 text-xs">
                  ({formatDaysUntil(rally.daysUntilEvent)})
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
                <span className={`text-xs ${rally.daysUntilRegistrationDeadline <= 3 ? 'text-red-400' : 'text-slate-400'}`}>
                  ({formatDaysUntil(rally.daysUntilRegistrationDeadline)})
                </span>
              </div>

              <div className="flex items-center space-x-2 text-sm">
                <span className="text-slate-400">👥</span>
                <span className="text-slate-300">
                  {rally.registered_participants || 0} / {rally.max_participants || '∞'} participants
                </span>
                {rally.max_participants && rally.registered_participants && (
                  <div className="flex-1 bg-slate-700 rounded-full h-2 ml-2">
                    <div 
                      className="bg-blue-500 rounded-full h-2 transition-all duration-300"
                      style={{ 
                        width: `${Math.min(100, (rally.registered_participants / rally.max_participants) * 100)}%` 
                      }}
                    ></div>
                  </div>
                )}
              </div>

              {rally.rally_events && rally.rally_events.length > 0 && (
                <div className="flex items-center space-x-2 text-sm">
                  <span className="text-slate-400">🌍</span>
                  <span className="text-slate-300">
                    {rally.rally_events.length} events, {rally.rally_events.reduce((total, event) => total + event.tracks.length, 0)} tracks
                  </span>
                </div>
              )}

              {rally.available_classes && rally.available_classes.length > 0 && (
                <div className="flex items-center space-x-2 text-sm">
                  <span className="text-slate-400">🏅</span>
                  <span className="text-slate-300">
                    {rally.available_classes.length} classes available
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

            {/* User Registration Status */}
            {rally.user_registration && (
              <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-300 text-sm font-medium">You're registered!</p>
                    <p className="text-blue-400 text-xs">
                      Class: {rally.user_registration.class_name}
                      {rally.user_registration.car_number && ` • Car #${rally.user_registration.car_number}`}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    rally.user_registration.status === 'confirmed' ? 'bg-green-500/20 text-green-400' :
                    rally.user_registration.status === 'registered' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {rally.user_registration.status.toUpperCase()}
                  </span>
                </div>
              </div>
            )}

            {/* Rally Actions */}
            <div className="flex space-x-3">
              <button 
                onClick={() => handleViewDetails(rally)}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-all duration-200"
              >
                View Details
              </button>
              
              {showRegistration && rally.canRegister && (
                <button 
                  onClick={() => handleViewDetails(rally)}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-all duration-200"
                >
                  Register
                </button>
              )}
              
              {showRegistration && !rally.canRegister && rally.registrationStatus !== 'open' && (
                <button 
                  disabled
                  className="px-4 py-2 bg-slate-600 text-slate-400 rounded-lg text-sm font-medium cursor-not-allowed"
                >
                  {rally.registrationStatus === 'full' ? 'Full' : 
                   rally.registrationStatus === 'expired' ? 'Expired' : 'Closed'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Rally Details Modal */}
      {selectedRally && (
        <RallyDetailsModal
          rally={selectedRally}
          onClose={() => setSelectedRally(null)}
          onRegister={handleRegister}
        />
      )}
    </>
  )
}

function RallyDetailsModal({ rally, onClose, onRegister }: RallyModalProps) {
  const [selectedClass, setSelectedClass] = useState<string>('')
  const [teamName, setTeamName] = useState<string>('')
  const [notes, setNotes] = useState<string>('')
  const [showRegistrationForm, setShowRegistrationForm] = useState(false)

  const handleRegistrationSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedClass && onRegister) {
      onRegister(rally, selectedClass)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-2xl border border-slate-700 w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <span className="text-blue-400 text-xl">🏁</span>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">{rally.name}</h3>
              <p className="text-slate-400">{rally.game_name} • {rally.game_type_name}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            ✕
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          
          {/* Rally Overview */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-4">
              <div>
                <h4 className="text-lg font-semibold text-white mb-3">Rally Information</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Competition Date:</span>
                    <span className="text-white">
                      {new Date(rally.competition_date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Registration Deadline:</span>
                    <span className="text-white">
                      {new Date(rally.registration_deadline).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Participants:</span>
                    <span className="text-white">
                      {rally.registered_participants || 0} / {rally.max_participants || '∞'}
                    </span>
                  </div>
                  {rally.prize_pool && rally.prize_pool > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Prize Pool:</span>
                      <span className="text-green-400 font-medium">€{rally.prize_pool}</span>
                    </div>
                  )}
                  {rally.entry_fee && rally.entry_fee > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Entry Fee:</span>
                      <span className="text-white">€{rally.entry_fee}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-lg font-semibold text-white mb-3">Status</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-slate-400">Rally Status:</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium border ${
                      rally.status === 'registration_open' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                      rally.status === 'upcoming' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                      'bg-slate-500/20 text-slate-400 border-slate-500/30'
                    }`}>
                      {rally.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-slate-400">Registration:</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium border ${
                      rally.registrationStatus === 'open' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                      rally.registrationStatus === 'full' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                      rally.registrationStatus === 'expired' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                      'bg-slate-500/20 text-slate-400 border-slate-500/30'
                    }`}>
                      {rally.registrationStatus.toUpperCase()}
                    </span>
                  </div>
                  
                  {rally.user_registration && (
                    <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                      <p className="text-blue-300 font-medium">You're registered!</p>
                      <p className="text-blue-400 text-sm">
                        Class: {rally.user_registration.class_name}
                        {rally.user_registration.team_name && ` • Team: ${rally.user_registration.team_name}`}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Rally Description */}
          {rally.description && (
            <div className="mb-8">
              <h4 className="text-lg font-semibold text-white mb-3">Description</h4>
              <p className="text-slate-300 leading-relaxed">{rally.description}</p>
            </div>
          )}

          {/* Events and Tracks */}
          {rally.rally_events && rally.rally_events.length > 0 && (
            <div className="mb-8">
              <h4 className="text-lg font-semibold text-white mb-3">
                Events & Tracks ({rally.rally_events.length} events)
              </h4>
              <div className="space-y-4">
                {rally.rally_events.map((event) => (
                  <div key={event.id} className="bg-slate-900/50 rounded-lg border border-slate-700/30 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="font-medium text-white">{event.event_name}</h5>
                      <div className="flex items-center space-x-2">
                        {event.country && (
                          <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">
                            {event.country}
                          </span>
                        )}
                        {event.surface_type && (
                          <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">
                            {event.surface_type}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {event.tracks.length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {event.tracks.map((track) => (
                          <div key={track.id} className="flex items-center justify-between p-2 bg-slate-800/50 rounded text-sm">
                            <div className="flex items-center space-x-2">
                              {track.stage_number && (
                                <span className="w-6 h-6 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center text-xs font-bold">
                                  {track.stage_number}
                                </span>
                              )}
                              <span className="text-slate-300">{track.track_name}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-xs text-slate-400">
                              {track.length_km && <span>{track.length_km}km</span>}
                              {track.is_special_stage && <span className="text-yellow-400">⭐</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Available Classes */}
          {rally.available_classes && rally.available_classes.length > 0 && (
            <div className="mb-8">
              <h4 className="text-lg font-semibold text-white mb-3">
                Available Classes ({rally.available_classes.length})
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {rally.available_classes.map((rallyClass) => (
                  <div key={rallyClass.id} className="bg-slate-900/50 rounded-lg border border-slate-700/30 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-white">{rallyClass.class_name}</h5>
                      {rallyClass.entry_fee_modifier !== 1 && (
                        <span className="text-xs text-blue-400">
                          {rallyClass.entry_fee_modifier > 1 ? '+' : ''}{((rallyClass.entry_fee_modifier - 1) * 100).toFixed(0)}% fee
                        </span>
                      )}
                    </div>
                    {rallyClass.max_participants && (
                      <p className="text-slate-400 text-sm">
                        Max participants: {rallyClass.max_participants}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Rules */}
          {rally.rules && (
            <div className="mb-8">
              <h4 className="text-lg font-semibold text-white mb-3">Rules & Information</h4>
              <div className="bg-slate-900/50 rounded-lg border border-slate-700/30 p-4">
                <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{rally.rules}</p>
              </div>
            </div>
          )}

          {/* Registration Form */}
          {rally.canRegister && !showRegistrationForm && (
            <div className="text-center">
              <button
                onClick={() => setShowRegistrationForm(true)}
                className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-all duration-200"
              >
                Register for this Rally
              </button>
            </div>
          )}

          {showRegistrationForm && rally.canRegister && (
            <div className="bg-slate-900/50 rounded-lg border border-slate-700/30 p-6">
              <h4 className="text-lg font-semibold text-white mb-4">Rally Registration</h4>
              <form onSubmit={handleRegistrationSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Select Class *
                  </label>
                  <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Choose a class...</option>
                    {rally.available_classes?.map((rallyClass) => (
                      <option key={rallyClass.class_id} value={rallyClass.class_id}>
                        {rallyClass.class_name}
                        {rallyClass.entry_fee_modifier !== 1 && 
                          ` (${rallyClass.entry_fee_modifier > 1 ? '+' : ''}${((rallyClass.entry_fee_modifier - 1) * 100).toFixed(0)}% fee)`
                        }
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Team Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your team name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="Any additional information or special requests"
                  />
                </div>

                <div className="flex space-x-4 pt-4">
                  <button
                    type="submit"
                    disabled={!selectedClass}
                    className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-50"
                  >
                    Complete Registration
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowRegistrationForm(false)}
                    className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-all duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}