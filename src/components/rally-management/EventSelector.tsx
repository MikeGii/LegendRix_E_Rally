// src/components/rally-management/EventSelector.tsx - Fixed version
import { useState } from 'react'
import { GameEvent, useEventTracks } from '@/hooks/useGameManagement'

interface EventSelectorProps {
  events: GameEvent[]
  selectedEvents: string[]
  selectedTracks: { [eventId: string]: string[] }
  onEventToggle: (eventId: string) => void
  onTrackToggle: (eventId: string, trackId: string) => void
  gameId: string
}

export function EventSelector({ 
  events, 
  selectedEvents, 
  selectedTracks, 
  onEventToggle, 
  onTrackToggle,
  gameId 
}: EventSelectorProps) {
  const [expandedEvents, setExpandedEvents] = useState<string[]>([])

  const toggleEventExpansion = (eventId: string) => {
    setExpandedEvents(prev => 
      prev.includes(eventId) 
        ? prev.filter(id => id !== eventId)
        : [...prev, eventId]
    )
  }

  if (!gameId) {
    return (
      <div className="text-center py-12">
        <div className="text-slate-400 mb-4">
          <span className="text-4xl">🎮</span>
        </div>
        <h3 className="text-lg font-medium text-slate-300 mb-2">Select a Game First</h3>
        <p className="text-slate-400">Please select a game in the previous step to see available events.</p>
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-slate-400 mb-4">
          <span className="text-4xl">🏁</span>
        </div>
        <h3 className="text-lg font-medium text-slate-300 mb-2">No Events Available</h3>
        <p className="text-slate-400">No events found for the selected game. Please create events first in Game Management.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-white mb-2">Select Events & Tracks</h4>
        <p className="text-slate-400 text-sm">Choose which events and tracks will be part of this rally.</p>
      </div>

      <div className="space-y-4">
        {events.map(event => (
          <EventCard
            key={event.id}
            event={event}
            isSelected={selectedEvents.includes(event.id)}
            selectedTracks={selectedTracks[event.id] || []}
            isExpanded={expandedEvents.includes(event.id)}
            onEventToggle={() => onEventToggle(event.id)}
            onTrackToggle={(trackId) => onTrackToggle(event.id, trackId)}
            onToggleExpansion={() => toggleEventExpansion(event.id)}
          />
        ))}
      </div>

      {selectedEvents.length > 0 && (
        <div className="mt-6 p-4 bg-blue-600/20 border border-blue-500/30 rounded-xl">
          <h5 className="text-blue-300 font-medium mb-2">Selected Events Summary</h5>
          <div className="space-y-1">
            {selectedEvents.map(eventId => {
              const event = events.find(e => e.id === eventId)
              const trackCount = selectedTracks[eventId]?.length || 0
              return (
                <div key={eventId} className="flex justify-between text-sm">
                  <span className="text-slate-300">{event?.name}</span>
                  <span className="text-slate-400">{trackCount} tracks</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

interface EventCardProps {
  event: GameEvent
  isSelected: boolean
  selectedTracks: string[]
  isExpanded: boolean
  onEventToggle: () => void
  onTrackToggle: (trackId: string) => void
  onToggleExpansion: () => void
}

function EventCard({
  event,
  isSelected,
  selectedTracks,
  isExpanded,
  onEventToggle,
  onTrackToggle,
  onToggleExpansion
}: EventCardProps) {
  const { data: tracks = [] } = useEventTracks(event.id)

  return (
    <div className={`border-2 rounded-xl transition-all duration-200 ${
      isSelected 
        ? 'bg-green-500/10 border-green-500/30' 
        : 'bg-slate-900/50 border-slate-700/50'
    }`}>
      {/* Event Header */}
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={onEventToggle}
                className="sr-only"
              />
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                isSelected 
                  ? 'bg-green-600 border-green-600' 
                  : 'border-slate-600'
              }`}>
                {isSelected && (
                  <span className="text-white text-xs">✓</span>
                )}
              </div>
            </label>
            
            <div>
              <h5 className="font-semibold text-white">{event.name}</h5>
              <div className="flex items-center space-x-4 text-sm text-slate-400">
                {event.country && <span>📍 {event.country}</span>}
                {event.surface_type && <span>🏁 {event.surface_type}</span>}
                <span>🛣️ {tracks.length} tracks</span>
              </div>
            </div>
          </div>
          
          {isSelected && tracks.length > 0 && (
            <button
              type="button"
              onClick={onToggleExpansion}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-all duration-200"
            >
              {isExpanded ? 'Hide Tracks' : 'Select Tracks'}
            </button>
          )}
        </div>

        {event.description && (
          <p className="mt-2 text-sm text-slate-400">{event.description}</p>
        )}
      </div>

      {/* Tracks Section */}
      {isSelected && isExpanded && tracks.length > 0 && (
        <div className="border-t border-slate-700/50 p-4 bg-slate-800/30">
          <h6 className="text-sm font-medium text-slate-300 mb-3">Available Tracks:</h6>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {tracks.map(track => (
              <label
                key={track.id}
                className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedTracks.includes(track.id)
                    ? 'bg-blue-600/20 border-blue-500/30'
                    : 'bg-slate-900/50 border-slate-700/30 hover:border-slate-600'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedTracks.includes(track.id)}
                  onChange={() => onTrackToggle(track.id)}
                  className="sr-only"
                />
                <div className={`w-4 h-4 rounded border flex items-center justify-center mr-3 ${
                  selectedTracks.includes(track.id)
                    ? 'bg-blue-600 border-blue-600'
                    : 'border-slate-600'
                }`}>
                  {selectedTracks.includes(track.id) && (
                    <span className="text-white text-xs">✓</span>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate">
                    {track.name}
                  </div>
                  <div className="flex items-center space-x-3 text-xs text-slate-400">
                    {track.length_km && <span>{track.length_km}km</span>}
                    {track.surface_type && <span>{track.surface_type}</span>}
                    {track.stage_number && <span>Stage {track.stage_number}</span>}
                  </div>
                </div>
              </label>
            ))}
          </div>
          
          <div className="mt-3 text-xs text-slate-500">
            {selectedTracks.length} of {tracks.length} tracks selected
          </div>
        </div>
      )}
    </div>
  )
}