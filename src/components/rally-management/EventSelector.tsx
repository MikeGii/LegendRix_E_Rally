// src/components/rally-management/EventSelector.tsx - FIXED VERSION
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
        <h3 className="text-lg font-medium text-slate-300 mb-2">Vali esmalt mäng</h3>
        <p className="text-slate-400">Palun vali mäng eelmises etapis, et näha saadaolevaid sündmusi.</p>
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-slate-400 mb-4">
          <span className="text-4xl">🏁</span>
        </div>
        <h3 className="text-lg font-medium text-slate-300 mb-2">Sündmused puuduvad</h3>
        <p className="text-slate-400">Valitud mängu jaoks ei leitud ühtegi sündmust. Palun loo esmalt sündmused mänguhalduses.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-white mb-2">Vali sündmused ja rajad</h4>
        <p className="text-slate-400 text-sm">Vali, millised sündmused ja rajad on selle ralli osa.</p>
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
          <h5 className="text-blue-300 font-medium mb-2">Valitud sündmuste kokkuvõte</h5>
          <div className="space-y-1">
            {selectedEvents.map(eventId => {
              const event = events.find(e => e.id === eventId)
              const trackCount = selectedTracks[eventId]?.length || 0
              return (
                <div key={eventId} className="flex justify-between text-sm">
                  <span className="text-slate-300">{event?.name}</span>
                  <span className="text-slate-400">{trackCount} rada(d)</span>
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
  // FIXED: Only load tracks when the event is selected AND expanded
  // This prevents loading tracks for all events simultaneously
  const shouldLoadTracks = isSelected && isExpanded
  
  const { data: tracks = [], isLoading: tracksLoading } = useEventTracks(
    shouldLoadTracks ? event.id : undefined
  )

  const handleEventToggle = () => {
    onEventToggle()
  }

  const handleToggleExpansion = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onToggleExpansion()
  }

  const handleTrackToggle = (trackId: string) => {
    onTrackToggle(trackId)
  }

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
                onChange={handleEventToggle}
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
                <span>📅 {new Date(event.created_at).toLocaleDateString()}</span>
                {/* Only show track count when we have the data */}
                {shouldLoadTracks && (
                  <span>🛣️ {tracksLoading ? '...' : tracks.length} rada(d)</span>
                )}
              </div>
            </div>
          </div>
          
          {/* Only show expansion button when event is selected */}
          {isSelected && (
            <button
              type="button"
              onClick={handleToggleExpansion}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-all duration-200"
            >
              {isExpanded ? 'Peida rajad' : 'Vali rajad'}
            </button>
          )}
        </div>
      </div>

      {/* Tracks Section - Only render when expanded and tracks are loaded */}
      {isSelected && isExpanded && (
        <div className="border-t border-slate-700/50 p-4 bg-slate-800/30">
          <h6 className="text-sm font-medium text-slate-300 mb-3">Saadaolevad rajad:</h6>
          
          {tracksLoading ? (
            <div className="text-center py-4">
              <div className="text-slate-400">Rajad laetakse...</div>
            </div>
          ) : tracks.length === 0 ? (
            <div className="text-center py-4">
              <div className="text-slate-400">Sellel sündmusel pole radu.</div>
            </div>
          ) : (
            <>
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
                      onChange={() => handleTrackToggle(track.id)}
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
                        {track.surface_type && <span className="capitalize">{track.surface_type}</span>}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
              
              <div className="mt-3 text-xs text-slate-500">
                {selectedTracks.length} / {tracks.length} rada valitud
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}