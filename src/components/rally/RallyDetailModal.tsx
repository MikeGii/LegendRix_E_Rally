// src/components/rally/RallyDetailModal.tsx - CLEANED VERSION
import { useState } from 'react'
import { Rally } from '@/types'

interface RallyDetailModalProps {
  rally: Rally | null
  onClose: () => void
  onRegister?: () => void
}

export function RallyDetailModal({ rally, onClose, onRegister }: RallyDetailModalProps) {
  if (!rally) return null

  const isRegistrationOpen = rally.status === 'registration_open'
  const isUpcoming = rally.status === 'upcoming'
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'text-blue-400 bg-blue-500/20 border-blue-500/30'
      case 'registration_open':
        return 'text-green-400 bg-green-500/20 border-green-500/30'
      case 'registration_closed':
        return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30'
      case 'active':
        return 'text-orange-400 bg-orange-500/20 border-orange-500/30'
      case 'completed':
        return 'text-purple-400 bg-purple-500/20 border-purple-500/30'
      case 'cancelled':
        return 'text-red-400 bg-red-500/20 border-red-500/30'
      default:
        return 'text-slate-400 bg-slate-500/20 border-slate-500/30'
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-2xl border border-slate-700/50 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-slate-800 border-b border-slate-700/50 p-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <span className="text-blue-400 text-xl">🏁</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{rally.name}</h2>
              <p className="text-slate-400">{rally.game_name} • {rally.game_type_name}</p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
          >
            <span className="text-slate-400 text-xl">×</span>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status and Featured Badge */}
          <div className="flex items-center space-x-3">
            <span className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(rally.status)}`}>
              {rally.status.replace('_', ' ').toUpperCase()}
            </span>
            
            {rally.is_featured && (
              <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-full text-xs font-medium">
                ⭐ FEATURED
              </span>
            )}
          </div>

          {/* Key Information Grid - CLEANED (removed entry fee and prize pool) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-700/30 rounded-xl p-4">
              <h3 className="text-sm font-medium text-slate-400 mb-2 flex items-center space-x-2">
                <span>📅</span>
                <span>Võistluse kuupäev</span>
              </h3>
              <p className="text-lg font-semibold text-white">
                {new Date(rally.competition_date).toLocaleDateString('et-EE', {
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
              <h3 className="text-sm font-medium text-slate-400 mb-2 flex items-center space-x-2">
                <span>⏰</span>
                <span>Registreerumine kuni</span>
              </h3>
              <p className="text-lg font-semibold text-white">
                {new Date(rally.registration_deadline).toLocaleDateString('et-EE', {
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>

            {rally.max_participants && (
              <div className="bg-slate-700/30 rounded-xl p-4">
                <h3 className="text-sm font-medium text-slate-400 mb-2 flex items-center space-x-2">
                  <span>👥</span>
                  <span>Max osavõtjaid</span>
                </h3>
                <p className="text-lg font-semibold text-white">{rally.max_participants}</p>
              </div>
            )}
          </div>

          {/* Game Information - CLEANED (removed platform) */}
          <div className="bg-slate-700/30 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
              <span>🎮</span>
              <span>Mäng</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-400">Mäng</p>
                <p className="text-lg font-medium text-white">{rally.game_name}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Ralli tüüp</p>
                <p className="text-lg font-medium text-white">{rally.game_type_name}</p>
              </div>
            </div>
          </div>

          {/* Description */}
          {rally.description && (
            <div>
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
                <span>ℹ️</span>
                <span>Kirjeldus</span>
              </h3>
              <div className="bg-slate-700/30 rounded-xl p-6">
                <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {rally.description}
                </p>
              </div>
            </div>
          )}

          {/* Rules */}
          {rally.rules && (
            <div>
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
                <span>📋</span>
                <span>Reeglid</span>
              </h3>
              <div className="bg-slate-700/30 rounded-xl p-6">
                <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {rally.rules}
                </p>
              </div>
            </div>
          )}

          {/* Events and Tracks Information */}
          {rally.total_events && rally.total_events > 0 && (
            <div className="bg-slate-700/30 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
                <span>🗺️</span>
                <span>Võistluse ülesehitus</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-400">Etapid</p>
                  <p className="text-lg font-medium text-white">{rally.total_events}</p>
                </div>
                {rally.total_tracks && rally.total_tracks > 0 && (
                  <div>
                    <p className="text-sm text-slate-400">Kiirusekatse lõigud kokku</p>
                    <p className="text-lg font-medium text-white">{rally.total_tracks}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Registration Section */}
          {onRegister && (isRegistrationOpen || isUpcoming) && (
            <div className="bg-gradient-to-r from-blue-500/10 to-green-500/10 border border-blue-500/20 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-3">Registreeru rallile</h3>
              <p className="text-slate-300 mb-4">
                {isRegistrationOpen 
                  ? 'Registreerimine on avatud. Kliki all olevale nupule, et end rallile registreerida.'
                  : 'Registreerimine avab varsti. Saad end registreerida kohe, kui registreerimine avaneb.'
                }
              </p>
              <button
                onClick={onRegister}
                disabled={!isRegistrationOpen}
                className={`
                  px-6 py-3 rounded-lg font-medium transition-all duration-200
                  ${isRegistrationOpen 
                    ? 'bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-500 hover:to-green-500 text-white' 
                    : 'bg-slate-600 text-slate-400 cursor-not-allowed'
                  }
                `}
              >
                {isRegistrationOpen ? 'Registreeru nüüd' : 'Registreerimine pole veel avatud'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}