// src/components/generate-rally/RallyGenerationModal.tsx
'use client'

import { useState, useEffect } from 'react'
import { TrackSliderGenerator } from './TrackSliderGenerator'
import { useEventTracks } from '@/hooks/useGameManagement'
import { useSaveGenerationHistory } from '@/hooks/useGenerationHistory'
import '@/styles/futuristic-theme.css'

interface RallyGenerationModalProps {
  isOpen: boolean
  onClose: () => void
  gameId: string
  gameName: string
  selectedEventIds: string[]
  eventNames: string[]
  minTrackLength: number
  maxTrackLength: number
  trackCount: number
}

interface SelectedTrack {
  id: string
  name: string
  event_name: string
  event_id: string
  length_km: number
  surface_type: string
  order: number
}

export function RallyGenerationModal({
  isOpen,
  onClose,
  gameId,
  gameName,
  selectedEventIds,
  eventNames,
  minTrackLength,
  maxTrackLength,
  trackCount
}: RallyGenerationModalProps) {
  const [currentEventIndex, setCurrentEventIndex] = useState(0)
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0)
  const [isSpinning, setIsSpinning] = useState(false)
  const [selectedTracks, setSelectedTracks] = useState<SelectedTrack[]>([])
  const [usedTrackIds, setUsedTrackIds] = useState<string[]>([])
  const [availableTracks, setAvailableTracks] = useState<any[]>([])
  const [isComplete, setIsComplete] = useState(false)
  
  // Hook to save generation history
  const saveHistoryMutation = useSaveGenerationHistory()
  
  // Load tracks for current event
  const { data: eventTracks = [] } = useEventTracks(
    selectedEventIds[currentEventIndex] || ''
  )
  
  const totalTracksToGenerate = selectedEventIds.length * trackCount
  const currentGlobalIndex = currentEventIndex * trackCount + currentTrackIndex
  
  // Filter tracks by length when event tracks change
  useEffect(() => {
    if (eventTracks.length > 0) {
      const filtered = eventTracks.filter(track => 
        track.length_km >= minTrackLength && 
        track.length_km <= maxTrackLength &&
        track.is_active
      )
      setAvailableTracks(filtered)
    }
  }, [eventTracks, minTrackLength, maxTrackLength])
  
  // Reset when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentEventIndex(0)
      setCurrentTrackIndex(0)
      setSelectedTracks([])
      setUsedTrackIds([])
      setIsComplete(false)
    }
  }, [isOpen])
  
  // Handle track selection
  const handleTrackSelected = (track: any) => {
    const selected: SelectedTrack = {
      ...track,
      event_id: selectedEventIds[currentEventIndex],
      event_name: eventNames[currentEventIndex],
      order: currentGlobalIndex + 1
    }
    
    const updatedTracks = [...selectedTracks, selected]
    setSelectedTracks(updatedTracks)
    setUsedTrackIds(prev => [...prev, track.id])
    setIsSpinning(false)
    
    // Move to next track/event
    setTimeout(() => {
      if (currentTrackIndex < trackCount - 1) {
        // Next track for same event
        setCurrentTrackIndex(prev => prev + 1)
      } else if (currentEventIndex < selectedEventIds.length - 1) {
        // Next event - reset used tracks for new event
        setCurrentEventIndex(prev => prev + 1)
        setCurrentTrackIndex(0)
        setUsedTrackIds([]) // Reset for new event
      } else {
        // All done!
        setIsComplete(true)
        saveGenerationHistory(updatedTracks)
      }
    }, 1000)
  }
  
  // Save generation history
  const saveGenerationHistory = async (finalTracks: SelectedTrack[]) => {
    try {
      await saveHistoryMutation.mutateAsync({
        gameId: gameId,
        gameName: gameName,
        eventCount: selectedEventIds.length,
        trackCountPerEvent: trackCount,
        totalTracks: finalTracks.length,
        minTrackLength: minTrackLength,
        maxTrackLength: maxTrackLength,
        selectedEvents: selectedEventIds.map((id, idx) => ({
          event_id: id,
          event_name: eventNames[idx]
        })),
        selectedTracks: finalTracks.map(track => ({
          track_id: track.id,
          track_name: track.name,
          event_name: track.event_name,
          length_km: track.length_km
        }))
      })
    } catch (error) {
      console.error('Error saving generation history:', error)
    }
  }
  
  // Start spinning
  const handleSpin = () => {
    if (availableTracks.length > 0) {
      setIsSpinning(true)
    }
  }
  
  // Auto-spin for next track
  useEffect(() => {
    if (!isComplete && availableTracks.length > 0 && !isSpinning && currentGlobalIndex < totalTracksToGenerate) {
      const timer = setTimeout(() => {
        handleSpin()
      }, 1500)
      
      return () => clearTimeout(timer)
    }
  }, [currentGlobalIndex, availableTracks, isSpinning, isComplete])
  
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/90 backdrop-blur-md"
        onClick={!isSpinning ? onClose : undefined}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-4xl max-h-[90vh] flex">
        <div className="relative w-full tech-border rounded-2xl shadow-[0_0_50px_rgba(255,0,64,0.3)] bg-black/95 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="relative bg-gradient-to-r from-red-900/20 to-black p-6 border-b border-red-500/20">
            <div className="scan-line"></div>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white font-['Orbitron'] uppercase tracking-wider">
                  Rally Genereerimine
                </h2>
                <p className="text-red-400/80 text-sm font-medium mt-1">
                  {gameName} • {selectedEventIds.length} riiki • {trackCount} rada/riik
                </p>
              </div>
              {!isSpinning && !isComplete && (
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
          
          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {!isComplete ? (
              <div className="space-y-6">
                {/* Current Event Info */}
                <div className="text-center mb-4">
                  <p className="text-sm text-gray-500 font-['Orbitron'] uppercase tracking-wider mb-1">
                    Praegune riik
                  </p>
                  <p className="text-xl font-bold text-white font-['Orbitron']">
                    {eventNames[currentEventIndex]}
                  </p>
                </div>
                
                {/* Spinner */}
                {availableTracks.length > 0 ? (
                  <TrackSliderGenerator
                    tracks={availableTracks}
                    isSpinning={isSpinning}
                    onSpinComplete={handleTrackSelected}
                    currentTrackIndex={currentGlobalIndex}
                    totalTracks={totalTracksToGenerate}
                    usedTrackIds={usedTrackIds}
                  />
                ) : (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-gray-900/50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-800">
                      <span className="text-gray-500 text-3xl">📏</span>
                    </div>
                    <p className="text-gray-400 mb-2">Sobivaid radu ei leitud</p>
                    <p className="text-sm text-gray-500">
                      {eventNames[currentEventIndex]} riigis pole {minTrackLength}-{maxTrackLength} km pikkuseid radu
                    </p>
                  </div>
                )}
                
                {/* Selected Tracks List */}
                {selectedTracks.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-sm font-semibold text-white font-['Orbitron'] uppercase tracking-wider mb-3">
                      Valitud rajad ({selectedTracks.length})
                    </h3>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {selectedTracks.map((track, index) => (
                        <div key={index} className="flex items-center space-x-3 bg-gray-900/50 rounded-lg px-3 py-2 text-sm">
                          <span className="text-gray-500 font-['Orbitron']">{index + 1}.</span>
                          <span className="text-white flex-1">{track.name}</span>
                          <span className="text-gray-400">{track.event_name}</span>
                          <span className="text-purple-400">{track.length_km} km</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-green-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-green-500/30 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
                  <span className="text-green-400 text-4xl">✓</span>
                </div>
                <h3 className="text-2xl font-bold text-white font-['Orbitron'] mb-2">
                  Rally Genereeritud!
                </h3>
                <p className="text-gray-400 mb-6">
                  {selectedTracks.length} rada valitud {selectedEventIds.length} riigist
                </p>
                
                {/* Final track list */}
                <div className="bg-gray-900/30 rounded-xl p-4 mb-6 max-h-60 overflow-y-auto">
                  {selectedTracks.map((track, index) => (
                    <div key={index} className="flex items-center space-x-3 py-2 border-b border-gray-800 last:border-0 text-sm">
                      <span className="text-gray-500 font-['Orbitron'] w-8">{index + 1}.</span>
                      <span className="text-white flex-1 text-left">{track.name}</span>
                      <span className="text-gray-400">{track.event_name}</span>
                      <span className="text-purple-400">{track.length_km} km</span>
                    </div>
                  ))}
                </div>
                
                <button
                  onClick={onClose}
                  className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg font-bold font-['Orbitron'] uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(34,197,94,0.5)]"
                >
                  Valmis
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}