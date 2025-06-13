// src/components/rally/RallyRegistrationsTable.tsx - Fixed version
import React from 'react'
import { useRallyRegistrations } from '@/hooks/useRallyRegistrations'

interface RallyRegistrationsTableProps {
  rallyId: string
}

export function RallyRegistrationsTable({ rallyId }: RallyRegistrationsTableProps) {
  const { data: registrations = [], isLoading } = useRallyRegistrations(rallyId)
  
  if (isLoading) {
    return (
      <div className="bg-slate-700/30 rounded-xl p-6">
        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-4 border-slate-600 border-t-blue-500 rounded-full animate-spin"></div>
          <span className="ml-3 text-slate-400">Loading registrations...</span>
        </div>
      </div>
    )
  }

  if (registrations.length === 0) {
    return (
      <div className="bg-slate-700/30 rounded-xl p-6">
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-slate-600/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl text-slate-400">👥</span>
          </div>
          <h4 className="text-lg font-semibold text-white mb-2">No Registrations Yet</h4>
          <p className="text-slate-400">Be the first to register for this rally!</p>
        </div>
      </div>
    )
  }

  // Group registrations by class - Fix the type issue
  const registrationsByClass = registrations.reduce((acc, reg) => {
    const className = reg.class_name || 'Unknown Class'
    if (!acc[className]) {
      acc[className] = []
    }
    acc[className].push(reg)
    return acc
  }, {} as Record<string, Array<typeof registrations[0]>>)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'text-green-400 bg-green-400/20'
      case 'registered': return 'text-blue-400 bg-blue-400/20'
      case 'cancelled': return 'text-red-400 bg-red-400/20'
      case 'disqualified': return 'text-orange-400 bg-orange-400/20'
      case 'completed': return 'text-purple-400 bg-purple-400/20'
      default: return 'text-slate-400 bg-slate-400/20'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-white flex items-center space-x-2">
          <span>👥</span>
          <span>Registered Participants ({registrations.length})</span>
        </h3>
      </div>
      
      {Object.entries(registrationsByClass).map(([className, classRegistrations]) => {
        // Type assertion to fix TypeScript error
        const typedRegistrations = classRegistrations as Array<typeof registrations[0]>
        
        return (
        <div key={className} className="bg-slate-700/30 rounded-xl overflow-hidden">
          <div className="bg-slate-600/40 px-6 py-3 border-b border-slate-600/50">
            <h4 className="text-lg font-semibold text-white flex items-center space-x-2">
              <span>🎯</span>
              <span>{className}</span>
              <span className="text-sm font-normal text-slate-400">({typedRegistrations.length} participants)</span>
            </h4>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-600/20">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Player Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Registered
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Car Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Team
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-600/30">
                {typedRegistrations.map((registration) => (
                  <tr key={registration.id} className="hover:bg-slate-600/20 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                          <span className="text-blue-400 text-sm font-medium">
                            {(registration.user_player_name || registration.user_name || 'Unknown').charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          {/* Show only player name (no real name displayed) */}
                          <div className="text-sm font-medium text-white">
                            🎮 {registration.user_player_name || registration.user_name || 'Player name not set'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(registration.status)}`}>
                        {registration.status.charAt(0).toUpperCase() + registration.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                      {new Date(registration.registration_date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                      {registration.car_number ? `#${registration.car_number}` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                      {registration.team_name || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        )
      })}
    </div>
  )
}