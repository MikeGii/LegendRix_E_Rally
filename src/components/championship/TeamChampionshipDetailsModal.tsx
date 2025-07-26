// src/components/championship/TeamChampionshipDetailsModal.tsx
'use client'

import { useState, useEffect } from 'react'
import { useTeamChampionshipResults } from '@/hooks/useTeamChampionshipManagement'
import { supabase } from '@/lib/supabase'

interface TeamChampionshipDetailsModalProps {
  championshipId: string
  onClose: () => void
  onSuccess: () => void
}

export function TeamChampionshipDetailsModal({ 
  championshipId, 
  onClose, 
  onSuccess 
}: TeamChampionshipDetailsModalProps) {
  const [championship, setChampionship] = useState<any>(null)
  const [selectedClass, setSelectedClass] = useState<string>('all')
  const { data: results = [], isLoading } = useTeamChampionshipResults(championshipId)

  useEffect(() => {
    loadChampionshipDetails()
  }, [championshipId])

  const loadChampionshipDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('championships')
        .select(`
          *,
          game:games(name),
          game_type:game_types(name),
          championship_rallies(
            rally:rallies(name, competition_date)
          )
        `)
        .eq('id', championshipId)
        .single()

      if (error) throw error
      setChampionship(data)
    } catch (error) {
      console.error('Error loading championship details:', error)
    }
  }

  // Get unique classes from results
  const uniqueClasses = Array.from(new Set(results.map(r => r.class_name))).sort()

  // Filter results by selected class
  const filteredResults = selectedClass === 'all' 
    ? results 
    : results.filter(r => r.class_name === selectedClass)

  // Group results by class for display
  const resultsByClass = filteredResults.reduce((acc, result) => {
    if (!acc[result.class_name]) {
      acc[result.class_name] = []
    }
    acc[result.class_name].push(result)
    return acc
  }, {} as Record<string, typeof results>)

  if (!championship) return null

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-2xl border border-slate-700 w-full max-w-7xl max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="bg-slate-900 border-b border-slate-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">{championship.name}</h2>
              <p className="text-slate-400 mt-1">
                Tiimide meistrivõistluse tulemused
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Championship Info */}
          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            <div className="flex items-center space-x-2 text-slate-300">
              <span>📅</span>
              <span>Hooaeg: {championship.season_year}</span>
            </div>
            {championship.game?.name && (
              <div className="flex items-center space-x-2 text-slate-300">
                <span>🎮</span>
                <span>{championship.game.name}</span>
              </div>
            )}
            <div className="flex items-center space-x-2 text-slate-300">
              <span>🏁</span>
              <span>Rallisid: {championship.championship_rallies?.length || 0}</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-300">
              <span>👥</span>
              <span>Tiime: {results.length}</span>
            </div>
          </div>

          {/* Class Filter */}
          <div className="mt-4 flex gap-2 flex-wrap">
            <button
              onClick={() => setSelectedClass('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedClass === 'all'
                  ? 'bg-red-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              Kõik klassid ({results.length})
            </button>
            {uniqueClasses.map(className => (
              <button
                key={className}
                onClick={() => setSelectedClass(className)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedClass === className
                    ? 'bg-red-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {className} ({results.filter(r => r.class_name === className).length})
              </button>
            ))}
          </div>
        </div>

        {/* Results Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-250px)]">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
            </div>
          ) : filteredResults.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-slate-300 mb-2">
                Tulemusi ei leitud
              </h3>
              <p className="text-slate-400">
                See meistrivõistlus ei ole veel tulemusi
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(resultsByClass).map(([className, classResults]) => (
                <div key={className}>
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <span className="mr-2">🏆</span>
                    {className}
                  </h3>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-700">
                          <th className="px-4 py-3 text-left text-sm font-medium text-slate-400">Koht</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-slate-400">Tiim</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-slate-400">Rallisid</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-slate-400">Keskm. liikmeid</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-slate-400">Punktid</th>
                          {/* Rally columns */}
                          {championship.championship_rallies?.map((cr: any, idx: number) => (
                            <th key={cr.rally.id} className="px-4 py-3 text-center text-sm font-medium text-slate-400">
                              {idx + 1}. etapp
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700/50">
                        {classResults
                          .sort((a, b) => a.class_position - b.class_position)
                          .map((result) => (
                            <tr key={result.team_id} className="hover:bg-slate-700/20 transition-colors">
                              <td className="px-4 py-3">
                                <div className={`font-semibold ${
                                  result.class_position === 1 ? 'text-yellow-400' :
                                  result.class_position === 2 ? 'text-gray-300' :
                                  result.class_position === 3 ? 'text-orange-400' :
                                  'text-white'
                                }`}>
                                  {result.class_position}.
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <div className="font-medium text-white">{result.team_name}</div>
                              </td>
                              <td className="px-4 py-3 text-slate-300">
                                {result.rallies_participated}
                              </td>
                              <td className="px-4 py-3 text-slate-300">
                                {result.avg_participating_members}
                              </td>
                              <td className="px-4 py-3">
                                <div className="font-semibold text-red-400">
                                  {result.total_points}
                                </div>
                              </td>
                              {/* Rally results */}
                              {championship.championship_rallies?.map((cr: any) => {
                                const rallyResult = result.rally_scores.find(
                                  rs => rs.rally_id === cr.rally.id
                                )
                                return (
                                  <td key={cr.rally.id} className="px-4 py-3 text-center">
                                    {rallyResult ? (
                                      <div>
                                        <div className="font-medium text-white">
                                          {rallyResult.points}
                                        </div>
                                        <div className="text-xs text-slate-400">
                                          {rallyResult.position}. koht
                                        </div>
                                      </div>
                                    ) : (
                                      <span className="text-slate-500">-</span>
                                    )}
                                  </td>
                                )
                              })}
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-900 border-t border-slate-700 p-6">
          <div className="flex justify-between items-center">
            <div className="text-sm text-slate-400">
              {championship.is_active ? (
                <span className="flex items-center text-green-400">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                  Aktiivne meistrivõistlus
                </span>
              ) : (
                <span className="flex items-center text-orange-400">
                  <span className="w-2 h-2 bg-orange-400 rounded-full mr-2"></span>
                  Ootab kinnitamist
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium transition-colors"
            >
              Sulge
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}