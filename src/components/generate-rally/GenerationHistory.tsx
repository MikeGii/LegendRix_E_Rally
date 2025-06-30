// src/components/generate-rally/GenerationHistory.tsx
'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/AuthProvider'
import { useMutation } from '@tanstack/react-query'
import '@/styles/futuristic-theme.css'

interface GenerationRecord {
  id: string
  game_name: string
  event_count: number
  track_count_per_event: number
  total_tracks: number
  min_track_length: number
  max_track_length: number
  selected_events: Array<{ event_id: string; event_name: string }>
  selected_tracks: Array<{ 
    track_id: string; 
    track_name: string; 
    event_name: string; 
    length_km: number 
  }>
  created_at: string
}

export function GenerationHistory({ refreshKey }: { refreshKey?: number }) {
  const { user } = useAuth()
  const [history, setHistory] = useState<GenerationRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [expandedRecord, setExpandedRecord] = useState<string | null>(null)

  // Load generation history
  useEffect(() => {
    if (user?.id) {
      loadHistory()
    }
  }, [user?.id, refreshKey]) // Add refreshKey to dependencies

  const loadHistory = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('rally_generation_history')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(5)

      if (error) throw error
      setHistory(data || [])
    } catch (error) {
      console.error('Error loading generation history:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Delete generation record mutation
  const deleteGenerationMutation = useMutation({
    mutationFn: async (recordId: string) => {
      const { error } = await supabase
        .from('rally_generation_history')
        .delete()
        .eq('id', recordId)
        .eq('user_id', user?.id)

      if (error) throw error
      return recordId
    },
    onSuccess: () => {
      loadHistory()
    },
    onError: (error) => {
      console.error('Error deleting generation record:', error)
      alert('Viga kirje kustutamisel')
    }
  })

  const handleDelete = async (recordId: string) => {
    if (window.confirm('Kas oled kindel, et soovid selle genereerimise ajaloo kustutada?')) {
      deleteGenerationMutation.mutate(recordId)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('et-EE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const toggleExpand = (recordId: string) => {
    setExpandedRecord(expandedRecord === recordId ? null : recordId)
  }

  if (isLoading) {
    return (
      <div className="tech-border rounded-2xl shadow-[0_0_30px_rgba(255,0,64,0.2)] bg-black/90 backdrop-blur-xl overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-3 border-gray-800 border-t-red-500 rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="tech-border rounded-2xl shadow-[0_0_30px_rgba(255,0,64,0.2)] bg-black/90 backdrop-blur-xl overflow-hidden">
      {/* Header */}
      <div className="relative bg-gradient-to-r from-gray-900/20 to-black p-4 border-b border-gray-700/20">
        <div className="scan-line"></div>
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-gray-600 to-gray-800 rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(156,163,175,0.4)]">
            <span className="text-white text-lg">📜</span>
          </div>
          <div>
            <h2 className="text-lg font-bold text-white font-['Orbitron'] uppercase tracking-wider">
              Genereerimise ajalugu
            </h2>
            <p className="text-gray-400/80 text-xs font-medium">Viimased 5 genereerimist</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {history.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-900/50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-800">
              <span className="text-gray-500 text-2xl">📭</span>
            </div>
            <p className="text-gray-400">Genereerimise ajalugu on tühi</p>
            <p className="text-sm text-gray-500 mt-1">Genereeri oma esimene ralli!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((record) => (
              <div
                key={record.id}
                className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 rounded-lg border border-gray-700/50 hover:border-gray-600 transition-all"
              >
                {/* Summary Row */}
                <div
                  className="p-4 cursor-pointer"
                  onClick={() => toggleExpand(record.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-2">
                        <h3 className="font-bold text-white font-['Orbitron']">
                          {record.game_name}
                        </h3>
                        <span className="text-xs text-gray-500">
                          {formatDate(record.created_at)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-6 text-sm">
                        <div className="flex items-center space-x-2">
                          <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></div>
                          <span className="text-gray-400">{record.event_count} riiki</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                          <span className="text-gray-400">{record.min_track_length}-{record.max_track_length} km</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                          <span className="text-gray-400">{record.track_count_per_event} rada/riik</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                          <span className="text-gray-400">Kokku: {record.total_tracks} rada</span>
                        </div>
                      </div>
                    </div>
                    <div className="ml-4 flex items-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(record.id)
                        }}
                        disabled={deleteGenerationMutation.isPending}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Kustuta kirje"
                      >
                        <span className="text-xl">🗑️</span>
                      </button>
                      <div className={`transform transition-transform duration-200 ${expandedRecord === record.id ? 'rotate-180' : ''}`}>
                        <span className="text-gray-400 text-xl">⌄</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedRecord === record.id && (
                  <div className="border-t border-gray-700/50 p-4 space-y-3">
                    {/* Selected Events */}
                    <div>
                      <p className="text-xs text-gray-500 font-['Orbitron'] uppercase tracking-wider mb-2">
                        Valitud riigid ({record.selected_events.length})
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {record.selected_events.map((event, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded font-['Orbitron']"
                          >
                            {event.event_name}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Selected Tracks */}
                    <div>
                      <p className="text-xs text-gray-500 font-['Orbitron'] uppercase tracking-wider mb-2">
                        Genereeritud rajad ({record.selected_tracks.length})
                      </p>
                      <div className="max-h-40 overflow-y-auto space-y-1">
                        {record.selected_tracks.map((track, idx) => (
                          <div key={idx} className="flex items-center space-x-3 text-xs">
                            <span className="text-gray-600 font-['Orbitron']">{idx + 1}.</span>
                            <span className="text-gray-300 flex-1">{track.track_name}</span>
                            <span className="text-gray-500">{track.event_name}</span>
                            <span className="text-purple-400">{track.length_km} km</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}