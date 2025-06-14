// src/components/user/UserRegistrationsSection.tsx - FIXED VERSION (mutation properties)
'use client'

import { UserRallyRegistration } from '@/hooks/useOptimizedRallies'
import { useDeleteRegistration, useUpdateRegistration } from '@/hooks/useRallyRegistrations'
import { useState } from 'react'

interface UserRegistrationsSectionProps {
  registrations: UserRallyRegistration[]
  isLoading: boolean
}

export function UserRegistrationsSection({ registrations, isLoading }: UserRegistrationsSectionProps) {
  const [selectedRegistration, setSelectedRegistration] = useState<string | null>(null)
  const deleteRegistrationMutation = useDeleteRegistration()
  const updateRegistrationMutation = useUpdateRegistration()

  if (isLoading) {
    return (
      <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-slate-600 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-400">Loading your registrations...</p>
          </div>
        </div>
      </div>
    )
  }

  if (registrations.length === 0) {
    return (
      <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl text-slate-500">📝</span>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">No Rally Registrations</h3>
          <p className="text-slate-400">
            You haven't registered for any rallies yet. Check out the featured rallies to get started!
          </p>
        </div>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'registered': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'confirmed': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'cancelled': return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'completed': return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30'
    }
  }

  const handleCancelRegistration = async (registrationId: string) => {
    try {
      await deleteRegistrationMutation.mutateAsync(registrationId)
      console.log('Registration cancelled successfully')
    } catch (error) {
      console.error('Failed to cancel registration:', error)
    }
  }

  const canCancelRegistration = (registration: UserRallyRegistration) => {
    if (!registration.rally_competition_date) return false
    
    const competitionDate = new Date(registration.rally_competition_date)
    const now = new Date()
    
    // Allow cancellation if competition is more than 24 hours away
    return competitionDate.getTime() - now.getTime() > 24 * 60 * 60 * 1000 && 
           registration.status === 'registered'
  }

  return (
    <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center space-x-3">
          <span>📝</span>
          <span>Your Rally Registrations</span>
        </h2>
        
        <div className="bg-blue-500/20 border border-blue-500/30 rounded-xl px-3 py-1">
          <span className="text-blue-300 text-sm font-medium">{registrations.length} active</span>
        </div>
      </div>

      <div className="space-y-4">
        {registrations.map((registration) => (
          <div
            key={registration.id}
            className="bg-slate-700/30 rounded-xl border border-slate-600/50 p-6 hover:bg-slate-700/40 transition-all duration-200"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {/* Rally Info */}
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <span className="text-blue-400 text-lg">🏁</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{registration.rally_name}</h3>
                    <p className="text-sm text-slate-400">{registration.class_name}</p>
                  </div>
                </div>

                {/* Registration Details - CLEANED (removed notes, car_number, team_name) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-slate-400">Registered:</span>
                    <p className="text-slate-300 font-medium">
                      {new Date(registration.registration_date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                  
                  {registration.rally_competition_date && (
                    <div>
                      <span className="text-slate-400">Competition:</span>
                      <p className="text-slate-300 font-medium">
                        {new Date(registration.rally_competition_date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  )}

                  <div>
                    <span className="text-slate-400">Rally Status:</span>
                    <p className="text-slate-300 font-medium capitalize">
                      {registration.rally_status?.replace('_', ' ') || 'Unknown'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Status and Actions */}
              <div className="flex flex-col items-end space-y-3">
                {/* Registration Status */}
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(registration.status)}`}>
                  {registration.status.toUpperCase()}
                </span>

                {/* Actions - FIXED mutation property */}
                {canCancelRegistration(registration) && (
                  <button
                    onClick={() => handleCancelRegistration(registration.id)}
                    disabled={deleteRegistrationMutation.isPending}
                    className="px-3 py-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-600/30 rounded-lg text-xs font-medium transition-all duration-200 disabled:opacity-50"
                  >
                    {deleteRegistrationMutation.isPending ? 'Cancelling...' : 'Cancel'}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="mt-6 pt-6 border-t border-slate-600/50">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-white">{registrations.length}</p>
            <p className="text-sm text-slate-400">Total Registrations</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-400">
              {registrations.filter(r => r.status === 'registered').length}
            </p>
            <p className="text-sm text-slate-400">Active</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-400">
              {registrations.filter(r => r.status === 'completed').length}
            </p>
            <p className="text-sm text-slate-400">Completed</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-purple-400">
              {registrations.filter(r => r.status === 'confirmed').length}
            </p>
            <p className="text-sm text-slate-400">Confirmed</p>
          </div>
        </div>
      </div>
    </div>
  )
}