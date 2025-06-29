// src/components/rally-management/RalliesGrid.tsx - CLEANED VERSION
'use client'

import { Rally } from '@/hooks/useRallyManagement'
import { useState } from 'react'
import { AlertCircle } from 'lucide-react'

interface RalliesGridProps {
  rallies: Rally[]
  isLoading: boolean
  onCreateRally: () => void
  onEditRally: (rally: Rally) => void
  onDeleteRally: (rallyId: string) => void
}

export function RalliesGrid({ 
  rallies, 
  isLoading, 
  onCreateRally, 
  onEditRally, 
  onDeleteRally 
}: RalliesGridProps) {
  const [selectedRally, setSelectedRally] = useState<string | null>(null)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-slate-600 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading rallies...</p>
        </div>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'registration_open': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'registration_closed': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'active': return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      case 'completed': return 'bg-slate-500/20 text-slate-400 border-slate-500/30'
      case 'cancelled': return 'bg-red-500/20 text-red-400 border-red-500/30'
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Rallies ({rallies.length})</h2>
          <p className="text-slate-400">Manage rally competitions and events</p>
        </div>
        <button
          onClick={onCreateRally}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200"
        >
          + Create Rally
        </button>
      </div>

      {rallies.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl text-slate-500">🏁</span>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">No Rallies Created</h3>
          <p className="text-slate-400 mb-4">Create your first rally to get started</p>
          <button
            onClick={onCreateRally}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200"
          >
            Create First Rally
          </button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {rallies.map((rally) => (
            <div
              key={rally.id}
              className={`
                bg-slate-800/50 rounded-xl border p-6 transition-all duration-200 cursor-pointer
                ${selectedRally === rally.id 
                  ? 'border-blue-500 bg-blue-500/10' 
                  : 'border-slate-700/50 hover:border-slate-600'
                }
              `}
              onClick={() => setSelectedRally(selectedRally === rally.id ? null : rally.id)}
            >
              {/* Rally Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <span className="text-blue-400 text-lg">🏁</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{rally.name}</h3>
                    <p className="text-sm text-slate-400">{rally.game_name}</p>
                  </div>
                </div>

                {rally.is_featured && (
                  <span className="ml-2 px-2 py-1 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-full text-xs font-medium">
                    ⭐ FEATURED
                  </span>
                )}
              </div>

              {/* Rally Info - CLEANED (removed prize_pool, entry_fee) */}
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
                </div>
                
                <div className="flex items-center space-x-2 text-sm">
                  <span className="text-slate-400">⏰</span>
                  <span className="text-slate-300">
                    Registration until {new Date(rally.registration_deadline).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>

                {rally.max_participants && (
                  <div className="flex items-center space-x-2 text-sm">
                    <span className="text-slate-400">👥</span>
                    <span className="text-slate-300">
                      Max {rally.max_participants} participants
                    </span>
                  </div>
                )}

                {rally.registered_participants !== undefined && (
                  <div className="flex items-center space-x-2 text-sm">
                    <span className="text-slate-400">📊</span>
                    <span className="text-slate-300">
                      {rally.registered_participants} registered
                    </span>
                  </div>
                )}
              </div>

              {/* Status */}
              <div className="mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(rally.status)}`}>
                  {rally.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>

              {/* Description */}
              {rally.description && (
                <div className="mb-4">
                  <p className="text-sm text-slate-400 line-clamp-2">
                    {rally.description}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onEditRally(rally)
                  }}
                  className="flex-1 px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-600/30 rounded-lg text-sm font-medium transition-all duration-200"
                >
                  Edit
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    if (confirm(`Are you sure you want to delete "${rally.name}"?`)) {
                      onDeleteRally(rally.id)
                    }
                  }}
                  className="flex-1 px-3 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-600/30 rounded-lg text-sm font-medium transition-all duration-200"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}