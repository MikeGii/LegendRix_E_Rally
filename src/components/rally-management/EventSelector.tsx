import { useState } from 'react'
import { GameEvent, useEventTracks } from '@/hooks/useGameManagement'

interface EventSelectorProps {
  event: GameEvent
  isSelected: boolean
  selectedTracks: string[]
  onEventToggle: () => void
  onTrackToggle: (trackId: string) => void
}

export function EventSelector({ 
  event, 
  isSelected, 
  selectedTracks, 
  onEventToggle, 
  onTrackToggle 
}: EventSelectorProps) {
  const [showTracks, setShowTracks] = useState(false)
  const { data: tracks = [] } = useEventTracks(event.id)

  const handleEventToggle = () => {
    onEventToggle()
    if (!isSelected) {
      setShowTracks(true)
    }
  }

  return (
    <div className={`border-2 rounded-xl transition-all duration-200 ${
      isSelected 
        ? 'bg-green-500/10 border-green-500/30' 
        : 'bg-slate-900/50 border-slate-700/50'
    }`}>
      {/* Event Header */}
      <div 
        className="p-4 cursor-pointer"
        onClick={handleEventToggle}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-4 h-4 rounded-full ${
              isSelected ? 'bg-green-400' : 'bg-slate-600'
            }`}></div>
            <div>
              <h5 className="font-semibold text-white">{event.name}</h5>
              <p className="text-sm text-slate-400">
                {event.surface_type} • {tracks.length} tracks available
              </p>
            </div>
          </div>
          
          {isSelected && tracks.length > 0 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setShowTracks(!showTracks)
              }}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-all duration-200"
            >
              {showTracks ? 'Hide' : 'Select'} Tracks ({selectedTracks.length}/{tracks.length})
            </button>
          )}
        </div>
      </div>

      {/* Tracks Selection */}
      {isSelected && showTracks && tracks.length > 0 && (
        <div className="px-4 pb-4 border-t border-slate-700/50">
          <div className="mt-4 space-y-2">
            <div className="flex justify-between items-center mb-3">
              <h6 className="text-sm font-medium text-slate-300">Select Tracks:</h6>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => tracks.forEach(track => onTrackToggle(track.id))}
                  className="text-xs text-blue-400 hover:text-blue-300"
                >
                  Select All
                </button>
                <button
                  type="button"
                  onClick={() => selectedTracks.forEach(trackId => onTrackToggle(trackId))}
                  className="text-xs text-red-400 hover:text-red-300"
                >
                  Clear All
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {tracks.map(track => (
                <div
                  key={track.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                    selectedTracks.includes(track.id)
                      ? 'bg-blue-500/20 border-blue-500/50 text-blue-300'
                      : 'bg-slate-800/50 border-slate-600/50 text-slate-300 hover:bg-slate-700/50'
                  }`}
                  onClick={() => onTrackToggle(track.id)}
                >
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${
                      selectedTracks.includes(track.id) ? 'bg-blue-400' : 'bg-slate-500'
                    }`}></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{track.name}</p>
                      <div className="flex items-center space-x-2 text-xs opacity-70">
                        {track.stage_number && <span>SS{track.stage_number}</span>}
                        {track.length_km && <span>{track.length_km}km</span>}
                        <span className="capitalize">{track.surface_type}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}