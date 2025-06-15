// src/components/edetabel/RallyResultsModal.tsx
'use client'

import { useState } from 'react'
import { useApprovedRallyResults, useApprovedRallyClasses } from '@/hooks/useApprovedRallies'
import type { ApprovedRally } from '@/hooks/useApprovedRallies'

interface RallyResultsModalProps {
  rally: ApprovedRally
  isOpen: boolean
  onClose: () => void
}

export function RallyResultsModal({ rally, isOpen, onClose }: RallyResultsModalProps) {
  const [selectedClass, setSelectedClass] = useState<string>('')
  const { data: results = [], isLoading } = useApprovedRallyResults(rally.id)
  const { data: classes = [] } = useApprovedRallyClasses(rally.id)

  // Filter results by selected class
  const filteredResults = selectedClass 
    ? results.filter(r => r.class_name === selectedClass)
    : results

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('et-EE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getPodiumEmoji = (position: number) => {
    switch (position) {
      case 1: return '🥇'
      case 2: return '🥈'
      case 3: return '🥉'
      default: return ''
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-6xl bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl">
          {/* Header */}
          <div className="flex items-start justify-between p-6 border-b border-slate-700">
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold text-white mb-2">
                {rally.name}
              </h2>
              
              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400">
                <span className="flex items-center gap-1">
                  <span>📅</span>
                  {formatDate(rally.competition_date)}
                </span>
                <span className="flex items-center gap-1">
                  <span>🎮</span>
                  {rally.game_name}
                </span>
                <span className="flex items-center gap-1">
                  <span>🏁</span>
                  {rally.game_type_name}
                </span>
                <span className="flex items-center gap-1">
                  <span>👥</span>
                  {rally.total_participants} osalejat
                </span>
              </div>

              {rally.description && (
                <p className="text-slate-300 text-sm mt-3 max-w-2xl">
                  {rally.description}
                </p>
              )}
            </div>
            
            <button
              onClick={onClose}
              className="ml-4 p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <span className="text-xl">×</span>
            </button>
          </div>

          {/* Filters */}
          {classes.length > 1 && (
            <div className="p-6 border-b border-slate-700">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-slate-400 text-sm">Klass:</span>
                <button
                  onClick={() => setSelectedClass('')}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    !selectedClass
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  Kõik klassid ({results.length})
                </button>
                {classes.map((className) => {
                  const classCount = results.filter(r => r.class_name === className).length
                  return (
                    <button
                      key={className}
                      onClick={() => setSelectedClass(className)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        selectedClass === className
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                          : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700'
                      }`}
                    >
                      {className} ({classCount})
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Results Table */}
          <div className="p-6">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="inline-block w-8 h-8 border-4 border-slate-600 border-t-blue-500 rounded-full animate-spin"></div>
                <p className="text-slate-400 mt-2">Laen tulemusi...</p>
              </div>
            ) : filteredResults.length === 0 ? (
              <div className="text-center py-8">
                <span className="text-4xl mb-4 block">🏁</span>
                <p className="text-slate-400">Selles klassis tulemusi pole</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-800/50">
                    <tr>
                      <th className="text-left py-4 px-6 text-slate-400 font-medium">
                        Koht
                      </th>
                      <th className="text-left py-4 px-6 text-slate-400 font-medium">
                        Osaleja
                      </th>
                      <th className="text-left py-4 px-6 text-slate-400 font-medium">
                        Klass
                      </th>
                      <th className="text-right py-4 px-6 text-slate-400 font-medium">
                        Punktid
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredResults.map((result, index) => (
                      <tr 
                        key={result.id} 
                        className={`border-b border-slate-700/30 hover:bg-slate-800/20 transition-colors ${
                          result.overall_position <= 3 ? 'bg-gradient-to-r from-yellow-500/5 to-transparent' : ''
                        }`}
                      >
                        {/* Position */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">
                              {getPodiumEmoji(result.overall_position)}
                            </span>
                            <span className={`font-bold text-lg ${
                              result.overall_position === 1 ? 'text-yellow-400' :
                              result.overall_position === 2 ? 'text-slate-300' :
                              result.overall_position === 3 ? 'text-orange-400' :
                              'text-white'
                            }`}>
                              {result.overall_position}
                            </span>
                          </div>
                        </td>

                        {/* Participant */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                              result.overall_position === 1 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
                              result.overall_position === 2 ? 'bg-gradient-to-r from-slate-400 to-slate-500' :
                              result.overall_position === 3 ? 'bg-gradient-to-r from-orange-500 to-orange-600' :
                              'bg-slate-700'
                            }`}>
                              {result.participant_name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="text-white font-medium">
                                {result.participant_name}
                              </div>
                              {result.registration_date && (
                                <div className="text-xs text-slate-400">
                                  Registreeritud: {formatDate(result.registration_date)}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Class */}
                        <td className="py-4 px-6">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">
                            {result.class_name}
                          </span>
                        </td>

                        {/* Points */}
                        <td className="py-4 px-6 text-right">
                          <span className={`text-lg font-bold ${
                            result.overall_position === 1 ? 'text-yellow-400' :
                            result.overall_position === 2 ? 'text-slate-300' :
                            result.overall_position === 3 ? 'text-orange-400' :
                            'text-white'
                          }`}>
                            {result.total_points.toFixed(1)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-slate-700 p-6 bg-slate-800/30">
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-400">
                Tulemused kinnitatud: {formatDate(rally.approved_at)}
              </div>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
              >
                Sulge
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}