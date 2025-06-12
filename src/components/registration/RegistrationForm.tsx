// src/components/registration/RegistrationForm.tsx
'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { useUpcomingRallies } from '@/hooks/useOptimizedRallies'
import { TransformedRally } from '@/hooks/useOptimizedRallies'

interface RegistrationFormProps {
  preselectedRallyId?: string | null
  onRallySelect: (rally: TransformedRally) => void
  onRegistrationComplete: () => void
}

interface Game {
  id: string
  name: string
  platform?: string
}

export function RegistrationForm({ 
  preselectedRallyId, 
  onRallySelect, 
  onRegistrationComplete 
}: RegistrationFormProps) {
  const { user } = useAuth()
  const { data: allRallies = [], isLoading: isLoadingRallies } = useUpcomingRallies(50)

  const [selectedGameId, setSelectedGameId] = useState<string>('')
  const [selectedRallyId, setSelectedRallyId] = useState<string>(preselectedRallyId || '')
  const [availableRallies, setAvailableRallies] = useState<TransformedRally[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Extract unique games from rallies
  const availableGames: Game[] = allRallies.reduce((games: Game[], rally) => {
    if (!games.find(g => g.id === rally.rally_game_id)) {
      games.push({
        id: rally.rally_game_id || '',
        name: rally.game_name || 'Unknown Game',
        platform: rally.game_platform
      })
    }
    return games
  }, [])

  // Filter rallies by selected game and registration status
  useEffect(() => {
    if (selectedGameId) {
      const now = new Date()
      const filteredRallies = allRallies.filter(rally => {
        const isCorrectGame = rally.rally_game_id === selectedGameId
        const isRegistrationOpen = rally.status === 'registration_open' || rally.status === 'upcoming'
        const deadlineNotPassed = new Date(rally.registration_deadline) > now
        
        return isCorrectGame && isRegistrationOpen && deadlineNotPassed
      })
      
      setAvailableRallies(filteredRallies)
    } else {
      setAvailableRallies([])
    }
  }, [selectedGameId, allRallies])

  // Handle preselected rally
  useEffect(() => {
    if (preselectedRallyId && allRallies.length > 0) {
      const preselectedRally = allRallies.find(r => r.id === preselectedRallyId)
      if (preselectedRally) {
        setSelectedGameId(preselectedRally.rally_game_id || '')
        setSelectedRallyId(preselectedRallyId)
        onRallySelect(preselectedRally)
      }
    }
  }, [preselectedRallyId, allRallies]) // Removed onRallySelect from dependencies

  // Handle rally selection
  useEffect(() => {
    if (selectedRallyId && availableRallies.length > 0) {
      const selectedRally = availableRallies.find(r => r.id === selectedRallyId)
      if (selectedRally) {
        onRallySelect(selectedRally)
      }
    }
  }, [selectedRallyId, availableRallies]) // Removed onRallySelect from dependencies

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedRallyId) {
      alert('Palun valige ralli, millele registreeruda')
      return
    }

    setIsSubmitting(true)
    
    try {
      // TODO: Implement actual registration API call
      console.log('Registering user for rally:', {
        userId: user?.id,
        rallyId: selectedRallyId,
        gameId: selectedGameId
      })
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      alert('Registreerimine õnnestus!')
      onRegistrationComplete()
      
    } catch (error) {
      console.error('Registration failed:', error)
      alert('Registreerimine ebaõnnestus. Palun proovige uuesti.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8">
      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Step 1: Game Selection */}
        <div>
          <label className="block text-lg font-semibold text-white mb-4">
            1. Vali mäng
          </label>
          
          {isLoadingRallies ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-4 border-slate-600 border-t-blue-500 rounded-full animate-spin"></div>
              <span className="ml-3 text-slate-400">Laen mänge...</span>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {availableGames.map(game => (
                <button
                  key={game.id}
                  type="button"
                  onClick={() => setSelectedGameId(game.id)}
                  className={`p-4 rounded-xl border transition-all duration-200 text-left ${
                    selectedGameId === game.id
                      ? 'bg-blue-600/20 border-blue-500 text-white'
                      : 'bg-slate-700/30 border-slate-600 text-slate-300 hover:bg-slate-700/50 hover:border-slate-500'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <span className="text-blue-400 text-lg">🎮</span>
                    </div>
                    <div>
                      <h3 className="font-semibold">{game.name}</h3>
                      {game.platform && (
                        <p className="text-sm text-slate-400">{game.platform}</p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Step 2: Rally Selection */}
        {selectedGameId && (
          <div>
            <label className="block text-lg font-semibold text-white mb-4">
              2. Vali ralli
            </label>
            
            {availableRallies.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl text-slate-500">🏁</span>
                </div>
                <p className="text-slate-400">Sellele mängule pole tulevasi rallisid saadaval.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {availableRallies.map(rally => {
                  const isRegistrationClosingSoon = new Date(rally.registration_deadline).getTime() - Date.now() < 24 * 60 * 60 * 1000
                  
                  return (
                    <button
                      key={rally.id}
                      type="button"
                      onClick={() => setSelectedRallyId(rally.id)}
                      className={`w-full p-6 rounded-xl border transition-all duration-200 text-left ${
                        selectedRallyId === rally.id
                          ? 'bg-green-600/20 border-green-500'
                          : 'bg-slate-700/30 border-slate-600 hover:bg-slate-700/50 hover:border-slate-500'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <h3 className="text-lg font-semibold text-white">{rally.name}</h3>
                            {isRegistrationClosingSoon && (
                              <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded text-xs font-medium">
                                Sulgub varsti
                              </span>
                            )}
                          </div>
                          
                          <div className="grid md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="text-slate-400">Võistluse kuupäev</p>
                              <p className="text-slate-300 font-medium">
                                {new Date(rally.competition_date).toLocaleDateString('et-EE', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </p>
                            </div>
                            
                            <div>
                              <p className="text-slate-400">Registreerimise tähtaeg</p>
                              <p className="text-slate-300 font-medium">
                                {new Date(rally.registration_deadline).toLocaleDateString('et-EE', {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                            
                            <div>
                              <p className="text-slate-400">Osalejad</p>
                              <p className="text-slate-300 font-medium">
                                {rally.registered_participants || 0} / {rally.max_participants || '∞'}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="ml-4">
                          {selectedRallyId === rally.id ? (
                            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs">✓</span>
                            </div>
                          ) : (
                            <div className="w-6 h-6 border-2 border-slate-500 rounded-full"></div>
                          )}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Submit Button */}
        {selectedRallyId && (
          <div className="pt-6 border-t border-slate-700">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 disabled:from-slate-600 disabled:to-slate-700 text-white rounded-xl font-bold text-lg transition-all duration-300 shadow-xl hover:shadow-green-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center space-x-3">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Registreerin...</span>
                </div>
              ) : (
                'Lõpeta registreerimine'
              )}
            </button>
          </div>
        )}
      </form>
    </div>
  )
}