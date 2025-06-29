// src/components/generate-rally/TrackSliderGenerator.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import '@/styles/futuristic-theme.css'

interface Track {
  id: string
  name: string
  event_name: string
  length_km: number
}

interface TrackSliderGeneratorProps {
  tracks: Track[]
  isSpinning: boolean
  onSpinComplete: (selectedTrack: Track) => void
  currentTrackIndex: number
  totalTracks: number
  usedTrackIds: string[]
}

export function TrackSliderGenerator({ 
  tracks, 
  isSpinning, 
  onSpinComplete,
  currentTrackIndex,
  totalTracks,
  usedTrackIds
}: TrackSliderGeneratorProps) {
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null)
  const [availableTracks, setAvailableTracks] = useState<Track[]>([])
  const [slidePosition, setSlidePosition] = useState(0)
  const [displayTracks, setDisplayTracks] = useState<Track[]>([])
  const [isAnimating, setIsAnimating] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const slideDuration = 3500 // 3.5 seconds
  
  // Filter out already used tracks
  useEffect(() => {
    const unused = tracks.filter(track => !usedTrackIds.includes(track.id))
    setAvailableTracks(unused)
  }, [tracks, usedTrackIds])
  
  // Create extended track list for smooth sliding
  useEffect(() => {
    if (availableTracks.length === 0) return
    
    // Create a repeated list for smooth infinite scroll effect
    const extended: Track[] = []
    // We need enough tracks to make a smooth scroll
    const minTracks = 50
    const repeatCount = Math.ceil(minTracks / availableTracks.length)
    
    for (let i = 0; i < repeatCount; i++) {
      extended.push(...availableTracks.map((track, idx) => ({
        ...track,
        _index: i * availableTracks.length + idx
      })))
    }
    
    setDisplayTracks(extended)
    // Start from middle of the extended list
    setSlidePosition(-(extended.length / 2) * 200)
  }, [availableTracks])
  
  // Handle sliding animation
  useEffect(() => {
    if (isSpinning && availableTracks.length > 0 && !isAnimating) {
      setIsAnimating(true)
      setSelectedTrack(null)
      
      // Select random track from available tracks
      const randomIndex = Math.floor(Math.random() * availableTracks.length)
      const targetTrack = availableTracks[randomIndex]
      
      // Find the position of this track in the middle section of display tracks
      const middleStart = Math.floor(displayTracks.length / 2)
      const targetDisplayIndex = middleStart + randomIndex
      
      // Calculate slide distance to center this track
      const itemWidth = 200 // Width of each track item (192px + 8px margin)
      const currentCenterIndex = -slidePosition / itemWidth
      const slideDistance = (currentCenterIndex - targetDisplayIndex) * itemWidth
      
      // Add some extra sliding for effect (3-5 full cycles through available tracks)
      const extraSlides = (3 + Math.floor(Math.random() * 3)) * availableTracks.length
      const totalSlideDistance = slideDistance - (extraSlides * itemWidth)
      
      setSlidePosition(prev => prev + totalSlideDistance)
      
      // Set selected track after animation completes
      setTimeout(() => {
        setSelectedTrack(targetTrack)
        setIsAnimating(false)
        onSpinComplete(targetTrack)
      }, slideDuration)
    }
  }, [isSpinning, availableTracks, displayTracks, slidePosition, isAnimating])
  
  if (availableTracks.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 bg-gray-900/50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-800">
          <span className="text-gray-500 text-3xl">❌</span>
        </div>
        <p className="text-gray-400 mb-2">Kõik sobivad rajad on juba valitud</p>
        <p className="text-sm text-gray-500">
          Selles riigis pole rohkem saadaolevaid radu
        </p>
      </div>
    )
  }

  // Calculate which track is currently centered
  const getCenteredTrackIndex = () => {
    if (!isAnimating && selectedTrack) {
      return -1 // Use selectedTrack instead
    }
    const itemWidth = 200
    const centerPosition = -slidePosition / itemWidth
    return Math.round(centerPosition)
  }

  const centeredIndex = getCenteredTrackIndex()

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      {/* Progress Indicator */}
      <div className="text-center mb-8">
        <p className="text-sm text-gray-400 font-['Orbitron'] uppercase tracking-wider">
          Rada {currentTrackIndex + 1} / {totalTracks}
        </p>
        <div className="w-full bg-gray-900 rounded-full h-2 mt-2 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-red-600 to-red-400 h-2 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(239,68,68,0.6)]"
            style={{ width: `${((currentTrackIndex + 1) / totalTracks) * 100}%` }}
          />
        </div>
      </div>
      
      {/* Slider Container */}
      <div className="relative h-32 mb-20">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black pointer-events-none z-10"></div>
        
        {/* Center selector */}
        <div className="absolute top-0 bottom-0 left-1/2 transform -translate-x-1/2 z-20 flex items-center">
          <div className="relative">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-red-500 blur-2xl opacity-40 scale-150 animate-pulse"></div>
            {/* Selector lines */}
            <div className="relative w-1 h-32 bg-gradient-to-b from-red-500 via-red-400 to-red-500 shadow-[0_0_20px_rgba(239,68,68,0.8)]">
              {/* Top arrow */}
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[16px] border-b-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]"></div>
              </div>
              {/* Bottom arrow */}
              <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2">
                <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[16px] border-t-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]"></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Track slider */}
        <div 
          ref={containerRef}
          className="absolute top-0 left-0 right-0 h-full overflow-hidden"
        >
          <div 
            className="flex items-center h-full transition-transform"
            style={{
              transform: `translateX(${slidePosition}px)`,
              transitionDuration: isAnimating ? `${slideDuration}ms` : '0ms',
              transitionTimingFunction: isAnimating ? 'cubic-bezier(0.25, 0.1, 0.25, 1)' : 'ease',
              paddingLeft: '50%',
              paddingRight: '50%'
            }}
          >
            {displayTracks.map((track, index) => {
              const actualTrack = availableTracks.find(t => t.id === track.id) || track
              const isSelected = !isAnimating && selectedTrack && actualTrack.id === selectedTrack.id
              const isCentered = index === centeredIndex
              
              return (
                <div
                  key={`${track.id}-${index}`}
                  className={`
                    flex-shrink-0 w-48 mx-1 px-4 py-3 rounded-xl transition-all duration-300 border-2 relative
                    ${isSelected
                      ? 'bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700/50 scale-110 z-10'
                      : isCentered && isAnimating
                      ? 'bg-gradient-to-br from-gray-700/60 to-gray-800/60 border-gray-600 scale-105'
                      : 'bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700/50 hover:border-gray-600'
                    }
                  `}
                >
                  {/* Green highlight frame for selected track */}
                  {isSelected && (
                    <div className="absolute inset-0 rounded-xl border-2 border-green-500 shadow-[0_0_30px_rgba(34,197,94,0.6)] pointer-events-none animate-pulse"></div>
                  )}
                  
                  <h3 className={`
                    font-bold text-sm font-['Orbitron'] mb-1 truncate transition-colors
                    ${isSelected ? 'text-white' : 'text-gray-300'}
                  `}>
                    {actualTrack.name}
                  </h3>
                  <p className={`
                    text-xs transition-colors
                    ${isSelected ? 'text-green-400' : 'text-gray-500'}
                  `}>
                    {actualTrack.event_name}
                  </p>
                  <p className={`
                    text-xs font-['Orbitron'] transition-colors
                    ${isSelected ? 'text-green-300' : 'text-gray-400'}
                  `}>
                    {actualTrack.length_km} km
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
      
      {/* Selected track display */}
      {!isAnimating && selectedTrack && (
        <div className="text-center animate-fadeIn">
          <div className="inline-block bg-gradient-to-br from-gray-900 to-black rounded-xl px-8 py-4 border-2 border-green-500/70 shadow-[0_0_40px_rgba(34,197,94,0.6)]">
            <p className="text-xs text-gray-400 font-['Orbitron'] uppercase tracking-wider mb-2">Valitud rada</p>
            <p className="text-white font-bold font-['Orbitron'] text-xl mb-1">
              {selectedTrack.name}
            </p>
            <p className="text-sm text-gray-400">
              {selectedTrack.event_name} • {selectedTrack.length_km} km
            </p>
          </div>
        </div>
      )}
    </div>
  )
}