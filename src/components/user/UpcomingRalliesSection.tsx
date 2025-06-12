// src/components/user/UpcomingRalliesSection.tsx
'use client'

import { useState } from 'react'
import { TransformedRally } from '@/hooks/useOptimizedRallies'
import { RallyDetailModal } from '@/components/rally/RallyDetailModal'

interface UpcomingRalliesSectionProps {
  rallies: TransformedRally[]
  isLoading: boolean
  canAccessRallies: boolean
}

export function UpcomingRalliesSection({ rallies, isLoading, canAccessRallies }: UpcomingRalliesSectionProps) {
  const [selectedRally, setSelectedRally] = useState<TransformedRally | null>(null)

  if (!canAccessRallies) return null

  // Sort rallies by rally date (competition_date)
  const sortedRallies = [...rallies].sort((a, b) => {
    return new Date(a.competition_date).getTime() - new Date(b.competition_date).getTime()
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'registration_open': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'registration_closed': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30'
    }
  }

  const isRegistrationOpen = (rally: TransformedRally) => {
    const now = new Date()
    const deadline = new Date(rally.registration_deadline)
    return rally.status === 'registration_open' || 
           (rally.status === 'upcoming' && deadline > now)
  }

  const handleRegister = (rally: TransformedRally) => {
    // TODO: Implement registration functionality
    console.log('Register for rally:', rally.name)
    alert(`Registration for ${rally.name} coming soon!`)
  }

  const handleShowMore = (rally: TransformedRally) => {
    setSelectedRally(rally)
  }

  return (
    <>
      <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center space-x-3">
            <span>🏁</span>
            <span>Upcoming Rallies</span>
          </h2>
          
          {sortedRallies.length > 0 && (
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200">
              View All Rallies
            </button>
          )}
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-slate-600 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-400">Loading upcoming rallies...</p>
            </div>
          </div>
        ) : sortedRallies.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl text-slate-500">🏁</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">No Upcoming Rallies</h3>
            <p className="text-slate-400">
              Check back soon for new rally announcements!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedRallies.map((rally) => (
              <div
                key={rally.id}
                className="bg-slate-800/30 backdrop-blur-xl rounded-xl border border-slate-700/50 p-6 hover:bg-slate-800/40 transition-all duration-200"
              >
                <div className="flex items-center justify-between">
                  {/* Rally Info Row */}
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                    {/* Rally Name & Status */}
                    <div className="md:col-span-1">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                          <span className="text-blue-400 text-lg">🏁</span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-white text-sm">{rally.name}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(rally.status)}`}>
                            {rally.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Game Name */}
                    <div className="md:col-span-1">
                      <div className="text-center md:text-left">
                        <p className="text-sm text-slate-400">Game</p>
                        <p className="text-sm font-medium text-slate-300">{rally.game_name}</p>
                      </div>
                    </div>

                    {/* Game Type */}
                    <div className="md:col-span-1">
                      <div className="text-center md:text-left">
                        <p className="text-sm text-slate-400">Type</p>
                        <p className="text-sm font-medium text-slate-300">{rally.game_type_name}</p>
                      </div>
                    </div>

                    {/* Competition Date */}
                    <div className="md:col-span-1">
                      <div className="text-center md:text-left">
                        <p className="text-sm text-slate-400">Competition Date</p>
                        <p className="text-sm font-medium text-slate-300">
                          {new Date(rally.competition_date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>

                    {/* Registration Deadline */}
                    <div className="md:col-span-1">
                      <div className="text-center md:text-left">
                        <p className="text-sm text-slate-400">Registration Deadline</p>
                        <p className="text-sm font-medium text-slate-300">
                          {new Date(rally.registration_deadline).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-3 ml-6">
                    {isRegistrationOpen(rally) ? (
                      <button 
                        onClick={() => handleRegister(rally)}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-all duration-200"
                      >
                        Registreeri
                      </button>
                    ) : (
                      <button 
                        disabled
                        className="px-4 py-2 bg-slate-600 text-slate-400 rounded-lg text-sm font-medium cursor-not-allowed"
                      >
                        Registreerimine suletud
                      </button>
                    )}
                    
                    <button 
                      onClick={() => handleShowMore(rally)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-all duration-200"
                    >
                      Näita rohkem
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Rally Detail Modal */}
      {selectedRally && (
        <RallyDetailModal
          rally={selectedRally}
          isOpen={!!selectedRally}
          onClose={() => setSelectedRally(null)}
          onRegister={() => handleRegister(selectedRally)}
          isRegistrationOpen={isRegistrationOpen(selectedRally)}
        />
      )}
    </>
  )
}