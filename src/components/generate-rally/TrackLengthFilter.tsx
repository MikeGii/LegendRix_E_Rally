// src/components/generate-rally/TrackLengthFilter.tsx
'use client'

import { useState, useEffect, useRef, MouseEvent } from 'react'
import '@/styles/futuristic-theme.css'

interface TrackLengthFilterProps {
  minLength: number
  maxLength: number
  trackCount: number
  onLengthChange: (min: number, max: number) => void
  onTrackCountChange: (count: number) => void
}

export function TrackLengthFilter({ 
  minLength, 
  maxLength,
  trackCount,
  onLengthChange,
  onTrackCountChange
}: TrackLengthFilterProps) {
  // Local state for smooth slider interaction
  const [localMin, setLocalMin] = useState(minLength)
  const [localMax, setLocalMax] = useState(maxLength)
  const [localTrackCount, setLocalTrackCount] = useState(trackCount)
  const [activeThumb, setActiveThumb] = useState<'min' | 'max' | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  
  // Refs for slider elements
  const sliderRef = useRef<HTMLDivElement>(null)
  const minThumbRef = useRef<HTMLDivElement>(null)
  const maxThumbRef = useRef<HTMLDivElement>(null)
  
  // Constants
  const MIN_VALUE = 1
  const MAX_VALUE = 50
  const MIN_GAP = 2 // Minimum gap between min and max
  
  // Update parent component when values change
  useEffect(() => {
    const timer = setTimeout(() => {
      onLengthChange(localMin, localMax)
    }, 300) // Debounce for smooth interaction
    
    return () => clearTimeout(timer)
  }, [localMin, localMax])

  // Update track count
  useEffect(() => {
    onTrackCountChange(localTrackCount)
  }, [localTrackCount])
  
  // Calculate percentage for visual positioning
  const getPercent = (value: number) => ((value - MIN_VALUE) / (MAX_VALUE - MIN_VALUE)) * 100
  
  // Handle mouse down on thumbs
  const handleThumbMouseDown = (thumb: 'min' | 'max') => (e: MouseEvent) => {
    e.preventDefault()
    setActiveThumb(thumb)
    setIsDragging(true)
  }
  
  // Handle mouse move
  useEffect(() => {
    const handleMouseMove = (e: globalThis.MouseEvent) => {
      if (!isDragging || !activeThumb || !sliderRef.current) return
      
      const rect = sliderRef.current.getBoundingClientRect()
      const percent = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100))
      const value = Math.round(MIN_VALUE + (percent / 100) * (MAX_VALUE - MIN_VALUE))
      
      if (activeThumb === 'min') {
        const newMin = Math.min(value, localMax - MIN_GAP)
        setLocalMin(Math.max(MIN_VALUE, newMin))
      } else {
        const newMax = Math.max(value, localMin + MIN_GAP)
        setLocalMax(Math.min(MAX_VALUE, newMax))
      }
    }
    
    const handleMouseUp = () => {
      setIsDragging(false)
      setActiveThumb(null)
    }
    
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, activeThumb, localMin, localMax])
  
  // Handle track click
  const handleTrackClick = (e: MouseEvent<HTMLDivElement>) => {
    if (!sliderRef.current || e.target === minThumbRef.current || e.target === maxThumbRef.current) return
    
    const rect = sliderRef.current.getBoundingClientRect()
    const percent = ((e.clientX - rect.left) / rect.width) * 100
    const value = Math.round(MIN_VALUE + (percent / 100) * (MAX_VALUE - MIN_VALUE))
    
    // Determine which thumb to move based on proximity
    const minDist = Math.abs(value - localMin)
    const maxDist = Math.abs(value - localMax)
    
    if (minDist < maxDist) {
      setLocalMin(Math.min(value, localMax - MIN_GAP))
    } else {
      setLocalMax(Math.max(value, localMin + MIN_GAP))
    }
  }
  
  // Direct input handlers
  const handleMinInput = (value: string) => {
    const num = parseInt(value) || MIN_VALUE
    if (num >= MIN_VALUE && num < localMax) {
      setLocalMin(num)
    }
  }
  
  const handleMaxInput = (value: string) => {
    const num = parseInt(value) || MAX_VALUE
    if (num <= MAX_VALUE && num > localMin) {
      setLocalMax(num)
    }
  }
  
  const minPercent = getPercent(localMin)
  const maxPercent = getPercent(localMax)

  return (
    <div className="tech-border rounded-2xl shadow-[0_0_30px_rgba(255,0,64,0.2)] bg-black/90 backdrop-blur-xl overflow-hidden">
      {/* Header with scan line effect */}
      <div className="relative bg-gradient-to-r from-purple-900/20 to-black p-4 border-b border-purple-500/20">
        <div className="scan-line"></div>
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-purple-800 rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(147,51,234,0.4)]">
            <span className="text-white text-lg">📏</span>
          </div>
          <div>
            <h2 className="text-lg font-bold text-white font-['Orbitron'] uppercase tracking-wider">
              Raja parameetrid
            </h2>
            <p className="text-purple-400/80 text-xs font-medium">Määra raja pikkused ja radade arv</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Track Count Selection */}
        <div className="mb-6 pb-6 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white font-['Orbitron'] uppercase tracking-wider mb-1">
                Radade arv
              </h3>
              <p className="text-xs text-gray-500">Mitu rada genereeritakse iga riigi kohta</p>
            </div>
            
            {/* Track Count Buttons */}
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map((count) => (
                <button
                  key={count}
                  onClick={() => setLocalTrackCount(count)}
                  className={`
                    w-10 h-10 rounded-lg font-bold font-['Orbitron'] transition-all duration-200
                    ${localTrackCount === count
                      ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.6)] scale-110'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white hover:scale-105'
                    }
                  `}
                >
                  {count}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {/* Track Length Selection */}
        <div>
          <h3 className="text-sm font-semibold text-white font-['Orbitron'] uppercase tracking-wider mb-4">
            Raja pikkus
          </h3>
          
          {/* Current Values Display with Input Fields */}
          <div className="flex justify-between items-center mb-6">
            <div className="text-center">
              <div className="text-xs text-gray-500 font-['Orbitron'] uppercase tracking-wider mb-1">Miinimum</div>
              <div className="bg-gray-900/50 rounded-lg px-3 py-2 border border-gray-800 hover:border-purple-500/50 transition-colors group">
                <input
                  type="number"
                  min={MIN_VALUE}
                  max={localMax - MIN_GAP}
                  value={localMin}
                  onChange={(e) => handleMinInput(e.target.value)}
                  className="w-16 text-2xl font-bold text-purple-400 font-['Orbitron'] bg-transparent text-center outline-none"
                />
                <span className="text-sm text-gray-400 ml-1">km</span>
              </div>
            </div>
            
            <div className="flex-1 flex items-center justify-center px-6">
              <div className="text-gray-600 font-['Orbitron'] text-2xl">—</div>
            </div>
            
            <div className="text-center">
              <div className="text-xs text-gray-500 font-['Orbitron'] uppercase tracking-wider mb-1">Maksimum</div>
              <div className="bg-gray-900/50 rounded-lg px-3 py-2 border border-gray-800 hover:border-purple-500/50 transition-colors group">
                <input
                  type="number"
                  min={localMin + MIN_GAP}
                  max={MAX_VALUE}
                  value={localMax}
                  onChange={(e) => handleMaxInput(e.target.value)}
                  className="w-16 text-2xl font-bold text-purple-400 font-['Orbitron'] bg-transparent text-center outline-none"
                />
                <span className="text-sm text-gray-400 ml-1">km</span>
              </div>
            </div>
          </div>

          {/* Single Dual Range Slider */}
          <div className="mb-6">
            <div 
              ref={sliderRef}
              className="relative h-2 cursor-pointer"
              onClick={handleTrackClick}
            >
              {/* Background Track */}
              <div className="absolute w-full h-2 bg-gray-800 rounded-full"></div>
              
              {/* Active Range Highlight */}
              <div 
                className="absolute h-2 bg-gradient-to-r from-purple-600 to-purple-400 rounded-full shadow-[0_0_10px_rgba(147,51,234,0.6)]"
                style={{
                  left: `${minPercent}%`,
                  width: `${maxPercent - minPercent}%`
                }}
              />
              
              {/* Min Thumb */}
              <div
                ref={minThumbRef}
                className={`
                  absolute w-6 h-6 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full 
                  shadow-[0_0_15px_rgba(147,51,234,0.8)] cursor-grab transition-transform
                  ${activeThumb === 'min' ? 'scale-125 z-20' : 'hover:scale-110 z-10'}
                  ${isDragging && activeThumb === 'min' ? 'cursor-grabbing' : ''}
                `}
                style={{ 
                  left: `${minPercent}%`,
                  top: '-8px',
                  transform: `translateX(-50%) ${activeThumb === 'min' ? 'scale(1.25)' : ''}`
                }}
                onMouseDown={handleThumbMouseDown('min')}
                title={`Minimum: ${localMin} km`}
              >
                {/* Inner dot for better visibility */}
                <div className="absolute inset-2 bg-white rounded-full opacity-80"></div>
              </div>
              
              {/* Max Thumb */}
              <div
                ref={maxThumbRef}
                className={`
                  absolute w-6 h-6 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full 
                  shadow-[0_0_15px_rgba(147,51,234,0.8)] cursor-grab transition-transform
                  ${activeThumb === 'max' ? 'scale-125 z-20' : 'hover:scale-110 z-10'}
                  ${isDragging && activeThumb === 'max' ? 'cursor-grabbing' : ''}
                `}
                style={{ 
                  left: `${maxPercent}%`,
                  top: '-8px',
                  transform: `translateX(-50%) ${activeThumb === 'max' ? 'scale(1.25)' : ''}`
                }}
                onMouseDown={handleThumbMouseDown('max')}
                title={`Maximum: ${localMax} km`}
              >
                {/* Inner dot for better visibility */}
                <div className="absolute inset-2 bg-white rounded-full opacity-80"></div>
              </div>
            </div>
          </div>

          {/* Scale Markers */}
          <div className="flex justify-between text-xs text-gray-500 font-['Orbitron'] mb-4 px-1">
            <span>1</span>
            <span>10</span>
            <span>20</span>
            <span>30</span>
            <span>40</span>
            <span>50 km</span>
          </div>

          {/* Quick Select Buttons */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => { setLocalMin(1); setLocalMax(10); }}
              className="px-3 py-2 bg-gray-900/50 hover:bg-purple-900/30 border border-gray-800 hover:border-purple-500/50 rounded-lg text-xs font-['Orbitron'] text-gray-400 hover:text-purple-400 transition-all uppercase tracking-wider group"
            >
              <span className="block group-hover:scale-105 transition-transform">Lühikesed</span>
              <span className="text-[10px] text-gray-600 group-hover:text-purple-500">1-10 km</span>
            </button>
            <button
              onClick={() => { setLocalMin(5); setLocalMax(20); }}
              className="px-3 py-2 bg-gray-900/50 hover:bg-purple-900/30 border border-gray-800 hover:border-purple-500/50 rounded-lg text-xs font-['Orbitron'] text-gray-400 hover:text-purple-400 transition-all uppercase tracking-wider group"
            >
              <span className="block group-hover:scale-105 transition-transform">Keskmised</span>
              <span className="text-[10px] text-gray-600 group-hover:text-purple-500">5-20 km</span>
            </button>
            <button
              onClick={() => { setLocalMin(10); setLocalMax(50); }}
              className="px-3 py-2 bg-gray-900/50 hover:bg-purple-900/30 border border-gray-800 hover:border-purple-500/50 rounded-lg text-xs font-['Orbitron'] text-gray-400 hover:text-purple-400 transition-all uppercase tracking-wider group"
            >
              <span className="block group-hover:scale-105 transition-transform">Pikad</span>
              <span className="text-[10px] text-gray-600 group-hover:text-purple-500">10-50 km</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}