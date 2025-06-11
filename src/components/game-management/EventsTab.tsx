// src/components/game-management/EventsTab.tsx
import { useState } from 'react'
import { Game, GameEvent, useCreateGameEvent, useEventTracks } from '@/hooks/useGameManagement'
import { CreateGameEventModal } from './CreateGameEventModal'
import { EventTracksModal } from './EventTracksModal'

interface EventsTabProps {
  events: GameEvent[]
  selectedGame: Game | undefined
  isLoading: boolean
  onRefresh: () => void
}

export function EventsTab({ events, selectedGame, isLoading, onRefresh }: EventsTabProps) {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<GameEvent | null>(null)
  const createGameEventMutation = useCreateGameEvent()

  const handleCreateGameEvent = async (eventData: Partial<GameEvent>) => {
    if (!selectedGame) return
    
    try {
      await createGameEventMutation.mutateAsync({
        ...eventData,
        game_id: selectedGame.id
      })
      setShowCreateModal(false)
    } catch (error) {
      console.error('Failed to create game event:', error)
    }
  }

  if (!selectedGame) {
    return (
      <div className="text-center py-16">
        <div className="w-24 h-24 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-4xl text-slate-500">🌍</span>
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">No Game Selected</h3>
        <p className="text-slate-400">Please select a game first to manage its events</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-slate-600 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading game events...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-white flex items-center space-x-2">
          <span>🌍</span>
          <span>Events for {selectedGame.name} ({events.length})</span>
        </h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-green-500/25"
        >
          <div className="flex items-center space-x-2">
            <span>➕</span>
            <span>Add Event</span>
          </div>
        </button>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl text-slate-500">🌍</span>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">No Events</h3>
          <p className="text-slate-400 mb-6">Add events like Rally Estonia, Rally Croatia, etc.</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-all duration-200"
          >
            Add First Event
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <div key={event.id} className="bg-slate-900/50 rounded-xl border border-slate-700/30 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                    <span className="text-green-300 text-xl">🌍</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{event.name}</h3>
                    <p className="text-sm text-slate-400">{event.country}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedEvent(event)}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-all duration-200"
                >
                  {event.tracks?.length || 0} Tracks
                </button>
              </div>

              {event.description && (
                <p className="text-slate-300 text-sm mb-4">{event.description}</p>
              )}

              <div className="space-y-2 text-sm">
                {event.surface_type && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Surface:</span>
                    <span className="text-slate-300 capitalize">{event.surface_type}</span>
                  </div>
                )}
                {event.difficulty_level && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Difficulty:</span>
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <span
                          key={level}
                          className={`w-3 h-3 rounded-full ${
                            level <= event.difficulty_level!
                              ? 'bg-yellow-400'
                              : 'bg-slate-600'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-400">Status:</span>
                  <span className={`${event.is_active ? 'text-green-400' : 'text-red-400'}`}>
                    {event.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreateModal && (
        <CreateGameEventModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateGameEvent}
          isLoading={createGameEventMutation.isPending}
        />
      )}

      {selectedEvent && (
        <EventTracksModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </div>
  )
}