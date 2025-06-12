// src/components/rally/RallyDetailModal.tsx - COMPLETE VERSION with All Original Content + Registration

'use client'

import { useState } from 'react'
import { TransformedRally } from '@/hooks/useOptimizedRallies'
import { RallyRegistrationsTable } from '@/components/rally/RallyRegistrationsTable'
import { RegistrationFormWithClasses } from '../registration/RegistrationFormWithClasses'

interface RallyDetailModalProps {
  rally: TransformedRally
  isOpen: boolean
  onClose: () => void
  onRegister: () => void
  isRegistrationOpen: boolean
}

export function RallyDetailModal({ 
  rally, 
  isOpen, 
  onClose, 
  onRegister, 
  isRegistrationOpen 
}: RallyDetailModalProps) {
  const [showRegistrationForm, setShowRegistrationForm] = useState(false)

  if (!isOpen) return null

  const handleRegisterClick = () => {
    setShowRegistrationForm(true)
  }

  const handleRegistrationSuccess = () => {
    setShowRegistrationForm(false)
    // Optionally refresh the modal or show success message
    alert('Registration successful!')
  }

  const handleRegistrationCancel = () => {
    setShowRegistrationForm(false)
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-2xl border border-slate-700 w-full max-w-6xl max-h-[90vh] overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">🏁</span>
            <div>
              <h3 className="text-xl font-semibold text-white">{rally.name}</h3>
              <p className="text-slate-400 text-sm">
                {rally.game_name} • {rally.game_type_name}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
            aria-label="Close"
          >
            <span className="text-slate-400 text-xl">×</span>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          
          {/* Show Registration Form if active */}
          {showRegistrationForm ? (
            <RegistrationFormWithClasses
              rallyId={rally.id}
              rallyName={rally.name}
              onSuccess={handleRegistrationSuccess}
              onCancel={handleRegistrationCancel}
            />
          ) : (
            <div className="space-y-8">
              
              {/* Rally Status Banner */}
              <div className={`rounded-xl p-4 border ${
                rally.status === 'registration_open' 
                  ? 'bg-green-500/10 border-green-500/30 text-green-400'
                  : rally.status === 'upcoming'
                  ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                  : 'bg-slate-500/10 border-slate-500/30 text-slate-400'
              }`}>
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    rally.status === 'registration_open' ? 'bg-green-400 animate-pulse' : 'bg-blue-400'
                  }`}></div>
                  <span className="font-medium capitalize">
                    {rally.status === 'registration_open' ? 'Registration Open' : 
                     rally.status === 'upcoming' ? 'Upcoming Rally' : 
                     rally.status.replace('_', ' ')}
                  </span>
                  {rally.status === 'registration_open' && (
                    <span className="text-sm opacity-75">
                      Closes {new Date(rally.registration_deadline).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  )}
                </div>
              </div>

              {/* Rally Overview Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-slate-700/30 rounded-xl p-4">
                  <h3 className="text-sm font-medium text-slate-400 mb-2">Competition Date</h3>
                  <p className="text-lg font-semibold text-white">
                    {new Date(rally.competition_date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                
                <div className="bg-slate-700/30 rounded-xl p-4">
                  <h3 className="text-sm font-medium text-slate-400 mb-2">Registration Deadline</h3>
                  <p className="text-lg font-semibold text-white">
                    {new Date(rally.registration_deadline).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                
                <div className="bg-slate-700/30 rounded-xl p-4">
                  <h3 className="text-sm font-medium text-slate-400 mb-2">Participants</h3>
                  <div className="flex items-center space-x-2">
                    <p className="text-lg font-semibold text-white">
                      {rally.registered_participants || 0} / {rally.max_participants || '∞'}
                    </p>
                    {rally.max_participants && rally.registered_participants && (
                      <div className="flex-1 bg-slate-600/50 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${Math.min((rally.registered_participants / rally.max_participants) * 100, 100)}%` 
                          }}
                        ></div>
                      </div>
                    )}
                  </div>
                </div>
                
                {rally.entry_fee && rally.entry_fee > 0 ? (
                  <div className="bg-slate-700/30 rounded-xl p-4">
                    <h3 className="text-sm font-medium text-slate-400 mb-2">Entry Fee</h3>
                    <p className="text-lg font-semibold text-green-400">€{rally.entry_fee}</p>
                  </div>
                ) : (
                  <div className="bg-slate-700/30 rounded-xl p-4">
                    <h3 className="text-sm font-medium text-slate-400 mb-2">Entry Fee</h3>
                    <p className="text-lg font-semibold text-green-400">FREE</p>
                  </div>
                )}
              </div>

              {/* Prize Pool */}
              {rally.prize_pool && rally.prize_pool > 0 && (
                <div className="bg-gradient-to-r from-yellow-500/10 to-green-500/10 border border-yellow-500/20 rounded-xl p-6">
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl">💰</span>
                    <div>
                      <h3 className="text-lg font-semibold text-white">Prize Pool</h3>
                      <p className="text-3xl font-bold text-green-400">€{rally.prize_pool}</p>
                      <p className="text-sm text-slate-400 mt-1">To be distributed among winners</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Game Information */}
              <div className="bg-slate-700/30 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
                  <span>🎮</span>
                  <span>Game Information</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-slate-400">Game</p>
                    <p className="text-lg font-medium text-white">{rally.game_name}</p>
                  </div>
                  {rally.game_platform && (
                    <div>
                      <p className="text-sm text-slate-400">Platform</p>
                      <p className="text-lg font-medium text-white">{rally.game_platform}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-slate-400">Rally Type</p>
                    <p className="text-lg font-medium text-white">{rally.game_type_name}</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              {rally.description && (
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
                    <span>📝</span>
                    <span>Description</span>
                  </h3>
                  <div className="bg-slate-700/30 rounded-xl p-6">
                    <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{rally.description}</p>
                  </div>
                </div>
              )}

              {/* Rules */}
              {rally.rules && (
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
                    <span>📋</span>
                    <span>Rules & Regulations</span>
                  </h3>
                  <div className="bg-slate-700/30 rounded-xl p-6">
                    <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{rally.rules}</p>
                  </div>
                </div>
              )}

              {/* Events & Tracks */}
              {rally.total_events && rally.total_events > 0 && (
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
                    <span>🌍</span>
                    <span>Events & Tracks</span>
                  </h3>
                  <div className="bg-slate-700/30 rounded-xl p-6">
                    {rally.events && rally.events.length > 0 ? (
                      <div className="space-y-6">
                        {/* Summary */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-4 border-b border-slate-600/50">
                          <div className="flex items-center space-x-3">
                            <span className="text-slate-400">📍</span>
                            <div>
                              <p className="text-sm text-slate-400">Total Events</p>
                              <p className="text-lg font-semibold text-white">{rally.total_events}</p>
                            </div>
                          </div>
                          
                          {rally.total_tracks && (
                            <div className="flex items-center space-x-3">
                              <span className="text-slate-400">🛤️</span>
                              <div>
                                <p className="text-sm text-slate-400">Total Tracks</p>
                                <p className="text-lg font-semibold text-white">{rally.total_tracks}</p>
                              </div>
                            </div>
                          )}

                          <div className="flex items-center space-x-3">
                            <span className="text-slate-400">⏱️</span>
                            <div>
                              <p className="text-sm text-slate-400">Total Distance</p>
                              <p className="text-lg font-semibold text-white">
                                {rally.events.reduce((total, event) => {
                                  return total + (event.tracks?.reduce((trackTotal, track) => trackTotal + (track.length_km || 0), 0) || 0)
                                }, 0).toFixed(1)} km
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        {/* Event Details */}
                        <div>
                          <h4 className="text-lg font-semibold text-white mb-4">Event Details:</h4>
                          <div className="space-y-4">
                            {rally.events.map((event, index) => (
                              <div key={index} className="bg-slate-600/30 rounded-lg p-4">
                                <div className="flex items-center space-x-3 mb-3">
                                  <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                                    <span className="text-blue-400 font-medium text-sm">#{event.event_order}</span>
                                  </div>
                                  <div>
                                    <h5 className="text-slate-200 font-semibold">{event.event_name || `Event ${index + 1}`}</h5>
                                    <p className="text-sm text-slate-400">
                                      {event.tracks?.length || 0} track{(event.tracks?.length || 0) !== 1 ? 's' : ''}
                                      {event.tracks && event.tracks.length > 0 && (
                                        <span> • {event.tracks.reduce((sum, track) => sum + (track.length_km || 0), 0).toFixed(1)} km total</span>
                                      )}
                                    </p>
                                  </div>
                                </div>
                                
                                {/* Show tracks for this event */}
                                {event.tracks && event.tracks.length > 0 && (
                                  <div className="ml-11">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                      {event.tracks.map((track, trackIndex) => (
                                        <div key={trackIndex} className="bg-slate-700/40 rounded-lg p-3">
                                          <div className="flex items-center justify-between mb-2">
                                            <span className="text-slate-300 text-sm font-medium">{track.name}</span>
                                            <span className="text-xs text-slate-400">#{track.track_order}</span>
                                          </div>
                                          <div className="flex items-center justify-between text-xs text-slate-400">
                                            <span className="px-2 py-1 bg-slate-600/50 rounded text-xs capitalize">
                                              {track.surface_type}
                                            </span>
                                            {track.length_km && (
                                              <span className="font-medium">{track.length_km} km</span>
                                            )}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="w-12 h-12 bg-slate-600/50 rounded-full flex items-center justify-center mx-auto mb-4">
                          <span className="text-2xl text-slate-400">🌍</span>
                        </div>
                        <p className="text-slate-400">Event details will be available soon</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ===== NEW: REGISTRATION TABLE SECTION ===== */}
              <div>
                <RallyRegistrationsTable rallyId={rally.id} />
              </div>

              {/* Registration Action */}
              {isRegistrationOpen && (
                <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20 rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="w-4 h-4 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-green-400 font-semibold text-lg">Registration Open</span>
                      </div>
                      <p className="text-slate-300">
                        Join this rally and compete with other participants
                      </p>
                      <p className="text-slate-400 text-sm mt-1">
                        Registration closes on {new Date(rally.registration_deadline).toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <button
                      onClick={handleRegisterClick}
                      className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold text-lg transition-all duration-200 transform hover:scale-105"
                    >
                      Register Now
                    </button>
                  </div>
                </div>
              )}

              {/* Rally Information Footer */}
              <div className="bg-slate-700/20 rounded-xl p-4 border-t-2 border-slate-600/30">
                <div className="flex items-center justify-between text-sm text-slate-400">
                  <div className="flex items-center space-x-4">
                    <span>Created: {new Date(rally.created_at).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>Updated: {new Date(rally.updated_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>Rally ID:</span>
                    <code className="bg-slate-600/50 px-2 py-1 rounded text-xs">{rally.id.split('-')[0]}</code>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}